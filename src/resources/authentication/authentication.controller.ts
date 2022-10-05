import { AuthenticateDto } from "./dto/authenticate.dto";
import { AuthenticationService } from "./authentication.service";
import { Body, Controller, Post, Res } from "@nestjs/common";
import { Response } from "express";

@Controller("authentication")
export class AuthenticationController {
  constructor(private readonly authenticationService: AuthenticationService) {}

  @Post("google")
  async loginWithGoogle(
    @Body() data: AuthenticateDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const { accessTokenCookie, user } =
      await this.authenticationService.loginWithGoogle(data);
    response.setHeader("Set-Cookie", accessTokenCookie);
    return user;
  }
}
