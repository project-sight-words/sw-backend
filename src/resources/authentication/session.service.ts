import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { instanceToPlain } from "class-transformer";
import { JwtPayload } from "entities/jwt.entities";
import { RoleDto } from "./dto/authenticate.dto";

@Injectable()
export class SessionService {
  constructor(private readonly jwtService: JwtService) {}

  generateToken(data: JwtPayload, expiration: number): string {
    const token = this.jwtService.sign(instanceToPlain(data), {
      expiresIn: `${expiration}s`,
    });
    return token;
  }

  getPayload(token: string): JwtPayload | null {
    const payload = this.jwtService.decode(token);
    if (!payload || typeof payload === "string") return null;
    const castPayload = payload as {
      id: string;
      email: string;
      roles: RoleDto[];
    };
    return {
      id: castPayload.id,
      email: castPayload.email,
      roles: castPayload.roles,
    };
  }
}
