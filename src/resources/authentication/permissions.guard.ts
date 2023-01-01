import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { PERMISSIONS_KEY } from "../../decorators/permission.decorator";
import { Permission } from "../../entities/permission.entities";
import { Roles } from "../../entities/roles.entities";
import { SessionService } from "./session.service";

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private sessionService: SessionService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    // Get parameters from the decorator
    const requiredPermissions = this.reflector.getAllAndOverride<Permission[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!requiredPermissions) return true;

    // Retrieve the user from the request using the JWT token
    // Minor workaround bug in Request where headers.get() is not a method
    const jwtHeader: string = (
      context.switchToHttp().getRequest<Request>().headers as unknown as {
        authorization: string;
      }
    ).authorization;
    if (!jwtHeader) {
      // TODO: Log that JWT must be enforced together with this
      return false;
    }

    // JWT guaranteed to be valid as prior check by JWT Guard handles it
    const jwt = jwtHeader.substring(7);

    // Retrieve user with roles from the JWT payload
    const user = this.sessionService.getPayload(jwt);
    if (!user) {
      // TODO: Log internal server issue
      return false;
    }
    const userRoles = user.roles.map((r) => Roles[r]);

    // Check if the user has at least one of the necessary permissions
    // Don't immediately return as we still want to check for self information
    let hasPermission = false;
    for (const perm of requiredPermissions)
      hasPermission = hasPermission || userRoles.includes(perm.role);

    // TODO: Implement self checking

    return hasPermission;
  }
}
