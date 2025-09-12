import {
	Injectable,
	CanActivate,
	ExecutionContext,
	Inject,
	UnauthorizedException,
} from '@nestjs/common';
import { SupportService } from './support.service';

@Injectable()
export class SupportGuard implements CanActivate {
	constructor(
		@Inject(SupportService) private readonly supportService: SupportService,
	) {}

	canActivate(context: ExecutionContext): boolean {
		const allowed = this.supportService.allowedControllers();
		if (!allowed.includes(context.getClass())) {
			throw new UnauthorizedException('controller_not_allowed');
		}
		return true;
	}
}
