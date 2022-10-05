import { Expose, plainToClass } from "class-transformer";
import { Request } from "express";
import { JwtPayload } from "entities/jwt.entities";
import { verify } from "jsonwebtoken";
import {
  createParamDecorator,
  ExecutionContext,
  Logger,
  UnauthorizedException,
} from "@nestjs/common";

class AuthenticationCookie {
  @Expose({ name: "Authentication" })
  authentication!: string;
}

const loggerService = new Logger("AuthorizationDecorator");

export const Authorization = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    try {
      const request = context.switchToHttp().getRequest<Request>();
      const cookie = plainToClass(AuthenticationCookie, request.cookies);
      const decoded = verify(
        cookie.authentication,
        process.env.JWT_SECRET ?? "",
      );
      const payload = plainToClass(JwtPayload, decoded);
      return payload.id;
    } catch (error: unknown) {
      loggerService.error(error);
      throw new UnauthorizedException();
    }
  },
);
