export type Querier = (SQL: string, values?: unknown[]) => Promise<unknown[]>;
