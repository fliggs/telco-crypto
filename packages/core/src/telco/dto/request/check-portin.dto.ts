import { IsString } from 'class-validator';

export class CheckPortInDto {
	@IsString()
	msisdn: string;
}
