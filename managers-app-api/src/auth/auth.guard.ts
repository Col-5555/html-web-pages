import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { ROLES_KEY } from './roles.decorator';
import { AuthUser } from './authenticated-user.decorator';

// Authentication + authorization guard. It:
//   1. reads the Bearer token from the Authorization header (401 if absent),
//   2. verifies it with JwtService using the shared JWT_SECRET (401 if invalid) —
//      the token is minted by the Express backend's login endpoint,
//   3. checks the token's role against the roles declared with @Roles (403), and
//   4. injects { id, email, role } onto request.user for @AuthenticatedUser.
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();

    const token = this.extractToken(request);
    if (!token) {
      throw new UnauthorizedException('Missing or malformed Authorization header');
    }

    let payload: AuthUser & { [key: string]: unknown };
    try {
      // Secret comes from JwtModule's config (the shared JWT_SECRET).
      payload = await this.jwtService.verifyAsync(token);
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }

    const allowedRoles = this.reflector.getAllAndOverride<string[] | undefined>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (allowedRoles?.length && !allowedRoles.includes(payload.role)) {
      throw new ForbiddenException('Forbidden: insufficient role');
    }

    request.user = { id: payload.id, email: payload.email, role: payload.role };
    return true;
  }

  private extractToken(request: Request): string | undefined {
    const [scheme, token] = request.headers.authorization?.split(' ') ?? [];
    return scheme === 'Bearer' ? token : undefined;
  }
}
