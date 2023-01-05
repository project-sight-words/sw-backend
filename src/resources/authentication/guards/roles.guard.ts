import {
  CanActivate,
  ExecutionContext,
  Injectable,
  mixin,
  Type,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { ROLES_KEY } from "../../../decorators/roles.decorator";
import { Role } from "../../../entities/roles.entities";
import { extractJwt } from "../../../utils/access";
import { SessionService } from "../session.service";

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private sessionService: SessionService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    // Get parameters from the decorator
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles) return true;

    // Extract the JWT
    const jwt = extractJwt(context);
    if (!jwt) return false;

    // Retrieve user with roles from the JWT payload
    const user = this.sessionService.getPayload(jwt);
    if (!user) {
      // TODO: Log internal server issue
      return false;
    }
    const userRoles = user.roles.map((r) => Role[r]);

    // Check if the user has at least one of the necessary permissions
    // Don't immediately return as we still want to check for self information
    let hasPermission = false;
    for (const perm of requiredRoles)
      hasPermission = hasPermission || userRoles.includes(perm);

    // TODO: Implement self checking

    return hasPermission;
  }
}
