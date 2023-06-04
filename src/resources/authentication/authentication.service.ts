import { BadRequestException, Injectable } from "@nestjs/common";
import { Role } from "entities/roles.entities";
import { UsersRepository } from "resources/users/users.repository";
import { GoogleService } from "./google.service";
import { JwtPayload } from "entities/jwt.entities";
import { LoginWithGoogleDto } from "./dto/authenticate.dto";
import { RolesRepository } from "./roles.repository";
import { SessionService } from "./session.service";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class AuthenticationService {
  private readonly accessDuration: number;
  private readonly refreshDuration: number;

  constructor(
    private readonly configService: ConfigService,
    private readonly googleService: GoogleService,
    private readonly rolesRepository: RolesRepository,
    private readonly sessionService: SessionService,
    private readonly usersRepository: UsersRepository,
  ) {
    this.accessDuration = configService.getOrThrow<number>(
      "JWT_EXPIRATION_SECONDS",
    );
    this.refreshDuration = configService.getOrThrow<number>(
      "JWT_REFRESH_EXPIRATION_SECONDS",
    );
  }

  async login(email: string) {
    const user = await this.usersRepository.upsertByEmail({
      email: email,
      lastLoggedIn: new Date(),
    });
    const roles = await this.getRolesByUserId(user.id);
    const payload: JwtPayload = {
      id: user.id,
      email: user.email,
      roles: roles,
    };

    const accessTokenCookie = this.sessionService.generateCookie(
      payload,
      this.accessDuration,
    );
    const refreshTokenCookie = this.sessionService.generateCookie(
      payload,
      this.refreshDuration,
    );
    return { accessTokenCookie, refreshTokenCookie, user };
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

    const accessTokenCookie = this.sessionService.generateCookie(
      accessPayload,
      this.accessDuration,
    );
    const refreshTokenCookie = this.sessionService.generateCookie(
      refreshPayload,
      this.refreshDuration,
    );

    return { accessTokenCookie, refreshTokenCookie };
  }

  async getRolesByUserId(userId: string): Promise<Role[]> {
    const roles = await this.rolesRepository.getByUserId(userId);
    return roles;
  }
}
