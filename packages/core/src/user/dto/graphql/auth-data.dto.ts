import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';

import { AuthProvider } from '../../../auth/dto/internal/auth-strategy.dto';

registerEnumType(AuthProvider, { name: 'AuthProvider' });

@ObjectType()
export class UserAuthDataDto {
	@Field()
	id: string;

	@Field(() => AuthProvider)
	provider: AuthProvider;

	@Field()
	strategy: string;
}
