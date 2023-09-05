import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import { HttpAdapterHost } from "@nestjs/core";

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    // In certain situations `httpAdapter` might not be available in the
    // constructor method, thus we should resolve it here.
    const { httpAdapter } = this.httpAdapterHost;

    const ctx = host.switchToHttp();

    const httpStatus =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    let errorMessage =
      exception instanceof HttpException
        ? exception.getResponse()
        : "Internal Server Error";

    // If the exception is not an HttpException, and you want to log the actual error message
    if (!(exception instanceof HttpException) && exception instanceof Error) {
      errorMessage = exception.message;
    }

    const responseBody = {
      statusCode: httpStatus,
      message: errorMessage, // The field "message" contains the actual error message
    };

    httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus);
  }
}
