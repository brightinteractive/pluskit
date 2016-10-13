export interface Remote<PrimaryKey, Record, Queries> {
  query?: (...queries: Queries[]) => Promise<Record[]>
  get?: (primaryKey: PrimaryKey) => Promise<Record>

  create?: (record: Record) => Promise<PrimaryKey>
  update?: (record: Record) => Promise<void>

  delete?: (primaryKey: PrimaryKey) => Promise<void>
}
