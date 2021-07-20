# @typed-query-builder/pgsql

See [typed-query-builder README](https://github.com/ClickerMonkey/typed-query-builder/blob/master/README.md) for more details.  
See [tests](test/index.spec.ts) for more query examples.  
See [generator](test/generator.spec.ts) for a table generator example.  

## Examples

### Generate tables given a connection
```ts
import { generate } from '@typed-query-builder/pgsql/generator';

const gen = await generate(conn);
const genFile =  gen.map(t => t.tableDefinition).join('\n\n');

// genFile is now a series of `export const Table = table({ ... })` commands based on your tables.
// generate can be passed options to control variable name, table alias, column aliases, etc.
```

### Query Examples
```ts
import mssql from 'mssql';
import { from, update, insert, table } from '@typed-query-builder/builder';
import { exec, prepare, stream } from '@typed-query-builder/pgsql';
import { generate } from '@typed-query-builder/pgsql/generator';

// Define tables
const PersonTable = table({
  name: 'person',
  primary: ['id'],
  fields: {
    id: "INT",
    name: ["VARCHAR", 128],
    email: ["VARCHAR", 128],
    location: ["NULL", "POINT"],
  },
});

const TaskTable = table({
  name: 'task',
  primary: ['id'],
  fields: {
    id: "INT",
    group_id: "INT",
    name: ["NVARCHAR", 128],
    details: "NTEXT",
    done: "BIT",
    done_at: ["NULL", "TIMESTAMP"],
    parent_id: ["NULL", "INT"],
    assigned_to: ["NULL", "INT"],
    assigned_at: ["NULL", "TIMESTAMP"],
    created_at: "TIMESTAMP",
    created_by: ["NULL", "INT"],
  },
});

// Reusable functions to process builders. Can pass transaction or connection or nothing to use global connection.
const getResult = exec(conn);
const getCount = exec(conn, { affectedCount: true });
const getPrepared = prepare(conn);
const getStream = stream(conn);


// Select first record in a table
const first = await from(TaskTable)
  .select('*')
  .first()
  .run( getResult )
;

// Update Done to true
const { affected } = await update(TaskTable)
  .set('done', true)
  .where(({ task }) => task.id.eq(first.id))
  .run( getCount )
;

// Select record in table by parameter ID
const paramedResult = await from(TaskTable)
  .select('*')
  .where(({ task }, { param }) => task.id.eq(param('id')))
  .first()
  .run( exec(conn, { params: { id: first.id } }))
;

// Do it with a prepared statement
const findById = await from(TaskTable)
  .select('*')
  .where(({ task }, { param }) => task.id.eq(param('id')))
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
const insertIds = await insert(PersonTable, ['name', 'email'])
  .returning(({ person }) => [person.ID])
  .values([
    { name: 'Person 1', email: 'Person1@gmail.com' },
    { name: 'Person 2', email: 'Person2@gmail.com' }
  ])
  .run( getResult )
;

// Inserts with prepared
const insertPrepared = await insert(TaskTable, ['group_id', 'name', 'details'])
  .returning(({ task }) => [task.id, task.created_at])
  .valuesFromParams()
  .run( getPrepared )
;

try
{
  // inserted = [{ ID: number, CreatedAt: Date }]
  const inserted = await insertPrepared.exec({
    group_id: 1223,
    name: 'Task 1b',
    details: 'Task 1b Details',
  });
}
finally
{
  await insertPrepared.release();
}

// Stream large dataset
const streamer = from(TaskTable)
  .select('*')
  .run( getStream )
;

await streamer((task) => {
  // do something with task, potentially async
});
```