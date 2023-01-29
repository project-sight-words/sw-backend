import { AuthenticationService } from "./authentication.service";
import { Body, Controller, NotFoundException, Post, Res } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Response } from "express";
import { UserEntityDto } from "resources/users/dto/users.dto";
import {
  LoginWithGoogleDto,
  LoggedInDto,
  LoginInDevelopmentDto,
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
    const { accessTokenCookie, user: userEntity } = session;
    response.setHeader("Set-Cookie", accessTokenCookie);
    const roles = await this.authenticationService.getRolesByUserId(
      userEntity.identitifier.id,
    );
    return { user: UserEntityDto.fromUserEntity(userEntity), roles };
  }

  @Post("google")
  async loginWithGoogle(
    @Body() data: LoginWithGoogleDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<LoggedInDto> {
    const { accessTokenCookie, user: userEntity } =
      await this.authenticationService.loginWithGoogle(data);
    response.setHeader("Set-Cookie", accessTokenCookie);
    const roles = await this.authenticationService.getRolesByUserId(
      userEntity.identitifier.id,
    );
    return { user: UserEntityDto.fromUserEntity(userEntity), roles };
  }
}
