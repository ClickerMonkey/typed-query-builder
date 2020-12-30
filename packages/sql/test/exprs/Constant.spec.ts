import { from, table } from '@typed-query-builder/builder';
import { expectText, sqlWithOptions } from '../helper';


describe('Constant', () =>
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
      .select(({}, { constant }) => [
        constant(10).as('ten'),
      ])
      .run(sqlWithOptions({ simplifyReferences: true }))
    ;

    expectText({ condenseSpace: true, ignoreCase: true }, x, `
      SELECT
        10 as ten
      FROM task
    `);
  });

});