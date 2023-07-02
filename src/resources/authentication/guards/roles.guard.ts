import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { ROLES_KEY } from "decorators/roles.decorator";
import { extractJwt, getMetadata } from "utils/access";
import { SessionService } from "resources/authentication/session.service";
import { Role } from "entities/roles.entities";

@Injectable()
export class RolesGuard implements CanActivate {
  private readonly logger = new Logger("RolesGuard");

  constructor(
    private reflector: Reflector,
    private sessionService: SessionService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    // Get the roles from the metadata
    const requiredRoles = getMetadata<Role[]>(
      this.reflector,
      context,
      ROLES_KEY,
    );
    if (!requiredRoles) return true;

    // Extract the JWT from the request. Should already exist but if it does not, must investigate as
    // it could be an internal error with the library or forgetting to include the JWT auth guard
    const jwt = extractJwt(context);
    if (!jwt) return false;

    // Retrieve user with roles from the JWT payload
    const user = this.sessionService.getPayload(jwt);
    if (!user) {
      this.logger.error("Unable to retrieve JWT payload user. Internal error.");
      return false;
    }

    // Check if the user has at least one of the necessary permissions
    for (const role of requiredRoles) {
      if (user.roles.map((role) => role.role).includes(role)) return true;
    }

    return false;
  }
}
