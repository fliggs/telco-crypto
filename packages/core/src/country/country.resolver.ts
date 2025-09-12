import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';

import { AdminAccess } from '@/auth/access.decorator';

import { CountryService } from './country.service';
import { CountryDto } from './dto/graphql/country.dto';
import { CountryInputDto } from './dto/input/country.dto';

@Resolver(() => CountryDto)
export class CountryResolver {
	constructor(private readonly countryService: CountryService) {}

	@AdminAccess()
	@Query(() => [CountryDto])
	async countries(
		@Args('name', { type: () => String, nullable: true }) name: string | null,
	) {
		return this.countryService.findMany(name ?? undefined);
	}

	@AdminAccess()
	@Mutation(() => CountryDto)
	async saveCountry(
		@Args('id', { type: () => String, nullable: true }) id: string | null,
		@Args('country') country: CountryInputDto,
	) {
		if (id) {
			return this.countryService.save(id, country);
		} else {
			return this.countryService.create(country);
		}
	}

	@AdminAccess()
	@Mutation(() => CountryDto)
	async deleteCountry(@Args('id') id: string) {
		return this.countryService.delete(id);
	}
}
