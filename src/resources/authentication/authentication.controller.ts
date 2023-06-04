import {
  Body,
  Controller,
  Headers,
  HttpCode,
  NotFoundException,
  Post,
  Res,
} from "@nestjs/common";
import { AuthenticationService } from "./authentication.service";
import { ConfigService } from "@nestjs/config";
import { Response } from "express";
import { UserEntityDto } from "resources/users/dto/users.dto";
import {
  LoggedInDto,
  LoginInDevelopmentDto,
  LoginWithGoogleDto,
  RefreshDto,
} from "./dto/authenticate.dto";

@Controller("authentication")
export class AuthenticationController {
  constructor(
    private readonly authenticationService: AuthenticationService,
    private readonly configService: ConfigService,
  ) {}

  @Post("development")
  async loginInDevelopment(
    @Body() data: LoginInDevelopmentDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<LoggedInDto> {
    const environment = this.configService.getOrThrow<string>("NODE_ENV");
    if (environment !== "development") throw new NotFoundException();
    const session = await this.authenticationService.login(data.email);
    const { accessTokenCookie, refreshTokenCookie, user } = session;
    response.setHeader(
      "Set-Cookie",
      this.createCookieHeaders(accessTokenCookie, refreshTokenCookie),
    );
    const roles = await this.authenticationService.getRolesByUserId(user.id);
    return { user, roles };
  }

  @Post("google")
  async loginWithGoogle(
    @Body() data: LoginWithGoogleDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<LoggedInDto> {
    const { accessTokenCookie, refreshTokenCookie, user } =
      await this.authenticationService.loginWithGoogle(data);
    response.setHeader(
      "Set-Cookie",
      this.createCookieHeaders(accessTokenCookie, refreshTokenCookie),
    );
    const roles = await this.authenticationService.getRolesByUserId(user.id);
    return { user, roles };
  }

  @Post("refresh")
  @HttpCode(204)
  refresh(
    @Headers("Authorization") auth: string,
    @Body() data: RefreshDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    // This endpoint won't return any results as we are storing the refresh token as a
    // cookie already.
    const accessToken = auth.slice(7);
    const session = this.authenticationService.refreshToken(
      accessToken,
      data.refreshToken,
    );
    const { accessTokenCookie, refreshTokenCookie } = session;
    response.setHeader(
      "Set-Cookie",
      this.createCookieHeaders(accessTokenCookie, refreshTokenCookie),
    );
  }

  private createCookieHeaders(access: string, refresh: string): string[] {
    return [`access=${access}`, `refresh=${refresh}`];
  }
}
