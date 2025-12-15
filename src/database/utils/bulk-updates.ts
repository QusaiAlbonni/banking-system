import { DataSource, EntityManager, ObjectLiteral } from 'typeorm';
import { resolveColumnDbType } from './metadata';

export type BulkUpdateOptions<T extends ObjectLiteral> = {
  connection: DataSource | EntityManager;
  tableName: string;
  entities: T[];
  updateColumns: (keyof T)[];
  whereColumn: keyof T;
  entityClass: { new (): T };
};

export async function bulkUpdateEntities<T extends ObjectLiteral>({
  connection,
  tableName,
  entities,
  updateColumns,
  whereColumn,
  entityClass,
}: BulkUpdateOptions<T>): Promise<void> {
  if (entities.length === 0) return;

  const dataSource =
    connection instanceof DataSource ? connection : connection.connection;
  const metadata = dataSource.getMetadata(entityClass);

  const getColumnMeta = (prop: keyof T) => {
    const col = metadata.columns.find((c) => c.propertyName === prop);
    if (!col) {
      throw new Error(
        `Column "${String(prop)}" not found in "${metadata.name}" metadata`,
      );
    }
    return col;
  };

  const allProps = [whereColumn, ...updateColumns];

  const castedColumns = allProps
    .map((prop) => {
      const colMeta = getColumnMeta(prop);
      return `${colMeta.databaseName}`;
    })
    .join(', ');

  const setClause = updateColumns
    .map((prop) => {
      const colDb = getColumnMeta(prop).databaseName;
      return `${colDb} = v.${colDb}`;
    })
    .join(', ');

  const params: any[] = [];
  const valueRows = entities.map((entity) => {
    const vals = allProps.map((prop) => entity[prop]);
    const placeholders = vals
      .map(
        (_, idx) =>
          `$${params.length + idx + 1}::${resolveColumnDbType(getColumnMeta(allProps[idx]!))}`,
      )
      .join(', ');
    params.push(...vals);
    return `(${placeholders})`;
  });

  const whereDb = getColumnMeta(whereColumn).databaseName;

  const sql = `
    UPDATE ${tableName} AS t
    SET ${setClause}
    FROM (
      VALUES
        ${valueRows.join(',\n        ')}
    ) AS v(${castedColumns})
    WHERE v.${whereDb} = t.${whereDb};
  `;
  await connection.query(sql, params);
}
