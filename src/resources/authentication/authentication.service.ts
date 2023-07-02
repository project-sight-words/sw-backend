import { BadRequestException, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtPayload } from "entities/jwt.entities";
import { Role } from "entities/roles.entities";
import { UsersService } from "../users/users.service";
import { LoginWithGoogleDto, RoleDto } from "./dto/authenticate.dto";
import { GoogleService } from "./google.service";
import { RolesRepository } from "./roles.repository";
import { SessionService } from "./session.service";

@Injectable()
export class AuthenticationService {
  private readonly accessDuration: number;
  private readonly refreshDuration: number;

  constructor(
    configService: ConfigService,
    private readonly googleService: GoogleService,
    private readonly rolesRepository: RolesRepository,
    private readonly sessionService: SessionService,
    private readonly usersService: UsersService,
  ) {
    this.accessDuration = configService.getOrThrow<number>(
      "JWT_EXPIRATION_SECONDS",
    );
    this.refreshDuration = configService.getOrThrow<number>(
      "JWT_REFRESH_EXPIRATION_SECONDS",
    );
  }

  async login(email: string) {
    const user = await this.usersService.findOneByEmail(email);
    if (!user) throw new BadRequestException();
    const roles = await this.getRolesByUserId(user.id);
    const payload: JwtPayload = {
      id: user.id,
      email: user.email,
      roles: roles,
    };
    const accessToken = this.sessionService.generateToken(
      payload,
      this.accessDuration,
    );
    const refreshToken = this.sessionService.generateToken(
      payload,
      this.refreshDuration,
    );
    return { accessToken, refreshToken, user };
  }

  async loginWithGoogle(data: LoginWithGoogleDto) {
    const { token: googleToken } = data;
    const ticket = await this.googleService.verifyIdToken(googleToken);
    const email = this.googleService.getEmailFromTicket(ticket);
    return this.login(email);
  }

  refreshToken(access: string, refresh: string) {
    // Decode the user from the access and refresh tokens
    // Not going to update the lastLoggedIn field in the database since that might cause
    // some inconsistencies if the token is refreshed while the user was already logged
    // in (i.e. automatic refresh).
    const accessPayload = this.sessionService.getPayload(access);
    const refreshPayload = this.sessionService.getPayload(refresh);

    if (!accessPayload || !refreshPayload) throw new BadRequestException();

    if (
      accessPayload.email !== refreshPayload.email ||
      accessPayload.id !== refreshPayload.id
    )
      throw new BadRequestException();

    const accessToken = this.sessionService.generateToken(
      accessPayload,
      this.accessDuration,
    );
    const refreshToken = this.sessionService.generateToken(
      refreshPayload,
      this.refreshDuration,
    );

    return { accessToken, refreshToken };
  }

  async getRolesByUserId(userId: string): Promise<RoleDto[]> {
    const roles = await this.rolesRepository.getByUserId(userId);
    return roles;
  }
}
