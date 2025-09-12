import { Parent, ResolveField, Resolver } from '@nestjs/graphql';
import { PhoneNumberAssignment } from '@prisma/client';

import { AdminAccess } from '@/auth/access.decorator';

import { PhoneNumberLoader } from './phone-number.loader';
import { PhoneNumberDto } from './dto/graphql/phone-number.dto';
import { PhoneNumberAssignmentDto } from './dto/graphql/phone-number-assignment.dto';

@Resolver(() => PhoneNumberAssignmentDto)
export class PhoneNumberAssignmentResolver {
	constructor(private readonly phoneNumLoader: PhoneNumberLoader) {}

	@AdminAccess()
	@ResolveField(() => PhoneNumberDto)
	async phoneNumber(@Parent() pa: PhoneNumberAssignment) {
		return this.phoneNumLoader.byMsisdn.load(pa.phoneNumberMsisdn);
	}
}
