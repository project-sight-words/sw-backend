import { Auth, google } from "googleapis";
import { ConfigService } from "@nestjs/config";
import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from "@nestjs/common";

@Injectable()
export class GoogleService {
  private readonly oauthClient: Auth.OAuth2Client;

  constructor(configService: ConfigService) {
    this.oauthClient = new google.auth.OAuth2({
      clientId: configService.getOrThrow("GOOGLE_OAUTH_CLIENT_ID"),
      clientSecret: configService.getOrThrow("GOOGLE_OAUTH_CLIENT_SECRET"),
    });
  }

  private readonly logService = new Logger("GoogleService");

  async verifyIdToken(idToken: string): Promise<Auth.LoginTicket> {
    try {
      const ticket = await this.oauthClient.verifyIdToken({
        idToken,
        // TODO: Add audience setting so that only log ins to authorized clients can access
        // audience: process.env.FRONTEND_GOOGLE_OAUTH_CLIENT_ID,
      });
      return ticket;
    } catch (error: unknown) {
      this.logService.error(error);
      throw new InternalServerErrorException();
    }
  }

  getEmailFromTicket(ticket: Auth.LoginTicket): string {
    const payload = ticket.getPayload();
    if (!payload) throw new InternalServerErrorException();
    const { email } = payload;
    if (!email) throw new InternalServerErrorException();
    return email;
  }
}
