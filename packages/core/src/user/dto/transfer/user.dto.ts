import { Expose } from 'class-transformer';

export class UserDto {
	@Expose()
	id: string;

	@Expose()
	email: string;

	@Expose()
	firstName: string | null;

	@Expose()
	lastName: string | null;

	@Expose()
	deletedAt: Date | null;

	constructor(partial: Partial<UserDto>) {
		Object.assign(this, partial);
	}
}
