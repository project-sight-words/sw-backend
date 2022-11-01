import { AuthenticationService } from "./authentication.service";
import { Body, Controller, NotFoundException, Post, Res } from "@nestjs/common";
import { Response } from "express";
import {
  LoginWithGoogleDto,
  LoggedInDto,
  LoginInDevelopmentDto,
} from "./dto/authenticate.dto";

@Controller("authentication")
export class AuthenticationController {
  constructor(private readonly authenticationService: AuthenticationService) {}

  @Post("development")
  async loginInDevelopment(
    @Body() data: LoginInDevelopmentDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<LoggedInDto> {
    if (!process.env.NODE_ENV || process.env.NODE_ENV !== "development")
      throw new NotFoundException();
    const session = await this.authenticationService.login(data.email);
    const { accessTokenCookie, user } = session;
    response.setHeader("Set-Cookie", accessTokenCookie);
    const roles = await this.authenticationService.getRolesByUserId(user.id);
    return { user, roles };
  }

  @Post("google")
  async loginWithGoogle(
    @Body() data: LoginWithGoogleDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<LoggedInDto> {
    const { accessTokenCookie, user } =
      await this.authenticationService.loginWithGoogle(data);
    response.setHeader("Set-Cookie", accessTokenCookie);
    const roles = await this.authenticationService.getRolesByUserId(user.id);
    return { user, roles };
  }
}
