import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { instanceToPlain } from "class-transformer";
import { JwtPayload } from "entities/jwt.entities";
import { Role } from "entities/roles.entities";

@Injectable()
export class SessionService {
  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {}

  generateCookie(data: JwtPayload, expiration: number): string {
    const token = this.jwtService.sign(instanceToPlain(data), {
      expiresIn: `${expiration}s`,
    });
    if (process.env.NODE_ENV === "development") {
      return `Authentication=${token}; HttpOnly; Path=/; Max-Age=${expiration}`;
    } else {
      return `Authentication=${token}; HttpOnly; Secure=true; SameSite=None; Path=/; Max-Age=${expiration}`;
    }
  }

  getPayload(token: string): JwtPayload | null {
    const payload = this.jwtService.decode(token);
    if (!payload || typeof payload === "string") return null;
    const castPayload = payload as {
      id: string;
      email: string;
      roles: Role[];
    };
    return {
      id: castPayload.id,
      email: castPayload.email,
      roles: castPayload.roles,
    };
  }
}
