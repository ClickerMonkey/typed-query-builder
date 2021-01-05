# @typed-query-builder/mssql

See [typed-query-builder README](https://github.com/ClickerMonkey/typed-query-builder/blob/master/README.md) for more details.  
See [tests](test/index.spec.ts) for more query examples.  
See [generator](test/generator.spec.ts) for a table generator example.  

## Examples

### Generate tables given a connection
```ts
import { generate } from '@typed-query-builder/mssql/generator';

const gen = await generate(conn);
const genFile =  gen.map(t => t.tableDefinition).join('\n\n');

// genFile is now a series of `export const Table = table({ ... })` commands based on your tables.
// generate can be passed options to control variable name, table alias, column aliases, etc.
```

### Query Examples
```ts
import mssql from 'mssql';
import { from, update, insert, table } from '@typed-query-builder/builder';
import { exec, prepare } from '@typed-query-builder/mssql';
import { generate } from '@typed-query-builder/mssql/generator';

// Define tables
const PersonTable = table({
  name: 'Person',
  primary: ['ID'],
  fields: {
    ID: "INT",
    Name: ["NVARCHAR", 128],
    Email: ["NVARCHAR", 128],
    Location: ["NULL", "POINT"],
  },
});

const TaskTable = table({
  name: 'Task',
  primary: ['ID'],
  fields: {
    ID: "INT",
    GroupID: "INT",
    Name: ["NVARCHAR", 128],
    Details: "NTEXT",
    Done: "BIT",
    DoneAt: ["NULL", "TIMESTAMP"],
    ParentID: ["NULL", "INT"],
    AssignedTo: ["NULL", "INT"],
    AssignedAt: ["NULL", "TIMESTAMP"],
    CreatedAt: "TIMESTAMP",
    CreatedBy: ["NULL", "INT"],
  },
});

// Reusable functions to process builders. Can pass transaction or connection.
const getResult = exec(conn);
const getCount = exec(conn, { affectedCount: true });
const getPrepared = prepare(conn);

// Select first record in a table
const first = await from(TaskTable)
  .select('*')
  .first()
  .run( getResult )
;

// Update Done to true
const updateCount = await update(TaskTable)
  .set('Done', true)
  .where(({ Task }) => Task.ID.eq(first.ID))
  .run( getCount )
;

// Select record in table by parameter ID
const paramedResult = await from(TaskTable)
  .select('*')
  .where(({ Task }, { param }) => Task.ID.eq(param('id')))
  .first()
  .run( exec(conn, { params: { id: first.ID } }))
;

// Do it with a prepared statement
const findById = await from(TaskTable)
  .select('*')
  .where(({ Task }, { param }) => Task.ID.eq(param('id')))
  .first()
  .run( getPrepared )
;

try {
  const first = await findById.exec({ id: 23 });
} finally {
  // Prepared statements NEED to be released in a finally
  findById.release();
}

// Inserts with values
const insertIds = await insert(PersonTable, ['Name', 'Email'])
  .returning(({ Person }) => [Person.ID])
  .values([
    { Name: 'Person 1', Email: 'Person1@gmail.com' },
    { Name: 'Person 2', Email: 'Person2@gmail.com' }
  ])
  .run( getResult )
;

// Inserts with prepared
const insertPrepared = await insert(TaskTable, ['GroupID', 'Name', 'Details'])
  .returning(({ Task }) => [Task.ID, Task.CreatedAt])
  .valuesFromParams()
  .run( getPrepared )
;

try
{
  // inserted = [{ ID: number, CreatedAt: Date }]
  const inserted = await insertPrepared.exec({
    GroupID: 1223,
    Name: 'Task 1b',
    Details: 'Task 1b Details',
  });
}
finally
{
  await insertPrepared.release();
}
```