import { Module } from '@nestjs/common';
import { WikiIntegration } from './wiki.integration';

@Module({
  providers: [WikiIntegration],
  exports: [WikiIntegration],
})
export class IntegrationsModule {}

