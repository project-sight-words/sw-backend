import { AuthenticateDto } from "./dto/authenticate.dto";
import { GoogleService } from "./google.service";
import { Response } from "express";
import {
  BadRequestException,
  Body,
  Controller,
  Post,
  Res,
} from "@nestjs/common";

@Controller("authentication")
export class AuthenticationController {
  constructor(private readonly googleService: GoogleService) {}

  @Post("google")
  async authenticate(
    @Body() data: AuthenticateDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const email = await this.googleService.verifyIdToken(data.token);
    if (email instanceof Error) throw new BadRequestException();
    response.setHeader("Set-Cookie", []);
    return {};
  }
}
