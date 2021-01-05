import { getConnection } from './helper';


afterAll(async () => 
{
  const conn = await getConnection();

  await conn.close();
});


beforeAll(async () =>
{
  const conn = await getConnection();

  await conn.query(`DELETE FROM [Task]`);
  await conn.query(`DELETE FROM [PersonGroup]`);
  await conn.query(`DELETE FROM [Person]`);
  await conn.query(`DELETE FROM [Group]`);
});