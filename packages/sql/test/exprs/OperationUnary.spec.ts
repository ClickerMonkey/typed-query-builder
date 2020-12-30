import { from, table } from '@typed-query-builder/builder';
import { expectText, sqlWithOptions } from '../helper';


describe('OperationUnary', () =>
{
  
  const Task = table({
    name: 'task',
    fields: {
      id: 'INT',
      name: ['VARCHAR', 64],
      done: 'BOOLEAN',
      doneAt: 'TIMESTAMP',
      parentId: 'INT',
      assignee: 'INT',
    },
  });

  it('simple', () =>
  {
    const x = from(Task)
      .select(({ task }) => [
        task.id.op('-').as('negative')
      ])
      .run(sqlWithOptions({ simplifyReferences: true }))
    ;

    expectText({ condenseSpace: true, ignoreCase: true }, x, `
      SELECT
        (-id) AS negative
      FROM task
    `);
  });

});