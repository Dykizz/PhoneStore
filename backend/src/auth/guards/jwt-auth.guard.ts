import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from 'src/common/decorators/public.decorator';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(
    private reflector: Reflector,
    private jwtService: JwtService,
  ) {
    super();
  }
  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    console.log('isPublic', isPublic);
    if (isPublic) {
      const request = context.switchToHttp().getRequest();
      const token = this.extractToken(request);
      if (token) {
        try {
          const payload = this.jwtService.verify(token);
          request.user = payload;
        } catch {
          // Ignore invalid token
        }
      }
      return true;
    }
    return super.canActivate(context);
  }

  private extractToken(request: any): string | null {
    // Try Authorization header first
    const authHeader =
      request.headers?.authorization ??
      (typeof request.get === 'function'
        ? request.get('authorization')
        : undefined);
    if (authHeader && typeof authHeader === 'string') {
      const parts = authHeader.split(' ');
      if (parts.length === 2 && /^Bearer$/i.test(parts[0])) {
        return parts[1];
      }
    }

    // Fallback to cookies (common in some setups)
    if (request.cookies && typeof request.cookies.token === 'string') {
      return request.cookies.token;
    }

    return null;
  }

  handleRequest(err, user, info) {
    if (err || !user) {
      throw err || new UnauthorizedException();
    }
    return user;
  }
}
