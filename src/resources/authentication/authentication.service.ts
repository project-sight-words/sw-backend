import { AuthenticateDto } from "./dto/authenticate.dto";
import { GoogleService } from "./google.service";
import { Injectable } from "@nestjs/common";
import { Roles } from "entities/roles.entities";
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

  async loginWithGoogle(data: AuthenticateDto) {
    const { token: googleToken } = data;
    const ticket = await this.googleService.verifyIdToken(googleToken);
    const email = this.googleService.getEmailFromTicket(ticket);
    const user = await this.usersRepository.upsertByEmail({
      email: email,
      lastLoggedIn: new Date(),
    });
    const jwtToken = this.sessionService.sign(user);
    const accessTokenCookie =
      this.sessionService.createCookieWithToken(jwtToken);
    // TODO: Create refresh token cookie
    return { accessTokenCookie, user };
  }

  async getRolesByUserId(userId: string): Promise<Roles[]> {
    const roles = await this.rolesRepository.getByUserId(userId);
    return roles;
  }
}
