import { Client } from 'pg';

export const client = new Client({
  host: 'localhost',
  port: 5435,
  user: 'postgres',
  password: 'postgres',
  database: 'tqb',
});

const connPromise = client.connect();

client.on('error', (e) => 
{
  console.error(e);
});



export async function getConnection()
{
  await connPromise;

  return client;
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