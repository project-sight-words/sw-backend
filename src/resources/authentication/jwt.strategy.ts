import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { Role } from "entities/roles.entities";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly configService: ConfigService) {
    super({
      jwtFromRequest: (request: any) => {
        let jwt: string | null = null;
        if (request && request.cookies) {
          console.log(request.cookies)
          jwt = (request.cookies['access'] as string).substring(15);
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
