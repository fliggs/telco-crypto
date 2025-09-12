import { Args, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';

import { PaginationArgs } from '@/paginated';
import { AdminAccess } from '@/auth/access.decorator';

import { LogService } from './log.service';
import { LogEventDto, PaginatedLogEvents } from './dto/graphql/log-event.dto';
import { LogEventFilterDto } from './dto/request/log-event-filter.dto';
import { LogEvent } from '@prisma/client';

@Resolver(() => LogEventDto)
export class LogResolver {
	constructor(private readonly logService: LogService) {}

	@AdminAccess()
	@Query(() => PaginatedLogEvents)
	async logEvents(
		@Args('filter', { type: () => LogEventFilterDto, nullable: true })
		filter?: LogEventFilterDto,
		@Args('pagination', { type: () => PaginationArgs, nullable: true })
		pagination?: PaginationArgs,
	): Promise<PaginatedLogEvents> {
		return this.logService.findAll(filter, pagination);
	}

	@AdminAccess()
	@ResolveField(() => String)
	async data(@Parent() logEvent: LogEvent) {
		return JSON.stringify(logEvent.data);
	}
}
