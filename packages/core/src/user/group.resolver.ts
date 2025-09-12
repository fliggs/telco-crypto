import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';

import { PaginationArgs } from '@/paginated';
import { AdminAccess } from '@/auth/access.decorator';

import { PaginatedUserGroups, UserGroupDto } from './dto/graphql/group.dto';
import { UserGroupService } from './group.service';
import { UserGroupFilterDto } from './dto/request/group-filter.dto';
import { UpdateUserGroupDto } from './dto/request/update-user-group.dto';

@Resolver(() => UserGroupDto)
export class UserGroupResolver {
	constructor(private readonly groupService: UserGroupService) {}

	@AdminAccess()
	@Query(() => PaginatedUserGroups)
	async userGroups(
		@Args('filter', { type: () => UserGroupFilterDto, nullable: true })
		filter?: UserGroupFilterDto,
		@Args('pagination', { type: () => PaginationArgs, nullable: true })
		pagination?: PaginationArgs,
	): Promise<PaginatedUserGroups> {
		return this.groupService.findAll(filter, pagination);
	}

	@AdminAccess()
	@Query(() => UserGroupDto)
	async userGroup(
		@Args('id', { type: () => String }) id: string,
	): Promise<UserGroupDto> {
		return this.groupService.findOne(id);
	}

	@AdminAccess()
	@Mutation(() => UserGroupDto)
	async saveUserGroup(
		@Args('id', { type: () => String }) id: string,
		@Args('dto', { type: () => UpdateUserGroupDto }) dto: UpdateUserGroupDto,
	): Promise<UserGroupDto> {
		return this.groupService.save(id, dto);
	}
}
