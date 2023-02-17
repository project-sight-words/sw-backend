/**
 * Parses the body of a request.
 */
import { ExecutionContext } from "@nestjs/common";

export function extractJwt(context: ExecutionContext): string | null {
  // Retrieve the user from the request using the JWT token
  // Minor workaround bug in Request where headers.get() is not a method
  const jwtHeader: string = (
    context.switchToHttp().getRequest<Request>().headers as unknown as {
      authorization: string;
    }
  ).authorization;
  if (!jwtHeader) {
    // TODO: Log that JWT must be enforced together with this
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
