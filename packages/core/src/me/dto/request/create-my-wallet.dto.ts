import { ApiProperty } from '@nestjs/swagger';
import { WalletProvider } from '@prisma/client';
import { IsBase58, IsBoolean, IsEnum } from 'class-validator';

export class CreateMyWalletDto {
	@IsEnum(WalletProvider)
	@ApiProperty({ enum: WalletProvider, enumName: 'WalletProvider' })
	provider: WalletProvider;

	@IsBase58()
	address: string;

	@IsBoolean()
	imported: boolean;

	@IsBoolean()
	readOnly: boolean;
}
