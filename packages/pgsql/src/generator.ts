import { ConnectionPool } from 'mssql';
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
  tab: string;
  tabDepth: number;
  newline: string;
}

interface SysTable
{
  name: string;
  object_id: number;
}

interface SysColumn
{
  name: string;
  system_type_id: number;
  max_length: number;
  precision: number;
  scale: number;
  is_nullable: boolean;
  type: string;
  type_max_length: number;
  type_precision: number;
  type_scale: number;
  primary: number;
}

export async function generate(conn: ConnectionPool, options: Partial<GeneratorOptions> = {}): Promise<GeneratorTable[]>
{
  const inTables = await conn.query<SysTable>(`
    SELECT 
      name, 
      object_id 
    FROM sys.Tables
  `);

  const opt: GeneratorOptions = {
    tableNameAlias: x => x,
    tableVariableAlias: x => x,
    columnNameAlias: x => x,
    tab: '\\t',
    tabDepth: 0,
    newline: '\n',
    ...options,
  };

  const outTables: GeneratorTable[] = [];

  for (const inTable of inTables.recordset)
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
        c.name, 
        CASE 
          WHEN c.max_length <> -1 AND t.name IN ('nchar', 'nvarchar') 
          THEN c.max_length / 2
          ELSE c.max_length
        END AS max_length,
        c.user_type_id, 
        c.precision, 
        c.scale, 
        c.is_nullable,
        t.name AS type,
        CASE 
          WHEN t.max_length <> -1 AND t.name IN ('nchar', 'nvarchar') 
          THEN t.max_length / 2
          ELSE t.max_length
        END AS type_max_length,
        t.precision AS type_precision,
        t.scale AS type_scale,
        (SELECT COUNT(*) 
          FROM sys.Index_Columns AS ic 
          INNER JOIN sys.Indexes AS i 
            ON i.index_id = ic.index_id 
            AND i.object_id = c.object_id
          WHERE ic.column_id = c.column_id 
            AND i.is_primary_key = 1 
            AND ic.object_id = c.object_id
        ) AS [primary]
      FROM sys.Columns AS c
      INNER JOIN sys.Types AS t ON t.user_type_id = c.user_type_id
      WHERE object_id = ${inTable.object_id}
    `);

    for (const inColumn of inColumns.recordset)
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
    case 'bigint': return 'BIGINT';
    case 'binary': return ['BINARY', col.max_length];
    case 'bit': return 'BIT';
    case 'char': return ['CHAR', col.max_length];
    case 'date': return 'DATE';
    case 'datetime': return 'TIMESTAMP';
    case 'datetime2': return 'TIMESTAMP';
    case 'datetimeoffset': return { timezoned: 'TIMESTAMP' };
    case 'decimal': return ['DECIMAL', col.scale, col.precision];
    case 'float': return 'FLOAT';
    case 'geography': return 'GEOMETRY';
    case 'geometry': return 'GEOMETRY';
    case 'image': return 'BLOB';
    case 'int': return col.max_length === col.type_max_length
      ? 'INT'
      : ['INT', col.max_length];
    case 'money': return 'MONEY';
    case 'nchar': return ['NCHAR', col.max_length];
    case 'ntext': return 'NTEXT';
    case 'numeric': return col.scale !== col.type_scale && col.precision !== col.type_precision
      ? 'NUMERIC'
      : col.precision !== col.type_precision
        ? ['NUMERIC', col.scale]
        : ['NUMERIC', col.scale, col.precision];
    case 'nvarchar': return col.max_length === -1 ? 'NTEXT' : ['NVARCHAR', col.max_length];
    case 'real': return 'FLOAT';
    case 'smalldatetime': return 'TIMESTAMP';
    case 'smallint': return col.max_length === col.type_max_length
      ? 'SMALLINT'
      : ['SMALLINT', col.max_length];
    case 'smallmoney': return 'SMALLMONEY';
    case 'text': return 'TEXT';
    case 'time': return 'TIME';
    case 'timestamp': return 'TIMESTAMP';
    case 'tinyint': return col.max_length === col.type_max_length
      ? 'TINYINT'
      : ['TINYINT', col.max_length];
    case 'uniqueidentifier': return 'UUID';
    case 'varbinary': return ['VARBINARY', col.max_length];
    case 'varchar': return col.max_length === -1 ? 'TEXT' : ['VARCHAR', col.max_length];
    case 'xml': return 'XML';
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