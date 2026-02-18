import { Controller, Post, Req, Res, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';
import { Public } from '@common/decorators/public.decorator';
import { ClerkSyncService } from './clerk-sync.service';

@Public()
@Controller('webhooks/clerk')
export class ClerkWebhookController {
  constructor(private readonly clerkSyncService: ClerkSyncService) {}

  @Post()
  async handleWebhook(@Req() req: Request, @Res() res: Response) {
    try {
      await this.clerkSyncService.handleClerkWebhook({
        svixId: req.headers['svix-id'] as string,
        svixTimestamp: req.headers['svix-timestamp'] as string,
        svixSignature: req.headers['svix-signature'] as string,
        payload: req.body as unknown,
      });
      return res.status(HttpStatus.OK).json({ success: true });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';
      return res.status(HttpStatus.BAD_REQUEST).json({ error: errorMessage });
    }
  }
}
