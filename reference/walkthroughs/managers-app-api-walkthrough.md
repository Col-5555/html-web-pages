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

## Phase 2 — Authentication & Authorization

The `x-manager-id` header was a stand-in. Now the manager's identity comes from a **JWT
minted by the Express backend** — this app only *verifies* it. Three small pieces plus one
guard replace the placeholder.

**A metadata decorator to declare who's allowed.** `@Roles(...)` just stamps the allowed
roles onto the route with `SetMetadata`; the guard reads them back:

```ts
export const ROLES_KEY = 'roles';
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
```

**A param decorator to hand the user to the method.** `@AuthenticatedUser()` pulls whatever
the guard attached to the request:

```ts
export const AuthenticatedUser = createParamDecorator(
  (_data, ctx: ExecutionContext): AuthUser => ctx.switchToHttp().getRequest().user,
);
```

**The guard ties it together** (`CanActivate`). Read the Bearer token (401 if missing),
verify it with `JwtService` (401 if invalid), compare the token's role to the declared roles
via `Reflector` (403), and inject `{ id, email, role }` onto the request:

```ts
const token = this.extractToken(request);
if (!token) throw new UnauthorizedException(...);
let payload;
try { payload = await this.jwtService.verifyAsync(token); }   // secret from JwtModule
catch { throw new UnauthorizedException('Invalid or expired token'); }

const allowed = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [ctx.getHandler(), ctx.getClass()]);
if (allowed?.length && !allowed.includes(payload.role)) throw new ForbiddenException(...);
request.user = { id: payload.id, email: payload.email, role: payload.role };
```

**The shared secret is the whole trick.** `JwtModule` is configured (async, via
`ConfigService`) with the *same* `JWT_SECRET` the Express backend signs with — so a token
issued over there verifies over here. That's the entire cross-service trust relationship:
one secret, two backends.

```ts
JwtModule.registerAsync({
  inject: [ConfigService],
  useFactory: (config) => ({ secret: config.get('JWT_SECRET') }),   // == coders-app-api secret
});
```

**Wiring it to the controller** is now declarative — guard the class, restrict the role, and
swap the header placeholder for the decorator:

```ts
@Controller('challenges')
@UseGuards(AuthGuard)
@Roles('Manager')
export class ChallengesController {
  @Get() findAll(@AuthenticatedUser() user: AuthUser) { return this.service.findAll(user.id); }
  // ...
}
```

> TypeScript note: with `isolatedModules` + `emitDecoratorMetadata`, a type used in a
> decorated method signature (here `AuthUser`) must be imported with **`import type`** — Nest
> emits the runtime metadata separately, so the value/type imports have to be split. And
> since the guard sets `request.user`, a one-line `declare global` augments Express's
> `Request` so that property is typed.

### Trying it out (Phase 2)

```bash
# 1) Get a real Manager token from the Express backend (coders-app-api on :4000):
#    register → click the verify link in its log → POST /api/auth/managers/login → $MGR
# 2) Call this API with it:
curl -s localhost:4100/challenges                                 # no token   → 401
curl -s localhost:4100/challenges -H "Authorization: Bearer $COD" # coder token → 403
curl -s localhost:4100/challenges -H "Authorization: Bearer $MGR" # manager     → 200, only their own
curl -s -X POST localhost:4100/challenges -H "Authorization: Bearer $MGR" \
  -H 'Content-Type: application/json' -d @challenge.json          # created + attributed to the token's manager
```

> Honesty note: verified with `curl` (no browser here). The token really is minted by the
> Express app and verified by NestJS via the shared secret — proving the two backends
> interoperate — with 401 (no/invalid token), 403 (coder), and 200 (manager, token-scoped).
