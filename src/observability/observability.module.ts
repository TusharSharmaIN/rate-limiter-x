import { Global, Module } from '@nestjs/common';
import { FailOpenCounterService } from './fail-open-counter.service';
import { HealthController } from './health.controller';
import { StatsService } from './stats.service';
import { StatsController } from './stats.controller';

@Global() // any strategy can inject FailOpenCounterService without re-importing
@Module({
  controllers: [HealthController, StatsController],
  providers: [FailOpenCounterService, StatsService],
  exports: [FailOpenCounterService, StatsService],
})
export class ObservabilityModule {}
