import { NestFactory } from '@nestjs/core';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { join } from 'path';
import { AppModule } from './app.module';

const LOG_LEVELS = ['error', 'warn', 'log', 'debug', 'verbose'] as const;

async function bootstrap() {
  const GRPC_PORT = process.env.GRPC_PORT;
  const HTTP_PORT = process.env.HTTP_PORT;
  const configuredLevel = process.env.LOG_LEVEL || 'debug';

  const levelIndex = LOG_LEVELS.indexOf(configuredLevel as any);
  const activeLevels = LOG_LEVELS.slice(0, levelIndex + 1);

  const app = await NestFactory.create(AppModule, {
    logger: activeLevels as any,
  });

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.GRPC,
    options: {
      package: 'ratelimiter',
      protoPath: join(__dirname, '../proto/rate_limiter.proto'),
      url: `0.0.0.0:${GRPC_PORT}`,
    },
  });

  await app.startAllMicroservices();
  await app.listen(Number(HTTP_PORT));

  console.log(`gRPC service running on port ${GRPC_PORT}`);
  console.log(`HTTP health/metrics running on port ${HTTP_PORT}`);
}
bootstrap();
