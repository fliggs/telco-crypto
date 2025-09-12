import {
	ArgumentMetadata,
	ValidationError,
	ValidationPipe,
} from '@nestjs/common';
import { ValidatorOptions } from '@nestjs/common/interfaces/external/validator-options.interface';

export class CustomValidationPipe extends ValidationPipe {
	override transform(value: any, metadata: ArgumentMetadata): Promise<any> {
		return super.transform(value, metadata);
	}

	protected override validate(
		object: object,
		validatorOptions?: ValidatorOptions,
	): Promise<ValidationError[]> | ValidationError[] {
		return super.validate(object, validatorOptions);
	}
}
