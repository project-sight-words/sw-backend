import { ConfigService } from "@nestjs/config";
import { Injectable } from "@nestjs/common";
import { instanceToPlain } from "class-transformer";
import { JwtPayload } from "entities/jwt.entities";
import { JwtService } from "@nestjs/jwt";

@Injectable()
export class SessionService {
  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {}

  sign(data: JwtPayload): string {
    return this.jwtService.sign(instanceToPlain(data));
  }

  createCookieWithToken(token: string): string {
    const maxAge = this.configService.getOrThrow<number>(
      "JWT_EXPIRATION_SECONDS",
    );
    return `Authentication=${token}; HttpOnly; Path=/; Max-Age=${maxAge}`;
  }
}
