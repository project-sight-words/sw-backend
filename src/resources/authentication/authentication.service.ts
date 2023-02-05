import { GoogleService } from "./google.service";
import { Injectable } from "@nestjs/common";
import { JwtPayload } from "entities/jwt.entities";
import { LoginWithGoogleDto } from "./dto/authenticate.dto";
import { Roles } from "entities/role.entities";
import { RolesRepository } from "./roles.repository";
import { SessionService } from "./session.service";
import { UsersRepository } from "resources/users/users.repository";

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
    const jwtPayload = JwtPayload.fromUserEntity(user);
    const jwtToken = this.sessionService.sign(jwtPayload);
    const accessTokenCookie =
      this.sessionService.createCookieWithToken(jwtToken);
    // TODO: Create refresh token cookie
    return { accessTokenCookie, user };
  }

  async loginWithGoogle(data: LoginWithGoogleDto) {
    const { token: googleToken } = data;
    const ticket = await this.googleService.verifyIdToken(googleToken);
    const email = this.googleService.getEmailFromTicket(ticket);
    return this.login(email);
  }

  async getRolesByUserId(userId: string): Promise<Roles[]> {
    const roles = await this.rolesRepository.getByUserId(userId);
    return roles;
  }
}
