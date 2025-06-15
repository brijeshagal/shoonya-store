export class Logger {
  private readonly context: string;

  constructor(context: string) {
    this.context = context;
  }

  private formatMessage(level: string, message: string, error?: any): string {
    const timestamp = new Date().toISOString();
    const errorDetails = error ? `\nError: ${error.message}\nStack: ${error.stack}` : '';
    return `[${timestamp}] [${level}] [${this.context}] ${message}${errorDetails}`;
  }

  info(message: string): void {
    console.log(this.formatMessage('INFO', message));
  }

  warn(message: string, error?: any): void {
    console.warn(this.formatMessage('WARN', message, error));
  }

  error(message: string, error?: any): void {
    console.error(this.formatMessage('ERROR', message, error));
  }

  debug(message: string, error?: any): void {
    if (process.env.NODE_ENV === 'development') {
      console.debug(this.formatMessage('DEBUG', message, error));
    }
  }
} 