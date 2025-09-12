import { Prisma } from '@prisma/client';

export function inverseSort(dir: Prisma.SortOrder) {
	return dir === Prisma.SortOrder.asc
		? Prisma.SortOrder.desc
		: Prisma.SortOrder.asc;
}

export function getSortSign(dir: Prisma.SortOrder, take: number) {
	return dir === Prisma.SortOrder.asc
		? take < 0
			? '<'
			: '>'
		: take < 0
			? '>'
			: '<';
}

export function createFindQuery<O>(
	table: string,
	addFilter: (joins: Prisma.Sql[], wheres: Prisma.Sql[]) => void,
	orderBy: { col: O; dir: Prisma.SortOrder }[],
	take: number,
	skip: number,
	cursor: string | null,
) {
	const tbl = Prisma.raw(`"${table}"`);
	let cte = Prisma.sql``;
	let sel = Prisma.sql`SELECT t.* FROM ${tbl} AS t `;
	let joins: Prisma.Sql[] = [];
	let wheres: Prisma.Sql[] = [];

	addFilter(joins, wheres);

	if (cursor) {
		cte = Prisma.sql`WITH curr AS (SELECT * FROM ${tbl} WHERE "id" = ${cursor}::uuid)`;

		let orderWhere = Prisma.sql``;
		for (let i = 0; i < orderBy.length; i++) {
			const o = orderBy[i];
			const col = Prisma.raw(`"${o.col}"`);
			let sign = getSortSign(o.dir, take);

			// The last condition has to be non-strict so that we return the current row
			if (i >= orderBy.length - 1) {
				sign += '=';
			}

			let where = Prisma.sql``;
			for (let j = 0; j < i; j++) {
				const oldCol = Prisma.raw(`"${orderBy[j].col}"`);
				where = Prisma.sql`${where} t.${oldCol} = (SELECT ${oldCol} FROM curr) AND`;
			}

			where = Prisma.sql`${where} t.${col} ${Prisma.raw(sign)} (SELECT ${col} FROM curr)`;
			orderWhere = i > 0 ? Prisma.sql`${orderWhere} OR (${where})` : where;
		}

		wheres.push(orderWhere);
	}

	const order = orderBy.reduce(
		(acc, o, i) => {
			const col = Prisma.raw(`"${o.col}"`);
			const dir = Prisma.raw(take < 0 ? inverseSort(o.dir) : o.dir);
			return i > 0
				? Prisma.sql`${acc}, t.${col} ${dir}`
				: Prisma.sql`${acc} t.${col} ${dir}`;
		},
		Prisma.sql`ORDER BY`,
	);

	const where = wheres.reduce(
		(acc, w, i) =>
			i > 0 ? Prisma.sql`${acc} AND (${w})` : Prisma.sql`WHERE (${w})`,
		Prisma.sql``,
	);

	const join = joins.reduce((acc, j) => Prisma.sql`${acc} ${j}`, Prisma.sql``);

	return Prisma.sql`${cte} ${sel} ${join} ${where} ${order} LIMIT ${Math.abs(take)} OFFSET ${skip}`;
}

export function queryToString(query: Prisma.Sql) {
	let txt = '';
	for (let i = 0; i < query.strings.length; i++) {
		txt +=
			query.strings[i] + (query.values[i] ? "'" + query.values[i] + "'" : '');
	}
	return txt;
}
