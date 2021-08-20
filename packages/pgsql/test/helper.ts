import { loadTypes } from '../src';
import { Client, ClientConfig } from 'pg';


export function newClient(config?: ClientConfig): Client
{
  return new Client({
    host: 'localhost',
    port: 5438,
    user: 'postgres',
    password: 'postgres',
    database: 'tqb',
    connectionTimeoutMillis: 0,
    ...(config || {}),
  });
}

export const client = newClient();

const connPromise = client.connect();
const typePromise = connPromise.then(() => loadTypes(client));

client.on('error', (e) => 
{
  console.error(e);
});

export async function getConnection()
{
  await connPromise;
  await typePromise;

  return client;
}

export async function getClient<R>(config: ClientConfig | undefined, provider: (client: Client) => Promise<R>): Promise<R>
{
  const client = newClient(config);

  try {
    await client.connect();
    await loadTypes(client);

    return await provider(client);
  } catch (e) {
    throw e;
  } finally {
    client.end();
  }
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