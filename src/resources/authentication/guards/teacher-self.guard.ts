import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { ABAC } from "../../../entities/abac.entities";
import { Role } from "../../../entities/roles.entities";
import { extractJwt, extractParams } from "../../../utils/access";
import { TeachersRepository } from "../../teachers/teachers.repository";
import { SessionService } from "../session.service";

@Injectable()
export class TeacherSelfGuard implements CanActivate {
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
    // TODO: Log that invalid parameter is given (which should not happen)
    if (!params) return false;

    // Get JWt
    const jwt = extractJwt(context);
    if (!jwt) return false;

    // Get the current user's id
    const user = this.sessionService.getPayload(jwt);
    if (!user) return false;

    const target = await this.teachersRepository.getByStaffId(params.id);
    return target.id === user.id || user.roles.includes(Role.admin);
  }
}
