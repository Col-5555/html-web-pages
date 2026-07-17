import { SetMetadata } from '@nestjs/common';

// Attaches the set of roles allowed to reach a controller or handler as route
// metadata; the AuthGuard reads it back via Reflector.
//
//   @Roles('Manager')
//   @Controller('challenges')
export const ROLES_KEY = 'roles';
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
