import { ApiProperty } from '@nestjs/swagger';
import { WalletProvider } from '@prisma/client';
import { Expose, Type } from 'class-transformer';

export class PublicWalletDto {
	@Expose()
	id: string;

	@Expose()
	@ApiProperty({ enum: WalletProvider, enumName: 'WalletProvider' })
	provider: WalletProvider;

	@Expose()
	address: string;

	@Expose()
	@Type(() => Date)
	cloudBackupAt: Date | null;

	@Expose()
	@Type(() => Date)
	localBackupAt: Date | null;
}
