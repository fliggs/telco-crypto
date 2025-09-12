import {
	Args,
	Mutation,
	Parent,
	Query,
	ResolveField,
	Resolver,
} from '@nestjs/graphql';
import { Admin } from '@prisma/client';
import { forwardRef, Inject } from '@nestjs/common';

import { PaginationArgs } from '@/paginated';
import { AuthLoader } from '@/auth/auth.loader';
import { AdminAccess } from '@/auth/access.decorator';
import { AuthProvider } from '@/auth/dto/internal/auth-strategy.dto';
import { LoggedIn, LoggedInSubject } from '@/auth/logged-in.decorator';

import { AdminService } from './admin.service';
import { AdminDto, PaginatedAdmins } from './dto/graphql/admin.dto';
import { AdminFilterDto } from './dto/request/filter.dto';
import { AdminAuthDataDto } from './dto/graphql/auth-data.dto';

@Resolver(() => AdminDto)
export class AdminResolver {
	constructor(
		private readonly adminService: AdminService,
		@Inject(forwardRef(() => AuthLoader))
		private readonly authLoader: AuthLoader,
	) {}

	@AdminAccess()
	@Query(() => AdminDto)
	async meAdmin(@LoggedIn() admin: LoggedInSubject): Promise<AdminDto> {
		return admin;
	}

	@AdminAccess()
	@Query(() => PaginatedAdmins)
	async admins(
		@Args('filter', { type: () => AdminFilterDto, nullable: true })
		filter?: AdminFilterDto,
		@Args('pagination', { type: () => PaginationArgs, nullable: true })
		pagination?: PaginationArgs,
	): Promise<PaginatedAdmins> {
		return this.adminService.findAll(filter, pagination);
	}

	@AdminAccess()
	@Query(() => AdminDto)
	async admin(
		@Args('id', { type: () => String }) id: string,
	): Promise<AdminDto> {
		return this.adminService.findOne(id);
	}

	@AdminAccess()
	@Mutation(() => AdminDto)
	async createAdmin(
		@Args('email') email: string,
		@Args('firstName') firstName: string,
		@Args('lastName') lastName: string,
	): Promise<AdminDto> {
		return this.adminService.create({
			email,
			firstName,
			lastName,
		});
	}

	@AdminAccess()
	@Mutation(() => AdminDto)
	async deleteAdmin(@Args('id') id: string): Promise<AdminDto> {
		return this.adminService.delete(id);
	}

	@AdminAccess()
	@Mutation(() => AdminDto)
	async reactivateAdmin(@Args('id') id: string): Promise<AdminDto> {
		return this.adminService.reactivate(id);
	}

	@AdminAccess()
	@ResolveField(() => [AdminAuthDataDto])
	async authData(@Parent() admin: Admin): Promise<AdminAuthDataDto[]> {
		const data = await this.authLoader.adminDataByAdmin.load(admin.id);
		return data.map((data) => ({
			...data,
			provider: data.provider as AuthProvider,
		}));
	}
}
