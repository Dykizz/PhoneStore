import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import * as kleur from 'kleur';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';

    const isDev = process.env.NODE_ENV !== 'production';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();
      if (typeof res === 'string') {
        message = res;
      } else if (Array.isArray((res as any).message)) {
        message = (res as any).message.join(', ');
      } else {
        message = (res as any).message || message;
      }
    } else if (exception instanceof Error) {
      if (isDev) {
        console.error(
          kleur.red().bold('[ERROR]'),
          kleur.yellow(`[${request.method}] ${request.url}`),
          kleur.red(`${exception.name}: ${exception.message}`),
        );
        console.error(kleur.gray(exception.stack || ''));
      }
    } else {
      if (isDev) {
        console.error(kleur.white(kleur.bgRed('[UNKNOWN ERROR]')), exception);
      }
    }

    response.status(status).json({
      success: false,
      statusCode: status,
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
