import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { instanceToPlain } from "class-transformer";
import { JwtPayload } from "entities/jwt.entities";

type tokenType = "access" | "refresh";

@Injectable()
export class SessionService {
  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {}

  sign(data: JwtPayload, type: tokenType): string {
    let expiration = this.configService.getOrThrow<number>(
      "JWT_EXPIRATION_SECONDS",
    );
    if (type === "refresh")
      expiration = this.configService.getOrThrow<number>(
        "JWT_REFRESH_EXPIRATION_SECONDS",
      );
    return this.jwtService.sign(instanceToPlain(data), {
      expiresIn: `${expiration}s`,
    });
  }

  createCookieWithToken(token: string, type: tokenType): string {
    let maxAge = this.configService.getOrThrow<number>(
      "JWT_EXPIRATION_SECONDS",
    );
    if (type === "refresh")
      maxAge = this.configService.getOrThrow<number>(
        "JWT_REFRESH_EXPIRATION_SECONDS",
      );
    return `Authentication=${token}; HttpOnly; Path=/; Max-Age=${maxAge}`;
  }

  generateCookie(data: JwtPayload, type: tokenType): string {
    const token = this.sign(data, type);
    const cookie = this.createCookieWithToken(token, type);
    return cookie;
  }

  getPayload(token: string): JwtPayload | undefined {
    const payload = this.jwtService.decode(token);
    if (!payload || typeof payload === "string") return undefined;
    const castPayload = payload as { id: string; email: string };
    return {
      id: castPayload.id,
      email: castPayload.email,
    };
  }
}
