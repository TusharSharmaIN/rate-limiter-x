import { Global, Module } from '@nestjs/common';
import { FailOpenCounterService } from './fail-open-counter.service';
import { HealthController } from './health.controller';

@Global() // any strategy can inject FailOpenCounterService without re-importing
@Module({
  controllers: [HealthController],
  providers: [FailOpenCounterService],
  exports: [FailOpenCounterService],
})
export class ObservabilityModule {}
