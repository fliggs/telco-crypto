import { Controller, Get } from '@nestjs/common';

import { PublicAccess } from './auth/access.decorator';

@Controller({
	version: '1',
})
export class AppController {
	@Get()
	@PublicAccess()
	hello(): string {
		return 'Welcome!';
	}
}
