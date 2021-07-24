import { Client, Pool } from 'pg';
import { DataTypeInputs } from '@typed-query-builder/builder';
import '@typed-query-builder/sql-mssql';



export interface GeneratorTable
{
  table: string;
  tableAlias: string;
  tableVariable: string;
  columns: Array<{
    column: string;
    columnAlias: string;
    columnType: DataTypeInputs;
  }>;
  tableDefinition: string;
  primary: string[];
}

export interface GeneratorOptions
{
  tableNameAlias: (name: string) => string;
  tableVariableAlias: (name: string) => string;
  columnNameAlias: (name: string) => string;
  ignore: string[];
  types: 'tables' | 'views' | 'all',
  tab: string;
  tabDepth: number;
  newline: string;
}

interface SysTable
{
  name: string;
  schema: string;
}

type SysColumnTypes = 
  'any' | 
  'bit' | 
  'bool' |
  'box' |
  'bytea' | 
  'char' | 
  'cid' | 
  'cidr' | 
  'circle' | 
  'date' | 
  'float4' | 
  'float8' |
  'geometry' | 
  'geography' |
  'inet' | 
  'int2' | 
  'int4' |
  'int8' | 
  'json' | 
  'jsonb' | 
  'line' | 
  'lseg' | 
  'macaddr' |
  'money' |
  'name' |
  'numeric' |
  'path' | 
  'point' |
  'polygon' | 
  'text' | 
  'time' | 
  'timestamp' | 
  'uuid' |
  'varchar' | 
  'xml'
;

interface SysColumn
{
  name: string;
  max_length: number;
  precision: number;
  scale: number;
  is_nullable: boolean;
  type: SysColumnTypes;
  primary: boolean;
}

export async function generate(conn: Client | Pool, options: Partial<GeneratorOptions> = {}): Promise<GeneratorTable[]>
{
  const opt: GeneratorOptions = {
    tableNameAlias: x => x,
    tableVariableAlias: x => x,
    columnNameAlias: x => x,
    ignore: [],
    types: 'all',
    tab: '\\t',
    tabDepth: 0,
    newline: '\n',
    ...options,
  };

  const inTables = await conn.query<SysTable>(`
    SELECT 
      table_schema AS "schema", 
      table_name AS "name" 
    FROM information_schema.tables
    WHERE table_schema NOT IN ('pg_catalog', 'information_schema')
      ${opt.ignore.length > 0
        ? `AND table_name NOT IN (${opt.ignore.map(n => `'${n}'`).join(',')})`
        : ``
      }
      ${opt.types !== 'all'
        ? `AND table_type = ${opt.types === 'tables' ? "'BASE TABLE'" : "'VIEW'"}`
        : ``
      }
  `);

  const outTables: GeneratorTable[] = [];

  for (const inTable of inTables.rows)
  {
    const outTable: GeneratorTable = {
      table: inTable.name,
      tableAlias: opt.tableNameAlias(inTable.name),
      tableVariable: opt.tableVariableAlias(inTable.name),
      columns: [],
      tableDefinition: '',
      primary: [],
    };

    const inColumns = await conn.query<SysColumn>(`
      SELECT
        c.column_name AS "name",
        c.character_maximum_length AS "max_length",
        c.numeric_precision AS "precision",
        c.numeric_scale AS "scale",
        (c.is_nullable = 'YES') AS "is_nullable",
        c.udt_name as "type",
        COALESCE((
          SELECT true
          FROM information_schema.key_column_usage k
          INNER JOIN information_schema.table_constraints t 
            ON t.constraint_name = k.constraint_name
            AND t.constraint_type = 'PRIMARY KEY'
          WHERE k.table_schema = c.table_schema
            AND k.table_name = c.table_name
            AND k.column_name = c.column_name
        ), false) as "primary"
      FROM information_schema.columns c 
      WHERE c.table_schema = '${inTable.schema}'
          AND c.table_name = '${inTable.name}'
    `);

    for (const inColumn of inColumns.rows)
    {
      const outColumn = {
        column: inColumn.name,
        columnAlias: opt.columnNameAlias(inColumn.name),
        columnType: getColumnType(inColumn),
      };

      if (inColumn.primary) {
        outTable.primary.push(outColumn.columnAlias);
      }

      outTable.columns.push(outColumn);
    }

    outTable.tableDefinition += repeat(opt.tab, opt.tabDepth) + `export const ${outTable.tableVariable} = table({${opt.newline}`;
    outTable.tableDefinition += repeat(opt.tab, opt.tabDepth + 1) + `name: ${quote(outTable.tableAlias)},${opt.newline}`;
    if (outTable.tableAlias !== outTable.table) {
      outTable.tableDefinition += repeat(opt.tab, opt.tabDepth + 1) + `table: ${quote(outTable.table)},${opt.newline}`;
    }
    outTable.tableDefinition += repeat(opt.tab, opt.tabDepth + 1) + `primary: [${outTable.primary.map(quote).join(', ')}],${opt.newline}`;
    outTable.tableDefinition += repeat(opt.tab, opt.tabDepth + 1) + `fields: {${opt.newline}`;
    let columnDifferences = 0;
    for (const col of outTable.columns) {
      outTable.tableDefinition += repeat(opt.tab, opt.tabDepth + 2) + `${prop(col.columnAlias)}: ${JSON.stringify(col.columnType).replace(',', ', ')},${opt.newline}`;
      if (col.columnAlias !== col.column) {
        columnDifferences++;
      }
    }
    outTable.tableDefinition += repeat(opt.tab, opt.tabDepth + 1) + `},${opt.newline}`;
    if (columnDifferences !== 0) {
      outTable.tableDefinition += repeat(opt.tab, opt.tabDepth + 1) + `fieldColumn: {${opt.newline}`;
      for (const col of outTable.columns) {
        if (col.columnAlias !== col.column) {
          outTable.tableDefinition += repeat(opt.tab, opt.tabDepth + 2) + `${prop(col.columnAlias)}: ${quote(col.column)},${opt.newline}`;
        }
      }
      outTable.tableDefinition += repeat(opt.tab, opt.tabDepth + 1) + `},${opt.newline}`;
    }
    outTable.tableDefinition += repeat(opt.tab, opt.tabDepth) + `});`;

    outTables.push(outTable);
  }

  return outTables;
}

export function getColumnType(col: SysColumn): DataTypeInputs
{
  const plain = getColumnTypePlain(col);

  return col.is_nullable
    ? ['NULL', plain]
    : plain;
}

export function getColumnTypePlain(col: SysColumn): DataTypeInputs
{
  switch (col.type) {
    case 'bit': return 'BIT';
    case 'char': return ['CHAR', col.max_length];
    case 'varchar': return ['VARCHAR', col.max_length];
    case 'text': return 'TEXT';
    case 'date': return 'DATE';
    case 'time': return 'TIME';
    case 'timestamp': return 'TIMESTAMP';
    case 'int2': return 'SMALLINT';
    case 'int4': return 'INT';
    case 'int8': return 'BIGINT';
    case 'money': return 'MONEY';
    case 'numeric': return ['NUMERIC', col.scale, col.precision];
    case 'float4': return 'FLOAT';
    case 'float8': return 'DOUBLE';
    case 'uuid': return 'UUID';
    case 'xml': return 'XML';
    case 'inet': return 'INET';
    case 'json': return 'JSON';
    case 'jsonb': return 'JSON';
    case 'line': return 'LINE';
    case 'lseg': return 'SEGMENT';
    case 'macaddr': return 'MACADDR';
    case 'name': return ['VARCHAR', 64];
    case 'path': return 'PATH';
    case 'point': return 'POINT';
    case 'polygon': return 'POLYGON';
    case 'bool': return 'BOOLEAN';
    case 'box': return 'BOX';
    case 'bytea': return col.max_length > 0 ? ['VARCHAR', col.max_length] : 'TEXT';
    case 'cidr': return 'CIDR';
    case 'circle': return 'CIRCLE';
    case 'geometry': return 'GEOMETRY';
    case 'geography': return 'GEOGRAPHY';
  }

  return 'ANY';
}

function repeat(x: string, n: number)
{
  let r = '';

  while (--n >= 0) {
    r += x;
  }

  return r;
}

function prop(x: string): string
{
  return /^[a-z_$][a-z0-9_]+$/i.test(x) ? x : quote(x);
}

function quote(x: string): string
{
  return "'" + x.replace("'", `\\'`) + "'";
}