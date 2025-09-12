import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';
import {
	ApiBearerAuth,
	ApiCookieAuth,
	ApiForbiddenResponse,
	ApiTooManyRequestsResponse,
	ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { Access } from './access.enum';
import { AccessGuard } from './access.guard';

export const ACCESS_KEY = 'access';

export function AuthenticatedAccess() {
	return applyDecorators(
		SetMetadata(ACCESS_KEY, [Access.User, Access.Admin]),
		UseGuards(AccessGuard),
		ApiBearerAuth(),
		ApiCookieAuth(),
		ApiUnauthorizedResponse({ description: 'Unauthorized' }),
		ApiTooManyRequestsResponse({ description: 'Rate limited' }),
	);
}

export function AdminAccess() {
	return applyDecorators(
		SetMetadata(ACCESS_KEY, Access.Admin),
		UseGuards(AccessGuard),
		ApiBearerAuth(),
		ApiCookieAuth(),
		ApiUnauthorizedResponse({ description: 'Unauthorized' }),
		ApiForbiddenResponse({ description: 'Access denied' }),
		ApiTooManyRequestsResponse({ description: 'Rate limited' }),
	);
}

export function UserAccess() {
	return applyDecorators(
		SetMetadata(ACCESS_KEY, Access.User),
		UseGuards(AccessGuard),
		ApiBearerAuth(),
		ApiCookieAuth(),
		ApiUnauthorizedResponse({ description: 'Unauthorized' }),
		ApiTooManyRequestsResponse({ description: 'Rate limited' }),
	);
}

export function PublicAccess() {
	return applyDecorators(
		SetMetadata(ACCESS_KEY, Access.Public),
		ApiTooManyRequestsResponse({ description: 'Rate limited' }),
	);
}
