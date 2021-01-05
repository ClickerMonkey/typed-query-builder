import sql from 'mssql';


export const pool = new sql.ConnectionPool({
  server: 'localhost',
  database: 'tqb',
  user: 'test',
  password: 'password#1',
  options: {
    enableArithAbort: true,
  },
});

const connPromise = pool.connect();

pool.on('error', (e) => 
{
  console.error(e);
});



export async function getConnection()
{
  return await connPromise;
}


export function expectText(options: { condenseSpace?: boolean, ignoreSpace?: boolean, ignoreCase?: boolean }, x: string, y: string)
{
  const a = options.condenseSpace
    ? removeExtraWhitespace(x)
    : options.ignoreSpace
      ? removeAllWhitespace(x)
      : x;
  const b = options.condenseSpace
    ? removeExtraWhitespace(y)
    : options.ignoreSpace
      ? removeAllWhitespace(y)
      : y;
  const c = options.ignoreCase
    ? a.toLowerCase()
    : a;
  const d = options.ignoreCase
    ? b.toLowerCase()
    : b;

  expect(c).toBe(d);
}

export function removeExtraWhitespace(x: string)
{
  return x.replace(/\s+/g, ' ').replace(/^\s+/, '').replace(/\s+$/, '');
}

export function removeAllWhitespace(x: string)
{
  return x.replace(/\s+/g, '');
}