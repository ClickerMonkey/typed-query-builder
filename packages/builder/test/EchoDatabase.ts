import { DatabaseParameters, DatabaseQueryProvider, DatabaseResultProvider, Database } from '../src';


export function echoQueryProvider(baseParams: DatabaseParameters = {}): DatabaseQueryProvider
{
  const getParams = (additional?: DatabaseParameters): DatabaseParameters => ({
    ...baseParams,
    ...(additional || {}),
  });

  const queryProvider: DatabaseQueryProvider = {
    prepare: (initialParams, preparedName) => {
      const params = getParams(initialParams);
      return (expr) => ({ params, expr, preparedName }) as any;
    },
    count: (otherParams) => {
      const params = getParams(otherParams);
      return (expr) => ({ params, expr }) as any;
    },
    countMany: (otherParams) => {
      const params = getParams(otherParams);
      return (...exprs) => ({ params, exprs }) as any;
    },
    countTuples: (otherParams) => {
      const params = getParams(otherParams);
      return (expr) => ({ params, expr }) as any;
    },
    get: (otherParams) => {
      const params = getParams(otherParams);
      return (expr) => ({ params, expr }) as any;
    },
    many: (otherParams) => {
      const params = getParams(otherParams);
      return (...exprs) => ({ params, exprs }) as any;
    },
    tuples: (otherParams) => {
      const params = getParams(otherParams);
      return (expr) => ({ params, expr }) as any;
    },
    stream: (batchSize, otherParams) => {
      const params = getParams(otherParams);
      return (expr) => ({ params, expr, batchSize }) as any;
    },
    streamTuples: (batchSize, otherParams) => {
      const params = getParams(otherParams);
      return (expr) => ({ params, expr, batchSize }) as any;
    },
    run: (otherParams) => {
      const params = getParams(otherParams);
      return (exprs) => ({ params, exprs }) as any;
    },
  };

  return queryProvider;
}

export function echoResultProvider(): DatabaseResultProvider
{
  const resultProvider: DatabaseResultProvider = {
    ...echoQueryProvider(),
    params: (parameters) => echoQueryProvider(parameters),
    proc: (name, parameters, output) => ({ name, parameters, output }) as any,
    query: (query, parameters, output) => ({ query, parameters, output }) as any,
  };

  return resultProvider;
}

export function echoDatabase(): Database
{
  const resultProvider = echoResultProvider();

  const database: Database = {
    ...resultProvider,
    initialize: async () => {},
    transaction: async (run) => {
      try {
        return await run(resultProvider, () => { throw new Error('#ABORT'); });
      } catch (e) {
        if (!(e instanceof Error) || e.message !== '#ABORT') {
          throw e;
        }
      }

      return undefined as any;
    },
  };

  return database;
}