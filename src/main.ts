import { NestFactory } from '@nestjs/core';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { join } from 'path';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.GRPC,
      options: {
        package: 'ratelimiter',
        protoPath: join(__dirname, '../proto/rate_limiter.proto'),
        url: '0.0.0.0:50051',
      },
    },
  );

  await app.listen();
  console.log('Rate Limiter gRPC service running on port 50051');
}
bootstrap();
