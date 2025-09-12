import {
	forwardRef,
	Inject,
	Injectable,
	InternalServerErrorException,
	Logger,
} from '@nestjs/common';

import { DbService } from '@/db/db.service';
import { AddressService } from '@/address/address.service';
import { PhoneNumberService } from '@/phone-number/phone-number.service';
import { UserService } from '@/user/user.service';
import { SubscriptionService } from '@/subscription/subscription.service';
import { TelcoService } from '@/telco/telco.service';

import { OrderProcessor } from '../order.processor';
import { Step } from '../dto/internal/step.dto';

import { SimpleStepFactory } from './steps/simple.step';

@Injectable()
export class OrderChangePhoneNumberProcessor extends OrderProcessor {
	protected readonly logger = new Logger(OrderChangePhoneNumberProcessor.name);

	constructor(
		db: DbService,
		private readonly addrService: AddressService,
		@Inject(forwardRef(() => PhoneNumberService))
		private readonly phoneNumService: PhoneNumberService,
		@Inject(forwardRef(() => SubscriptionService))
		private readonly subService: SubscriptionService,
		private readonly telcoService: TelcoService,
		private readonly userService: UserService,
		private readonly simpleStepFactory: SimpleStepFactory,
	) {
		super(db);
	}

	protected readonly steps: Step[] = [
		// -----------------------------
		// ----------- TELCO -----------
		// -----------------------------
		this.simpleStepFactory.create({
			name: 'TELCO',
			run: async (order, run) => {
				const details = order.changePhoneNumber;
				if (!details) {
					throw new InternalServerErrorException('missing_details');
				}

				const sub = await this.subService.findOne(order.subscriptionId!);
				const user = await this.userService.findOne(order.userId);
				const addrs = await this.addrService.findByUser(order.userId);

				if (!sub.simIccid) {
					throw new InternalServerErrorException('missing_sim');
				}
				if (!sub.phoneNumberMsisdn) {
					throw new InternalServerErrorException('missing_old_phone_number');
				}

				const res = await this.telcoService.changePhoneNumber({
					user,
					addresses: addrs,
					iccid: sub.simIccid,
					oldMsisdn: sub.phoneNumberMsisdn,
					newMsisdn: details.portInMsisdn,
					ospAccountNumber: details.portInAccountNumber,
					ospPassword: details.portInPassword,
					ospPostalCode: details.portInPostalCode,
				});

				if (res?.msisdn && res.msisdn !== sub.phoneNumberMsisdn) {
					await this.phoneNumService.attachToSubscription(
						sub.id,
						!details.portIn,
						res.msisdn,
					);
				}

				return {
					result: res,
				};
			},
			abort: async () => {},
		}),
	];
}
