import { Expr, Database, DatabaseQueryProvider, DatabaseResultProvider, DatabaseQueryResult, DatabaseParameters, DatabaseTypeMap, DatabaseProcResult } from './internal';



export interface DatabaseIntercept
{

  /**
   * Intercepts the running of an expression. At the very least the intercept 
   * needs to call and return `await getResult(expr)`.
   * 
   * @param expr The expression that is being executed.
   * @param params The parameters being passed to the expression.
   * @param getResult Gets the result of the expression.
   */
  onExpr<R, O>(
    expr: Expr<R>, 
    params: DatabaseParameters,
    getResult: (expr: Expr<R>) => Promise<O>
  ): Promise<O>;

  /**
   * Intercepts the running of a stored procedure. At the very least the intercept
   * needs to call and return `await getResult(procedure, parameters, output)`.
   * 
   * @param procedure The name of the stored procedure being ran.
   * @param parameters The parameters being passed to the stored procedure.
   * @param output The output parameters of the stored procedure.
   * @param getResult Gets the result of the stored procedure call.
   */
  onProc<T, O extends DatabaseTypeMap = {}>(
    procedure: string, 
    parameters: DatabaseParameters | undefined, 
    output: O | undefined,
    getResult: (procedure: string, parameters?: DatabaseParameters, output?: O) => Promise<DatabaseProcResult<T, O>>
  ): Promise<DatabaseProcResult<T, O>>;

  /**
   * Intercepts the running of a query string. At the very least the intercept
   * needs to call and return `await getResult(query, parameters, output)`.
   * 
   * @param query The query being ran.
   * @param parameters The parameters being passed to the query.
   * @param output The output parameters of the query.
   * @param getResult Gets the result of the query.
   */
  onQuery<T, O extends DatabaseTypeMap = {}>(
    query: string, 
    parameters: DatabaseParameters | undefined, 
    output: O | undefined,
    getResult: (query: string, parameters?: DatabaseParameters, output?: O) => Promise<DatabaseQueryResult<T, O>>
  ): Promise<DatabaseQueryResult<T, O>>;

  /**
   * Intercepts the running of a initialization. At the very least the intercept
   * needs to call  `await initialize()`.
   * 
   * @param initialize Initializes the database.
   */
  onInitialize(
    initialize: () => Promise<void>,
  ): Promise<void>;

  /**
   * Intercepts the running of a transaction. At the very least the intercept
   * needs to call and return `await getResult()`. This may throw an Error
   * and if the message of that error is '#ABORT' then the error needs to be
   * ignored, otherwise rethrow the error.
   * 
   * @param getResult Runs the transaction and returns the result.
   */
  onTransaction<R>(
    getResult: () => Promise<R>,
  ): Promise<R>;

}


export function interceptQueryProvider(db: DatabaseQueryProvider, intercept: Pick<DatabaseIntercept, 'onExpr'>, baseParams: DatabaseParameters = {}): DatabaseQueryProvider
{
  const getParams = (additional?: DatabaseParameters): DatabaseParameters => ({
    ...baseParams,
    ...(additional || {}),
  });

  return {
    prepare: (initialParams, preparedName) => {
      const p = getParams(initialParams);
      return (q) => intercept.onExpr(q, p, db.prepare(p, preparedName));
    },
    count: (params) => {
      const p = getParams(params);
      return (q) => intercept.onExpr(q, p, db.count(p));
    },
    countMany: (params) => {
      const p = getParams(params);
      return (...q) => Promise.all(q.map(e => intercept.onExpr(e, p, db.count(p)))) as any;
    },
    countTuples: (params) => {
      const p = getParams(params);
      return (q) => intercept.onExpr(q, p, db.countTuples(p));
    },
    get: (params) => {
      const p = getParams(params);
      return (q) => intercept.onExpr(q, p, db.get(p));
    },
    many: (params) => {
      const p = getParams(params);
      return (...q) => Promise.all(q.map(e => intercept.onExpr(e, p, db.get(p)))) as any;
    },
    tuples: (params) => {
      const p = getParams(params);
      return (q) => intercept.onExpr(q, p, db.tuples(p));
    },
    stream: (batchSize, params) => {
      const p = getParams(params);
      return (q) => intercept.onExpr(q, p, db.stream(batchSize, p) as any) as any;
    },
    streamTuples: (batchSize, params) => {
      const p = getParams(params);
      return (q) => intercept.onExpr(q, p, db.streamTuples(batchSize, p) as any) as any;
    },
    run: (params) => {
      const p = getParams(params);
      return (q) => Promise.all(q.map(e => intercept.onExpr(e, p, db.get(p)))) as any;
    },
  }
}

export function interceptResultProvider(db: DatabaseResultProvider, intercept: Pick<DatabaseIntercept, 'onExpr' | 'onProc' | 'onQuery'>): DatabaseResultProvider
{
  return {
    ...interceptQueryProvider(db, intercept),
    params: (parameters) => {
      return interceptQueryProvider(db, intercept, parameters);
    },
    proc: (name, parameters, output) => {
      return intercept.onProc(
        name, 
        parameters,
        output,
        (procedure, parameters, output) => db.proc(procedure, parameters, output),
      );
    },
    query: (query, parameters, output) => {
      return intercept.onQuery(
        query, 
        parameters,
        output,
        (query, parameters, output) => db.query(query, parameters, output),
      );
    },
  };
}

export function interceptDatabase(db: Database, intercept: DatabaseIntercept): Database
{
  const resultProvider = interceptResultProvider(db, intercept);

  return {
    ...resultProvider,
    initialize: () => {
      return intercept.onInitialize(() => db.initialize());
    },
    transaction: (run) => {
      return intercept.onTransaction(() => db.transaction(() => run(resultProvider, () => { throw new Error('#ABORT'); })));
    },
  };
}