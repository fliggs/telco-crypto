import { EdgeType } from '@prisma/client';
import { add, max } from 'date-fns';

export function shortId(id: string | null | undefined) {
	if (!id) {
		return null;
	}

	const splits = id.split('-');
	const lastSplit = splits[splits.length - 1];
	return lastSplit.substring(lastSplit.length - 4);
}

export function getScheduledDate(
	start: Date,
	end: Date,
	edge: EdgeType,
	offset: number,
) {
	return max([
		new Date(),
		add(edge === EdgeType.LEADING ? start : end, { seconds: offset }),
	]);
}

export function serializeError(error: Error) {
	return JSON.parse(JSON.stringify(error, Object.getOwnPropertyNames(error)));
}
