import { ExprValueTuples, DataTypeInputs, Expr, ExprValueObjects, getDataTypeFromInput, getDataTypeFromValue, getDataTypeMeta, QueryFirst, QueryFirstValue, QueryList, QueryJson, isArray, isString, isPlainObject, isFunction } from '@typed-query-builder/builder';
import { DialectOutput } from '@typed-query-builder/sql';
import { DialectMssql } from '@typed-query-builder/sql-mssql';
import { ConnectionPool, IResult, ISqlType, MAX, PreparedStatement, Request, Transaction, TYPES } from 'mssql';


import './parsers';

/**
 * Options 
 */
export interface MssqlOptions<P>
{

  /**
   * Named parameters to pass to the query.
   */
  params?: P;

  /**
   * If errors should be thrown when building the SQL when an unsupported feature is being used.
   */
  throwError?: boolean;

  /**
   * If constants should avoided being passed in SQL string and passed as parameters instead.
   */
  constantsAsParams?: boolean;

  /**
   * If the raw expression should be executed, otherwise if it's not a SELECT, INSERT, DELETE, or UPDATE it will be wrapped as a SELECT.
   */
  raw?: boolean;

  /**
   * If the SQL string generated should remove redudant table/source references to columns that are unique in their context.
   */
  simplifyReferences?: boolean;

  /**
   * If the affected count should be returned, transforming the result into { affected: number, result: any }.
   */
  affectedCount?: boolean;
  
  /**
   * If any records to be returned should be arrays instead of objects.
   */
  arrayMode?: boolean;

  /**
   * When calling stream, if the stream should take pauses between batch sizes to process a batch at once.
   */
  streamBatchSize?: number;

  /**
   * If true all strings in results will be inspected for JSON values and be automatically parsed.
   */
  detectJson?: boolean;

  /**
   * If true all strings in results will be inspected for "YYYY-MM-DD" format and automatically converted to a Date (or custom object).
   */
  detectDate?: boolean | ((detected: string) => any);

  /**
   * If true all strings in results will be inspected for "YYYY-MM-DD(T| )hh:mm:ss" format and automatically converted to a Date (or custom object).
   */
  detectSmallDateTime?: boolean | ((detected: string) => any);

  /**
   * If true all strings in results will be inspected for "YYYY-MM-DD(T| )hh:mm:ss[.nnn]" format and automatically converted to a Date (or custom object).
   */
  detectDateTime?: boolean | ((detected: string) => any);

  /**
   * If true all strings in results will be inspected for "YYYY-MM-DD(T| )hh:mm:ss[.nnnnnnn]" format and automatically converted to a Date (or custom object).
   */
  detectDateTime2?: boolean | ((detected: string) => any);

  /**
   * If true all strings in results will be inspected for "YYYY-MM-DD(T| )hh:mm:ss[.nnnnnnn] [+|-]hh:mm" format and automatically converted to a Date (or custom object).
   */
  detectDateTimeOffset?: boolean | ((detected: string) => any);

  /**
   * If true all strings will be inspected for a date format and will be automatically converted to a Date (or custom object).
   */
  detectAllDates?: boolean | ((detected: string) => any);

}


export type AffectedResult<R> = { affected: number, result: R };

/**
 * Executes an expression and returns the result.
 * 
 * **Example:**
 * ```ts
 * const result = await expr.run( exec(conn) );
 * ```
 * 
 * @param access The connection, transaction, or prepared statement to stream the expression results from.
 * @param options Options that control how the query is built or the results returned.
 */
export function exec<P = any>(access: ConnectionPool | Transaction | PreparedStatement | undefined, options: MssqlOptions<P> & { affectedCount: true }): <R>(expr: Expr<R>) => Promise<AffectedResult<ExprValueObjects<R>>>
export function exec<P = any>(access: ConnectionPool | Transaction | PreparedStatement | undefined, options: MssqlOptions<P> & { affectedCount: true, arrayMode: true }): <R>(expr: Expr<R>) => Promise<AffectedResult<ExprValueTuples<R>>>
export function exec<P = any>(access: ConnectionPool | Transaction | PreparedStatement | undefined, options: MssqlOptions<P> & { arrayMode: true }): <R>(expr: Expr<R>) => Promise<ExprValueTuples<R>>
export function exec<P = any>(access?: ConnectionPool | Transaction | PreparedStatement, options?: MssqlOptions<P>): <R>(expr: Expr<R>) => Promise<ExprValueObjects<R>>
export function exec<P = any>(access?: ConnectionPool | Transaction | PreparedStatement, options?: MssqlOptions<P>): <R>(expr: Expr<R>) => Promise<any>
{
  return async <R>(e: Expr<R>) =>
  {
    const request = new Request(access as any);

    if (options && options.arrayMode) 
    {
      (request as any).arrayRowMode = true;
    }

    const outputFactory = DialectMssql.output(options);
    const output = outputFactory(e);
    
    addParams(request, output, options?.params);
    
    try
    {
      const results = await request.query<ExprValueObjects<R>>(output.query);

      return parseResult(e, results, options);
    }
    catch (e)
    {
      throw new Error(e + '\n\nQuery: ' + output.query);
    }
  };
}

/**
 * The result passed to a stream listener.
 */
export type StreamListenerResult<R> = R extends Array<infer E> ? E : R;

/**
 * A listener to results.
 */
export type StreamListener<R, A> = (result: StreamListenerResult<R>, batchIndex: number, batchCount: number, batch: StreamListenerResult<R>[]) => A | Promise<A>;

/**
 * A handler that triggers the query and each result is passed to the listener.
 */
export type StreamHandler<R> = <A>(listener: StreamListener<R, A>) => Promise<A[]>;

/**
 * Generates a way to stream the results of a query for the processing of large datasets.
 * When batch size is given > 1, the given number are collected in memory and once that size is 
 * reached or there are no more results the request is paused to avoid memory exhaustion and calls 
 * the function in quick succession with all collected results.
 * 
 * **Example:**
 * ```ts
 * const streamer = expr.run( stream(conn, { streamBatchSize: 100 }) );
 * 
 * const accumulated = await streamer(async (record) => {
 *  // handle record, can be async, can return a value to be returned in accumulated array
 * });
 * ```
 * 
 * @param access The connection, transaction, or prepared statement to stream the expression results from.
 * @param options Options that control how the query is built or the results returned.
 * @returns A function which when invoked with another function will execute the expression and for each result returned will call the given function.
 */
export function stream<P = any>(access: ConnectionPool | Transaction | PreparedStatement | undefined, options: MssqlOptions<P> & { arrayMode: true }): <R>(expr: Expr<R>) => StreamHandler<ExprValueTuples<R>>
export function stream<P = any>(access?: ConnectionPool | Transaction | PreparedStatement, options?: MssqlOptions<P>): <R>(expr: Expr<R>) => StreamHandler<ExprValueObjects<R>>
export function stream<P = any>(access?: ConnectionPool | Transaction | PreparedStatement, options?: MssqlOptions<P>): <R>(expr: Expr<R>) => StreamHandler<any>
{
  return <R>(e: Expr<R>) =>
  {
    return async (listener: StreamListener<any, any>) =>
    {
      const batchSize = options?.streamBatchSize || 1;
      const request = new Request(access as any);

      request.stream = true;

      if (options && options.arrayMode) 
      {
        (request as any).arrayRowMode = true;
      }

      const outputFactory = DialectMssql.output(options);
      const output = outputFactory(e);
      
      addParams(request, output, options?.params);

      try
      {
        request.query<ExprValueObjects<R>>(output.query);

        const accumulated: any[] = [];
        const batchOutside: any[] = [];
        let batchCount = 0;

        const processBatch = async (batch: any[]) =>
        {
          for (let batchIndex = 0; batchIndex < batch.length; batchIndex++)
          {
            const accumulateResult = await listener(batch[batchIndex], batchIndex, batchCount, batch);
            
            if (accumulateResult !== undefined)
            {
              accumulated.push(accumulateResult);
            }
          }

          batchCount++;
        };

        request.on('row', async (raw: any) => 
        {
          const result = parseResult(e, { recordset: [raw] } as any, options);

          batchOutside.push(e instanceof QueryFirst || e instanceof QueryFirstValue ? result : result[0]);

          if (batchOutside.length === batchSize)
          {
            if (batchSize !== 1)
            {
              request.pause()
            }

            const batch = batchOutside.slice();

            batchOutside.splice(0, batchOutside.length);

            await processBatch(batch);

            if (batchSize !== 1)
            {
              request.resume();
            }
          }
        });

        return new Promise((resolve, reject) => 
        {
          request.on('error', (err) => 
          {
            reject(err);
          });
      
          request.on('done', async () => 
          {
            if (batchOutside.length > 0)
            {
              await processBatch(batchOutside.slice());
            }

            resolve(accumulated);
          });
        });
      }
      catch (e)
      {
        throw new Error(e + '\n\nQuery: ' + output.query);
      }
    };
  };
}



/**
 * A prepared query that can be executed multiple times. It MUST be released, ideally in a try-finally block.
 */
export interface PreparedQuery<R, P = any>
{
  exec(params: P): Promise<R>;
  release(): Promise<void>;
}

/**
 * Creates a prepared statement for the given expression. This is useful when you need to invoke the same query over and over
 * with different parameters. A prepared statement MUST be released, ideally in a try-finally block.
 * 
 * **Example:**
 * ```ts
 * const prepared = expr.run( prepare(conn) );
 * 
 * try {
 *  await prepared.exec({ id: 12 });
 *  await prepared.exec({ id: 34 });
 * } finally {
 *  await prepared.release();
 * }
 * ```
 * 
 * @param access The connection, transaction, or prepared statement to stream the expression results from.
 * @param options Options that control how the query is built or the results returned.
 * @returns An object that can be executed multiple times, once finished it must be released.
 */
export function prepare<P = any>(access: ConnectionPool | Transaction | undefined, options: MssqlOptions<P> & { affectedCount: true }): <R>(expr: Expr<any>) => Promise<PreparedQuery<AffectedResult<ExprValueObjects<R>>, P>>
export function prepare<P = any>(access: ConnectionPool | Transaction | undefined, options: MssqlOptions<P> & { affectedCount: true, arrayMode: true }): <R>(expr: Expr<any>) => Promise<PreparedQuery<AffectedResult<ExprValueTuples<R>>, P>>
export function prepare<P = any>(access: ConnectionPool | Transaction | undefined, options: MssqlOptions<P> & { arrayMode: true }): <R>(expr: Expr<R>) => Promise<PreparedQuery<ExprValueTuples<R>, P>>
export function prepare<P = any>(access?: ConnectionPool | Transaction, options?: MssqlOptions<P>): <R>(expr: Expr<R>) => Promise<PreparedQuery<ExprValueObjects<R>, P>>
export function prepare<P = any>(access?: ConnectionPool | Transaction, options?: MssqlOptions<P>): <R>(expr: Expr<R>) => Promise<PreparedQuery<any, P>>
{
  return async <R>(e: Expr<R>) =>
  {
    const prepared = new PreparedStatement(access as any);

    if (options && options.arrayMode) 
    {
      (prepared as any).arrayRowMode = true;
    }

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

    const preparedQuery: PreparedQuery<any, P> = 
    {
      async exec(params): Promise<any> 
      { 
        const result = await prepared.execute({
          ...defaults,
          ...(options?.params || {}),
          ...params
        });

        return parseResult(e, result, options);
      },
      async release(): Promise<void> 
      {
        await prepared.unprepare();
      },
    };

    return preparedQuery;
  };
}

export function parseResult<R, P>(expr: Expr<R>, iresult: IResult<ExprValueObjects<R>>, options?: MssqlOptions<P>)
{
  let result = DialectMssql.getResult(expr, handleResult(expr, iresult, options));

  if (options && (options.detectJson || options.detectDate || options.detectSmallDateTime || options.detectDateTime || options.detectDateTime2 || options.detectDateTimeOffset || options.detectAllDates))
  {
    const traverse = (value: any, onValue: (value: any) => any) => 
    {
      value = onValue(value);

      if (isArray(value)) 
      {
        for (let i = 0; i < value.length; i++) 
        {
          value[i] = traverse(value[i], onValue);
        }
      } 
      else if (isPlainObject(value)) 
      {
        for (const prop in value) 
        {
          value[prop] = traverse(value[prop], onValue);
        }
      }

      return value;
    };

    if (options.detectJson)
    {
      result = traverse(result, (value) => 
      {
        if (isString(value) && value.match(/^({|true$|false$|\[|null$|[+-]?\d|")/)) 
        {
          try {
            return JSON.parse(value);
          } catch (e) {}
        }

        return value;
      });
    }

    const dateDetectors = [
      {
        detect: options.detectDate || options.detectAllDates,
        length: 10,
        regex: /^\d{4}-\d\d-\d\d$/,
        toDate: (value: string) => new Date(value + 'T00:00:00'),
      },
      {
        detect: options.detectSmallDateTime || options.detectAllDates,
        length: 19,
        regex: /^\d{4}-\d\d-\d\d(T|\s)\d\d:\d\d:\d\d?$/,
        toDate: (value: string) => new Date(value),
      },
      {
        detect: options.detectDateTime || options.detectAllDates,
        length: 23,
        regex: /^\d{4}-\d\d-\d\d(T|\s)\d\d:\d\d:\d\d\.\d{3}?$/,
        toDate: (value: string) => new Date(value),
      },
      {
        detect: options.detectDateTime2 || options.detectAllDates,
        length: 27,
        regex: /^\d{4}-\d\d-\d\d(T|\s)\d\d:\d\d:\d\d\.\d{7}?$/,
        toDate: (value: string) => new Date(value),
      },
      {
        detect: options.detectDateTimeOffset || options.detectAllDates,
        length: 34,
        regex: /^\d{4}-\d\d-\d\d(T|\s)\d\d:\d\d:\d\d\.\d{7}\s[+-]\d\d:\d\d?$/,
        toDate: (value: string) => new Date(value.replace(/\s([-+])/, '$1')),
      }
    ];

    if (dateDetectors.some(d => d.detect))
    {
      for (const detector of dateDetectors)
      {
        if (isFunction(detector.detect))
        {
          detector.toDate = detector.detect;
        }
      }

      result = traverse(result, (value) =>
      {
        if (isString(value))
        {
          for (const detector of dateDetectors)
          {
            if (value.length === detector.length && value.match(detector.regex))
            {
              return detector.toDate(value);
            }
          }
        }

        return value;
      });
    }
  }

  return options?.affectedCount
    ? { affected: iresult.rowsAffected[0], result }
    : result;
}

export function handleResult<R, P>(expr: Expr<R>, result: IResult<ExprValueObjects<R>>, options?: MssqlOptions<P>): any
{
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

  if (expr instanceof QueryJson)
  {
    return result.recordset[0];
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