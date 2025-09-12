import { registerAs } from '@nestjs/config';
import { readFileSync } from 'fs';
import * as yaml from 'js-yaml';
import { join } from 'path';

const YAML_CONFIG_FILENAME = 'auth.yaml';

export interface AuthConfig {
	strategies: {
		[name: string]: {
			type: string;
			admin: boolean;
			config: any;
		};
	};
}

export default registerAs('auth', () => {
	return yaml.load(
		readFileSync(
			join(__dirname, '..', '..', 'config', YAML_CONFIG_FILENAME),
			'utf8',
		),
	) as Record<string, any>;
});
