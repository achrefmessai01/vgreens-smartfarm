import { ConfigService } from '@nestjs/config';

export const clerkConfig = (configService: ConfigService) => ({
  secretKey: configService.get<string>('CLERK_SECRET_KEY'),
});
