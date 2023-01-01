import { BadRequestException, Injectable } from "@nestjs/common";
import { Roles } from "entities/roles.entities";
import { UsersRepository } from "resources/users/users.repository";
import { JwtPayload } from "../../entities/jwt.entities";
import { LoginWithGoogleDto } from "./dto/authenticate.dto";
import { GoogleService } from "./google.service";
import { RolesRepository } from "./roles.repository";
import { SessionService } from "./session.service";

@Injectable()
export class AuthenticationService {
  constructor(
    private readonly googleService: GoogleService,
    private readonly rolesRepository: RolesRepository,
    private readonly sessionService: SessionService,
    private readonly usersRepository: UsersRepository,
  ) {}

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
      "access",
    );
    const refreshTokenCookie = this.sessionService.generateCookie(
      payload,
      "refresh",
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
      "access",
    );
    const refreshTokenCookie = this.sessionService.generateCookie(
      refreshPayload,
      "refresh",
    );

    return { accessTokenCookie, refreshTokenCookie };
  }

  async getRolesByUserId(userId: string): Promise<Roles[]> {
    const roles = await this.rolesRepository.getByUserId(userId);
    return roles;
  }
}
