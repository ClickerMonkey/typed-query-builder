# @typed-query-builder/mssql

```ts
import mssql from 'mssql';
import { from, table } from '@typed-query-builder/builder';
import { exec, prepare } from '@typed-query-builder/mssql';

const Task = table({
  name: 'task',
  fields: {
    id: 'INT',
    name: 'TEXT',
    done: 'BOOLEAN',
    doneAt: ['NULL', 'TIMESTAMP'],
  },
});

const Person = table({
  name: 'person',
  fields: {
    id: 'INT',
    name: ['NVARCHAR', 128],
    email: ['NVARCHAR', 128]
  },
});

from(Task)
  .

```