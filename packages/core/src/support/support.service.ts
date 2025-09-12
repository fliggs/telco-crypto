import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClassConstructor } from 'class-transformer';

@Injectable()
export abstract class SupportService {
	protected readonly logger = new Logger(SupportService.name);
	protected abstract readonly name: string;

	constructor(protected readonly config: ConfigService) {}

	allowedControllers(): ClassConstructor<unknown>[] {
		return [];
	}
}
