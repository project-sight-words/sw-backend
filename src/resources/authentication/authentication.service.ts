import { LoginWithGoogleDto } from "./dto/authenticate.dto";
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

  async login(email: string) {
    const user = await this.usersRepository.upsertByEmail({
      email: email,
      lastLoggedIn: new Date(),
    });
    const accessTokenCookie = this.sessionService.generateToken(user, "access");
    const refreshTokenCookie = this.sessionService.generateToken(
      user,
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

  async getRolesByUserId(userId: string): Promise<Roles[]> {
    const roles = await this.rolesRepository.getByUserId(userId);
    return roles;
  }
}
