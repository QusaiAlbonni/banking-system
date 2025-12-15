import { ColumnType } from 'typeorm';
import { ColumnMetadata } from 'typeorm/metadata/ColumnMetadata.js';

export function resolveColumnDbType(column: ColumnMetadata): string {
  const inferredTypeMap: Record<string, string> = {
    String: 'varchar',
    Number: 'int',
    Boolean: 'boolean',
    Date: 'timestamp',
    Buffer: 'blob',
    Object: 'json',
    BigInt: 'bigint',
  };

  let type: ColumnType | string = column.type;

  if (typeof type !== 'string') type = inferredTypeMap[type.name]!;

  return type;
}
