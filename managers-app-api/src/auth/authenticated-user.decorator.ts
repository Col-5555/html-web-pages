import { createParamDecorator, ExecutionContext } from '@nestjs/common';

// The user info the AuthGuard extracts from a verified token and injects onto the
// request. Shape matches the Express login token payload.
export interface AuthUser {
  id: string;
  email: string;
  role: string;
}

// Parameter decorator that hands a controller method the authenticated user:
//
//   findAll(@AuthenticatedUser() user: AuthUser) { ... }   // user.id, user.role
export const AuthenticatedUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AuthUser => {
    const request = ctx.switchToHttp().getRequest<{ user: AuthUser }>();
    return request.user;
  },
);
