import { Injectable } from "@nestjs/common";
import { instanceToPlain } from "class-transformer";
import { JwtService } from "@nestjs/jwt";
import { JwtPayload } from "entities/jwt.entities";

@Injectable()
export class SessionService {
  constructor(private readonly jwtService: JwtService) {}

  sign(data: JwtPayload): string {
    return this.jwtService.sign(instanceToPlain(data));
  }

  createCookieWithToken(token: string): string {
    const maxAge = parseInt(process.env.JWT_EXPIRATION_SECONDS ?? "300");
    return `Authentication=${token}; HttpOnly; Path=/; Max-Age=${maxAge}`;
  }
}
