import {
	Body,
	Controller,
	HttpCode,
	Post,
	SerializeOptions,
} from '@nestjs/common';

import { UserAccess } from '@/auth/access.decorator';
import { LoggedIn, LoggedInSubject } from '@/auth/logged-in.decorator';

import { TelcoService } from './telco.service';
import { CheckCoverageDto } from './dto/request/check-coverage.dto';
import { PublicCoverageDto } from './dto/response/public-coverage.dto';
import { PublicPortInDto } from './dto/response/public-portin.dto';
import { CheckPortInDto } from './dto/request/check-portin.dto';

@Controller({
	path: 'telco',
	version: '1',
})
export class TelcoController {
	constructor(private readonly telcoService: TelcoService) {}

	@Post('check-coverage')
	@UserAccess()
	@HttpCode(200)
	@SerializeOptions({ type: PublicCoverageDto })
	async checkCoverage(
		@LoggedIn() user: LoggedInSubject,
		@Body() dto: CheckCoverageDto,
	): Promise<PublicCoverageDto> {
		return this.telcoService.checkCoverage({
			user,
			...dto,
		});
	}

	@Post('check-portin')
	@UserAccess()
	@HttpCode(200)
	@SerializeOptions({ type: PublicPortInDto })
	async checkPortIn(@Body() dto: CheckPortInDto): Promise<PublicPortInDto> {
		return this.telcoService.checkPortIn(dto);
	}
}
