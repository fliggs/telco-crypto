import { Expose } from 'class-transformer';

import { PublicSimDto } from './public-sim.dto';

export class PublicSimDetailsDto extends PublicSimDto {
	@Expose()
	isActivated: boolean;

	@Expose()
	eSimStatus: string | null;

	@Expose()
	eSimActivationCode: string | null;

	@Expose()
	pin: string | null;

	@Expose()
	puk: string | null;
}
