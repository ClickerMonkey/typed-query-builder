import { from, table } from '@typed-query-builder/builder';
import { expectText, sqlWithOptions } from '../helper';


describe('Not', () =>
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
      .select(({ task }, { not }) => [
        task.id
      ])
      .where(({ task }, { not }) => [
        not(task.done)
      ])
      .run(sqlWithOptions({ simplifyReferences: true }))
    ;

    expectText({ condenseSpace: true, ignoreCase: true }, x, `
      SELECT
        id
      FROM task
      WHERE NOT done = true
    `);
  });

});