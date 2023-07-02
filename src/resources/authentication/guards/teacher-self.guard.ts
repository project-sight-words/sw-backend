import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { ABAC } from "entities/abac.entities";
import { Role } from "entities/roles.entities";
import { extractJwt, extractParams, getMetadata } from "utils/access";
import { TeachersService } from "../../teachers/teachers.service";
import { SessionService } from "resources/authentication/session.service";

@Injectable()
export class TeacherSelfGuard implements CanActivate {
  private readonly logger = new Logger("TeacherSelfGuard");

  constructor(
    private reflector: Reflector,
    private sessionService: SessionService,
    private teachersService: TeachersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isTeacherSelf = getMetadata<boolean>(
      this.reflector,
      context,
      ABAC.TeacherSelf,
    );
    if (!isTeacherSelf) return true;

    // Get JWT
    const jwt = extractJwt(context);
    if (!jwt) return false;

    // Get the current user's id
    const user = this.sessionService.getPayload(jwt);
    if (!user) {
      this.logger.error("Unable to retrieve JWT payload user. Internal error.");
      return false;
    }

    if (user.roles.map((role) => role.role).includes(Role.admin)) return true;

    // Get the teacher ID to use
    const params = extractParams<{ id: string }>(context);
    if (!params) {
      this.logger.error(
        "Teacher self called when id parameter is not present.",
      );
      return false;
    }

    const target = await this.teachersService.findOneById(params.id);
    return !target || target.teacherId === user.id;
  }
}
