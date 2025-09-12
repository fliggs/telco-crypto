import { Expose, Type } from 'class-transformer';

export class PublicTokenHistoryDto {
	@Expose()
	@Type(() => PublicTokenHistoryEntryDto)
	prices: PublicTokenHistoryEntryDto[];
}

export class PublicTokenHistoryEntryDto {
	@Expose()
	ts: Date;

	@Expose()
	price: number;
}
