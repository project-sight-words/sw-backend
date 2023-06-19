import {
  Body,
  Controller,
  Headers,
  NotFoundException,
  Post,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { AuthenticationService } from "./authentication.service";
import {
  AccessDto,
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
  ): Promise<LoggedInDto> {
    const environment = this.configService.getOrThrow<string>("NODE_ENV");
    if (environment !== "development") throw new NotFoundException();
    const session = await this.authenticationService.login(data.email);
    const { accessToken, refreshToken, user } = session;
    const roles = await this.authenticationService.getRolesByUserId(user.id);
    return { user, roles, accessToken, refreshToken };
  }

  @Post("google")
  async loginWithGoogle(
    @Body() data: LoginWithGoogleDto,
  ): Promise<LoggedInDto> {
    const { accessToken, refreshToken, user } =
      await this.authenticationService.loginWithGoogle(data);
    const roles = await this.authenticationService.getRolesByUserId(user.id);
    return { user, roles, accessToken, refreshToken };
  }

  @Post("refresh")
  refresh(
    @Headers("Authorization") headers: string,
    @Body() data: RefreshDto,
  ): AccessDto {
    const previousAccessToken = headers.substring(7);
    const previousRefreshToken = data.refreshToken;
    const { accessToken, refreshToken } =
      this.authenticationService.refreshToken(
        previousAccessToken,
        previousRefreshToken,
      );
    return { accessToken, refreshToken };
  }
}
