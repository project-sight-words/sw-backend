import { google } from "googleapis";
import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from "@nestjs/common";

@Injectable()
export class GoogleService {
  private static readonly oauthClient = new google.auth.OAuth2({
    clientId: process.env.GOOGLE_OAUTH_CLIENT_ID,
    clientSecret: process.env.GOOGLE_OAUTH_CLIENT_SECRET,
  });

  private readonly logService = new Logger("GoogleService");

  async verifyIdToken(idToken: string): Promise<string | Error> {
    const ticket = await GoogleService.oauthClient
      .verifyIdToken({
        idToken,
        audience: process.env.FRONTEND_GOOGLE_OAUTH_CLIENT_ID,
      })
      .catch((error: unknown) => {
        if (error instanceof Error) this.logService.error(error);
        return new Error("Verification error");
      });
    if (ticket instanceof Error) return ticket;
    const payload = ticket.getPayload();
    if (!payload) throw new InternalServerErrorException();
    const { email } = payload;
    if (!email) throw new InternalServerErrorException();
    return email;
  }
}
