import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { RuntimeConfigService } from './runtime-config.service';

@ApiTags('rate-limiter')
@Controller('admin/config')
export class ConfigController {
  constructor(private readonly runtimeConfig: RuntimeConfigService) {}

  @ApiOperation({ summary: 'Get current rate limiter parameters' })
  @Get()
  getConfig() {
    return this.runtimeConfig.getAll();
  }

  @ApiOperation({ summary: 'Update a rate limiter parameter at runtime' })
  @Post()
  setConfig(@Body() body: { key: string; value: number }) {
    this.runtimeConfig.set(body.key, body.value);
    return { success: true, key: body.key, value: body.value };
  }
}
