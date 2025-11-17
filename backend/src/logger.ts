import pino from 'pino';
import { env } from './env';

const isDevelopment = env.NODE_ENV === 'development';

export default pino(
  isDevelopment
    ? {
        transport: {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'HH:MM:ss',
            ignore: 'pid,hostname',
            singleLine: true,
          },
        },
      }
    : {
        level: 'info',
      },
);
