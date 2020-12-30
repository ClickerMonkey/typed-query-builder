import { from, table } from '@typed-query-builder/builder';
import { expectText, sqlWithOptions } from '../helper';


describe('Between', () =>
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

  it('constants', () =>
  {
    const x = from(Task)
      .where(Task.fields.id.between(1, 10))
      .exists()
      .run(sqlWithOptions({ simplifyReferences: true }))
    ;

    expectText({ condenseSpace: true, ignoreCase: true }, x, `
      SELECT 1
      FROM task
      WHERE id BETWEEN 1 AND 10
      LIMIT 1
    `);
  });

  it('dynamic', () =>
  {
    const x = from(Task)
      .where(Task.fields.id.between(
        Task.fields.id.min().add(10),
        Task.fields.id.max().sub(10)
      ))
      .exists()
      .run(sqlWithOptions({ simplifyReferences: true }))
    ;

    expectText({ condenseSpace: true, ignoreCase: true }, x, `
      SELECT 1
      FROM task
      WHERE id BETWEEN ((SELECT MIN(id) FROM task) + 10) AND ((SELECT MAX(id) FROM task) - 10)
      LIMIT 1
    `);
  });

});