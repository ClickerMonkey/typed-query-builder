import { fns, from, table } from '@typed-query-builder/builder';
import { expectText, sqlWithOptions } from '../helper';


describe('Function', () =>
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

  it('no args', () =>
  {
    const x =
      fns.currentDate()
      .run(sqlWithOptions({ simplifyReferences: true }))
    ;

    expectText({ condenseSpace: true, ignoreCase: true }, x, `
      SELECT
        currentDate()
    `);
  });

  it('simple', () =>
  {
    const x = from(Task)
      .select(({ task }, {}, { upper }) => [
        upper(task.name).as('upper')
      ])
      .run(sqlWithOptions({ simplifyReferences: true }))
    ;

    expectText({ condenseSpace: true, ignoreCase: true }, x, `
      SELECT
        upper(name) AS upper
      FROM task
    `);
  });

  it('with constants', () =>
  {
    const x = from(Task)
      .select(({ task }, {}, { substring }) => [
        substring(task.name, 1, 2).as('sub')
      ])
      .run(sqlWithOptions({ simplifyReferences: true }))
    ;

    expectText({ condenseSpace: true, ignoreCase: true }, x, `
      SELECT
        substring(name, 1, 2) AS sub
      FROM task
    `);
  });

});