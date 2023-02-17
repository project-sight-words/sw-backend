import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { ABAC } from "entities/abac.entities";
import { Role } from "entities/roles.entities";
import { extractJwt, extractParams } from "utils/access";
import { TeachersRepository } from "resources/teachers/teachers.repository";
import { SessionService } from "resources/authentication/session.service";

@Injectable()
export class TeacherSelfGuard implements CanActivate {
  private readonly logger = new Logger("TeacherSelfGuard");

  constructor(
    private reflector: Reflector,
    private sessionService: SessionService,
    private teachersRepository: TeachersRepository,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isTeacherSelf = this.reflector.getAllAndOverride<boolean>(
      ABAC.TeacherSelf,
      [context.getHandler(), context.getClass()],
    );
    if (!isTeacherSelf) return true;

    // Get the teacher ID to use
    const params = extractParams<{ id: string }>(context);
    if (!params) {
      this.logger.error(
        "Teacher self called when id parameter is not present.",
      );
      return false;
    }

    // Get JWT
    const jwt = extractJwt(context);
    if (!jwt) {
      this.logger.error(
        "JWT should be provided in header already. Ensure that JwtAuthGuard is added to the controller. Internal error.",
      );
      return false;
    }

    // Get the current user's id
    const user = this.sessionService.getPayload(jwt);
    if (!user) {
      this.logger.error("Unable to retrieve JWT payload user. Internal error.");
      return false;
    }

    const target = await this.teachersRepository.getByStaffId(params.id);
    return target.id === user.id || user.roles.includes(Role.admin);
  }
}
