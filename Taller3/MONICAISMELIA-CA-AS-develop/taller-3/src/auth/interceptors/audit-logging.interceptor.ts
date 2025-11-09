import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class AuditLoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(AuditLoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, user, ip, headers } = request;
    const userAgent = headers['user-agent'] || '';
    const userId = user?.Id_users || 'anonymous';
    const userRole = user?.ID_rol || 'unknown';

    // Log de acceso
    this.logger.log(
      `[AUDIT] ${method} ${url} - User: ${userId} (Role: ${userRole}) - IP: ${ip} - UserAgent: ${userAgent}`,
    );

    const now = Date.now();
    return next.handle().pipe(
      tap({
        next: (response) => {
          const responseTime = Date.now() - now;
          
          // Log especial para acceso a datos sensibles de mascotas
          if (this.isSensitiveEndpoint(url)) {
            this.logger.warn(
              `[SENSITIVE_DATA_ACCESS] ${method} ${url} - User: ${userId} (Role: ${userRole}) - IP: ${ip} - Response Time: ${responseTime}ms`,
            );
          }
        },
        error: (error) => {
          const responseTime = Date.now() - now;
          this.logger.error(
            `[AUDIT_ERROR] ${method} ${url} - User: ${userId} (Role: ${userRole}) - IP: ${ip} - Error: ${error.message} - Response Time: ${responseTime}ms`,
          );
        },
      }),
    );
  }

  private isSensitiveEndpoint(url: string): boolean {
    const sensitivePatterns = [
      '/pets',
      '/medical-history',
      '/appointments',
      '/bills',
    ];
    
    return sensitivePatterns.some(pattern => url.includes(pattern));
  }
}