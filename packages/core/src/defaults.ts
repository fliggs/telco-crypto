import { EdgeType } from '@prisma/client';

const isDev = process.env.ENV === 'development';

export const ONE_DAY_IN_SECONDS = 86400; // in seconds

export const DEFAULT_VALID_FOR = isDev
	? 1 * ONE_DAY_IN_SECONDS
	: 30 * ONE_DAY_IN_SECONDS; // in seconds

export const DEFAULT_BILLING_EDGE = EdgeType.LEADING;
export const DEFAULT_BILLING_OFFSET = isDev
	? 0 * ONE_DAY_IN_SECONDS
	: 0 * ONE_DAY_IN_SECONDS; // in seconds

export const DEFAULT_TELCO_EDGE = EdgeType.LEADING;
export const DEFAULT_TELCO_OFFSET = isDev
	? 0 * ONE_DAY_IN_SECONDS
	: 0 * ONE_DAY_IN_SECONDS; // in seconds

export const DEFAULT_PORT_OUT_VALID_FOR = isDev
	? 1 * ONE_DAY_IN_SECONDS
	: 10 * ONE_DAY_IN_SECONDS; // in seconds

export const DEFAULT_TAKE = 20;
export const MAX_TAKE = 1000;
export const USAGE_TRACK_INTERVAL = isDev ? 10 * 60 : 1 * ONE_DAY_IN_SECONDS;
export const DEFAULT_GROUP_NEW_WALLET_ENABLED = true;
export const DEFAULT_GROUP_PROMO_CODE_FIELD_ENABLED = false;
export const DEFAULT_TOKEN_HISTORY_DAYS = 30;
