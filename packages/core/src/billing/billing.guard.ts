import {
	Injectable,
	CanActivate,
	ExecutionContext,
	Inject,
	UnauthorizedException,
} from '@nestjs/common';
import { BillingService } from './billing.service';

@Injectable()
export class BillingGuard implements CanActivate {
	constructor(
		@Inject(BillingService) private readonly billingService: BillingService,
	) {}

	canActivate(context: ExecutionContext): boolean {
		const allowed = this.billingService.allowedControllers();
		if (!allowed.includes(context.getClass())) {
			throw new UnauthorizedException('controller_not_allowed');
		}
		return true;
	}
}
