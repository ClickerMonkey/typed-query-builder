import { fns, interceptDatabase } from '../src';
import { echoDatabase } from './EchoDatabase';

const echo = echoDatabase();

describe('Database', () =>
{

  it('echo', async () => 
  {
    const expr = fns.pi();

    const r = await echo.get()(expr);

    expect(r).toStrictEqual({ expr, params: {} });
  });

  it('intercepts', async () =>
  {
    const expr = fns.pi();

    let counter = 0;

    const db = interceptDatabase(echo, {
      onInitialize: async (initialize) => {
        await initialize();
      },
      onExpr: async (expr, params, getResult) => {
        counter++;
        try {
          return await getResult(expr);
        } finally {
          counter++;
        }
      },
      onProc: async (proc, params, out, getResult) => {
        counter++;
        try {
          return await getResult(proc, params, out);
        } finally {
          counter++;
        }
      },
      onQuery: async (query, params, out, getResult) => {
        counter++;
        try {
          return await getResult(query, params, out);
        } finally {
          counter++;
        }
      },
      onTransaction: async (getResult) => {
        counter++;
        try {
          return await getResult();
        } finally {
          counter++;
        }
      },
    });

    expect(counter).toEqual(0);
    expect(await db.get()(expr)).toStrictEqual({ expr, params: {} });
    expect(counter).toEqual(2);

    expect(await db.proc('proc')).toStrictEqual({ name: 'proc', output: undefined, parameters: undefined });
    expect(counter).toEqual(4);
  });

});