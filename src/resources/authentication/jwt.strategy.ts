import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { Role } from "entities/roles.entities";
import { Request } from "express";
import { Strategy } from "passport-jwt";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: (request: Request) => {
        let jwt: string | null = null;
        if (request && request.cookies) {
          const cookies: Record<string, string> = request.cookies as Record<
            string,
            string
          >;
          if ("access" in cookies) jwt = cookies.access!.substring(15);
        }
        return jwt;
      },
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>("JWT_SECRET"),
    });
  }

  // Used to validate that the extracted payload contains the user's details
  validate(payload: { id: string; email: string; roles: Role[] }) {
    return { id: payload.id, email: payload.email, roles: payload.roles };
  }
}
