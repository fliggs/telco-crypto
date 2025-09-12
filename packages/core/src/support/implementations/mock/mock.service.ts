import { Injectable } from '@nestjs/common';

import { SupportService } from '@/support/support.service';

@Injectable()
export class SupportMockService extends SupportService {
	protected readonly name: string = 'mock';
}
