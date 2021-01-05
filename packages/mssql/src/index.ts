import { DataTypeInputs, Expr, ExprValueObjects, getDataTypeFromInput, getDataTypeFromValue, getDataTypeMeta, QueryFirst, QueryFirstValue, QueryList } from '@typed-query-builder/builder';
import { DialectOutput } from '@typed-query-builder/sql';
import { DialectMssql } from '@typed-query-builder/sql-mssql';
import { ConnectionPool, IResult, ISqlType, MAX, PreparedStatement, Request, TYPES } from 'mssql';



export interface RequestProvider
{
  request(): Request;
}

export interface MssqlOptions<P>
{
  params?: P;
  throwError?: boolean;
  constantsAsParams?: boolean;
  raw?: boolean;
  simplifyReferences?: boolean;
  affectedCount?: boolean;
}

export function exec<P = any>(requestProvider: RequestProvider, options: MssqlOptions<P> & { affectedCount: true }): (expr: Expr<any>) => Promise<number>
export function exec<P = any>(requestProvider: RequestProvider, options?: MssqlOptions<P>): <R>(expr: Expr<R>) => Promise<ExprValueObjects<R>>
export function exec<P = any>(requestProvider: RequestProvider, options?: MssqlOptions<P>): <R>(expr: Expr<R>) => Promise<ExprValueObjects<R>>
{
  return async <R>(e: Expr<R>) =>
  {
    const request = requestProvider.request();
    const outputFactory = DialectMssql.output(options);
    const output = outputFactory(e);
    
    addParams(request, output, options?.params);
    
    try
    {
      const results = await request.query<ExprValueObjects<R>>(output.query);

      return handleResult(e, results, options) as any;
    }
    catch (e)
    {
      throw new Error(e + '\n\nQuery: ' + output.query);
    }
  };
}

export interface PreparedQuery<R, P = any>
{
  exec(params: P): Promise<ExprValueObjects<R>>;
  release(): Promise<void>;
}

export function prepare<P = any>(conn: ConnectionPool, options: MssqlOptions<P> & { affectedCount: true }): (expr: Expr<any>) => Promise<PreparedQuery<number, P>>
export function prepare<P = any>(conn: ConnectionPool, options?: MssqlOptions<P>): <R>(expr: Expr<R>) => Promise<PreparedQuery<R, P>>
export function prepare<P = any>(conn: ConnectionPool, options?: MssqlOptions<P>): <R>(expr: Expr<R>) => Promise<PreparedQuery<R, P>>
{
  return async <R>(e: Expr<R>) =>
  {
    const prepared = new PreparedStatement(conn);
    const outputFactory = DialectMssql.output(options);
    const output = outputFactory(e);
    const defaults: Partial<P> = {};

    for (const paramName in output.paramIndices) 
    {
      const paramIndex = output.paramIndices[paramName];
      const paramTypeGiven = output.paramTypes[paramIndex];
      const paramValue = output.params[paramIndex];
      const paramType = getDataType(paramValue, paramTypeGiven);

      defaults[paramName] = paramValue;
    
      prepared.input(paramName, paramType);
    }

    await prepared.prepare(output.query);

    const preparedQuery: PreparedQuery<R, P> = 
    {
      async exec(params): Promise<ExprValueObjects<R>> 
      { 
        const result = await prepared.execute({
          ...defaults,
          ...(options?.params || {}),
          ...params
        });

        return handleResult(e, result, options) as any;
      },
      async release(): Promise<void> 
      {
        await prepared.unprepare();
      },
    };

    return preparedQuery;
  };
}

export function handleResult<R, P>(expr: Expr<R>, result: IResult<ExprValueObjects<R>>, options?: MssqlOptions<P>)
{
  if (options && options.affectedCount)
  {
    return result.rowsAffected[0];
  }

  if (expr instanceof QueryFirst)
  {
    return result.recordset[0] || null;
  }

  if (expr instanceof QueryFirstValue)
  {
    for (const prop in result.recordset[0])
    {
      return result.recordset[0][prop];
    }
  }

  if (expr instanceof QueryList)
  {
    return result.recordset.map( r => (r as any).item );
  }

  return result.recordset;
}

export function addParams(request: Request, out: DialectOutput, params: any)
{
  for (const paramName in out.paramIndices) 
  {
    if (!(paramName in params)) 
    {
      const paramIndex = out.paramIndices[paramName];

      addParam(request, out, paramName, out.params[paramIndex]);
    }
  }

  if (params) 
  {
    for (const paramName in params)
    {
      addParam(request, out, paramName, params[paramName]);
    }
  }
}

export function addParam(request: Request, out: DialectOutput, paramName: string, paramValue: any)
{
  const paramIndex = out.paramIndices[paramName];
  const paramTypeGiven = out.paramTypes[paramIndex];
  const paramType = getDataType(paramValue, paramTypeGiven);

  request.input(paramName, paramType, paramValue);
}

export function getDataType(value: any, givenType?: DataTypeInputs): ISqlType | (() => ISqlType)
{
  const dataType = givenType || getDataTypeFromValue(value);
  const dataTypeName = getDataTypeFromInput(dataType);
  const meta = getDataTypeMeta(dataType);

  switch (dataTypeName) 
  {
    case 'BOOLEAN':
    case 'BIT':
      return TYPES.Bit;
    case 'TINYINT':
      return TYPES.TinyInt;
    case 'SMALLINT':
      return TYPES.SmallInt;
    case 'MEDIUMINT':
    case 'INT':
      return TYPES.Int;
    case 'BIGINT':
      return TYPES.BigInt;
    case 'FLOAT':
    case 'DOUBLE':
      return TYPES.Float();
    case 'DECIMAL':
      return TYPES.Decimal(meta.totalDigits, meta.fractionDigits);
    case 'NUMERIC':
      return TYPES.Numeric(meta.totalDigits, meta.fractionDigits);
    case 'MONEY':
      return TYPES.Money;
    case 'SMALLMONEY':
      return TYPES.SmallMoney;
    case 'NCHAR':
      return TYPES.NChar(meta.length);
    case 'CHAR':
      return TYPES.Char(meta.length);
    case 'NVARCHAR':
      return TYPES.NVarChar(meta.length);
    case 'VARCHAR':
      return TYPES.VarChar(meta.length);
    case 'NTEXT':
      return TYPES.NText();
    case 'TEXT':
      return TYPES.Text();
    case 'TIMESTAMP':
      return TYPES.DateTime2();
    case 'DATE':
      return TYPES.Date();
    case 'TIME':
      return TYPES.Time();
    case 'UUID':
      return TYPES.UniqueIdentifier();
    case 'CIDR':
      return TYPES.VarChar(45);
    case 'INET':
      return TYPES.VarChar(45);
    case 'MACADDR':
      return TYPES.VarChar(17);
    case 'BINARY':
      return TYPES.Binary;
    case 'VARBINARY':
      return TYPES.VarBinary(meta.length);
    case 'BLOB':
      return TYPES.VarBinary(MAX);
    case 'JSON':
      return TYPES.NVarChar(MAX);
    case 'XML':
      return TYPES.Xml;
    case 'BOX':
    case 'CIRCLE':
    case 'LINE':
    case 'SEGMENT':
    case 'PATH':
    case 'POLYGON':
    case 'POINT':
    case 'GEOMETRY':
      return meta.srid === 0 ? TYPES.Geometry : TYPES.Geography;
  }
  
  return TYPES.NVarChar(MAX);
}