import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';
import { WalletProvider } from '@prisma/client';

import { Paginated } from '@/paginated';

registerEnumType(WalletProvider, { name: 'WalletProvider' });

@ObjectType()
export class WalletDto {
	@Field()
	id: string;

	@Field()
	createdAt: Date;

	@Field()
	updatedAt: Date;

	@Field()
	userId: string;

	@Field(() => WalletProvider)
	provider: WalletProvider;

	@Field()
	address: string;

	@Field(() => Date, { nullable: true })
	cloudBackupAt: Date | null;

	@Field(() => Date, { nullable: true })
	localBackupAt: Date | null;
}

@ObjectType()
export class PaginatedWallets extends Paginated(WalletDto) {}
