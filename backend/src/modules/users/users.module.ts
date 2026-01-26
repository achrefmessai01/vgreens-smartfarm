import { Module } from '@nestjs/common';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersResolver } from './users.resolver';
import { ClerkSyncService } from './clerk-sync.service';
import { ClerkWebhookController } from './clerk-webhook.controller';
import { Tenant } from '@modules/tenants/entities/tenant.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Tenant])],
  controllers: [ClerkWebhookController],
  providers: [UsersService, UsersResolver, ClerkSyncService],
  exports: [UsersService, ClerkSyncService],
})
export class UsersModule {}
