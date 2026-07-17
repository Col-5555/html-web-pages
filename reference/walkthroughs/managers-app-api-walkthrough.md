# Managers Backend (NestJS) — Step-by-Step Walkthrough

A second backend, this time in **NestJS**. Managers use it to create and manage their
challenges. It's a *separate* app from the Express `coders-app-api`, but deliberately not
an island: it talks to the **same MongoDB Atlas database** and trusts tokens minted by the
Express login endpoint (same `JWT_SECRET`). This is the walkthrough for the
[Managers Backend with NestJS](../Project%20Managers%20Backend%20With%20Nestjs.pdf) brief,
built in two phases.

## Where it sits

| | coders-app-api | managers-app-api |
| --- | --- | --- |
| Framework | Express 5 (JS) | **NestJS** (TS) |
| Port | 4000 | **4100** |
| Auth | issues the JWT (login) | **verifies** that JWT |
| Database | \_\_\_\_\_\_\_\_\_\_ one shared Atlas database \_\_\_\_\_\_\_\_\_\_ | |

## Phase 1 — Scaffold + Challenges CRUD

**Scaffolding.** `nest new managers-app-api` gives the standard layout (`main.ts`,
`app.module.ts`, a module/controller/service split). Two global settings in `main.ts` set
the tone:

```ts
app.enableCors();                                   // the Next.js dashboard will call this
app.useGlobalPipes(new ValidationPipe({
  whitelist: true, forbidNonWhitelisted: true, transform: true,   // DTOs are enforced everywhere
}));
await app.listen(process.env.PORT ?? 4100);
```

**Connecting to the shared database.** The Mongo config is read through `ConfigService`
with `forRootAsync`, not `forRoot` — the async factory runs *after* `ConfigModule` has
loaded `.env`, so `process.env.MONGODB_URI` is actually populated by the time we need it:

```ts
MongooseModule.forRootAsync({
  inject: [ConfigService],
  useFactory: (config: ConfigService) => ({
    uri: config.get<string>('MONGODB_URI'),
    dbName: config.get<string>('MONGODB_DB'),
  }),
}),
```

**The schemas are the Express ones, in Nest clothing.** `@nestjs/mongoose` builds a
Mongoose schema from a decorated class. The `Challenge` class mirrors the Express model
exactly (embedded `code`/`tests` with `{ _id: false }`, a `manager` reference, the
`difficulty` enum). Two details make the *shared* database work:

- `Challenge` pluralises to the **`challenges`** collection — the same one the Express app
  writes, so both backends see each other's challenges.
- `Manager` is bound to the **`users`** collection, because in the Express app Manager is a
  discriminator on `users`. Without `@Schema({ collection: 'users' })` Nest would invent a
  `managers` collection and the `manager` reference would dangle.

```ts
@Schema({ collection: 'users', timestamps: true })
export class Manager { /* first_name, last_name, email, role, is_verified */ }
```

**DTOs mirror the request contract, the service maps to storage.** The create DTO uses the
same field names the Express API accepts (`level`, `code_text[].text`, `tests[].output`) so
both backends share one request shape; `class-validator` decorators enforce it. A subtlety
worth calling out: with `whitelist: true`, a property that has *no* validation decorator is
silently stripped — so the free-form `value` / `output` (any JSON type) carry `@IsDefined()`
both to require them and to survive the whitelist:

```ts
class TestCaseDto {
  @IsNumber() @Min(0) @Max(1) weight: number;
  @IsArray() @ValidateNested({ each: true }) @Type(() => TestInputDto) inputs: TestInputDto[];
  @IsDefined() output: unknown;          // any type — kept + required
}
```

The service then maps request → schema (`level → difficulty`, `text → content`,
`output → expected_output`) — the same translation the Express seed/create used — and
**scopes every operation to the acting manager** so one manager can never see or edit
another's challenges:

```ts
findOne(id, managerId) {
  const c = await this.challengeModel.findOne({ _id: id, manager: managerId });  // ownership in the query
  if (!c) throw new NotFoundException(...);                                       // → 404
  return c;
}
```

Update/delete use `findOneAndUpdate` / `findOneAndDelete` with the same `{ _id, manager }`
filter, so a wrong owner is indistinguishable from "not found".

**Which manager, though?** That comes from the token — but auth is Phase 2. To keep Phase 1
testable, the controller temporarily reads the manager id from an `x-manager-id` header; the
next phase swaps that for the id extracted from the verified JWT.

### Trying it out (Phase 1)

```bash
npm run start:dev    # :4100, connects to the shared Atlas DB
MID=<a manager _id from the users collection>

curl -s -X POST localhost:4100/challenges -H "x-manager-id:$MID" \
  -H 'Content-Type: application/json' -d @challenge.json          # 201, persisted
curl -s localhost:4100/challenges -H "x-manager-id:$MID"          # only this manager's challenges
curl -s -X PATCH localhost:4100/challenges/$ID -H "x-manager-id:$MID" \
  -H 'Content-Type: application/json' -d '{"level":"Moderate"}'   # partial update
curl -s -X DELETE localhost:4100/challenges/$ID -H "x-manager-id:$MID"
# A different x-manager-id, or a bad id → 404; an invalid body → 400 with the failing rules.
```
