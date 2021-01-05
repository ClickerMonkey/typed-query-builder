import { from, table } from '@typed-query-builder/builder';
import { expectText, sqlWithOptions } from '../helper';


describe('OperationBinary', () =>
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
        task.id.add(task.assignee).as('added')
      ])
      .run(sqlWithOptions({ simplifyReferences: true }))
    ;

    expectText({ condenseSpace: true, ignoreCase: true }, x, `
      SELECT
        (id + assignee) AS added
      FROM task
    `);
  });

  it('using op', () =>
  {
    const x = from(Task)
      .select(({ task }) => [
        task.id.op('%', task.assignee).as('mod')
      ])
      .run(sqlWithOptions({ simplifyReferences: true }))
    ;

    expectText({ condenseSpace: true, ignoreCase: true }, x, `
      SELECT
        (id % assignee) AS "mod"
      FROM task
    `);
  });

});