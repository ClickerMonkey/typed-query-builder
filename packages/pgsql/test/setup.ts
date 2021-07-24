import { getConnection } from './helper';


afterAll(async () => 
{
  const conn = await getConnection();

  await conn.end();
});


beforeAll(async () =>
{
  const conn = await getConnection();

  await conn.query(`DELETE FROM "task"`);
  await conn.query(`DELETE FROM "person_group"`);
  await conn.query(`DELETE FROM "person"`);
  await conn.query(`DELETE FROM "group"`);
  await conn.query(`DELETE FROM "locations"`);
});