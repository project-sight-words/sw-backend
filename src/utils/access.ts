/**
 * Parses the body of a request.
 */
import { ExecutionContext, Logger } from "@nestjs/common";
import { Reflector } from "@nestjs/core";

const logger = new Logger("AccessUtils");

export function extractJwt(context: ExecutionContext): string | null {
  // Retrieve the user from the request using the JWT token
  // Minor workaround bug in Request where headers.get() is not a method
  const jwtHeader: string = (
    context.switchToHttp().getRequest<Request>().headers as unknown as {
      authorization: string;
    }
  ).authorization;
  if (!jwtHeader) {
    logger.error(
      "JWT should be provided in header already. Ensure that JwtAuthGuard is added to the controller. Internal error.",
    );
    return null;
  }

  // JWT guaranteed to be valid as prior check by JWT Guard handles it
  const jwt = jwtHeader.substring(7);
  return jwt;
}

export function extractParams<T>(context: ExecutionContext): T | null {
  return (
    context.switchToHttp().getRequest<Request>() as unknown as {
      params: T;
    }
  ).params;
}

export function getMetadata<T>(
  reflector: Reflector,
  context: ExecutionContext,
  key: string,
): T | null {
  return reflector.getAllAndOverride<T>(key, [
    context.getHandler(),
    context.getClass(),
  ]);
}
