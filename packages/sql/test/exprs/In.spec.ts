import { from, table } from '@typed-query-builder/builder';
import { expectText, sqlWithOptions } from '../helper';


describe('In', () =>
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
      .select(Task.only(['name']))
      .where(({ task }) => task.id.in(1, 2, 3))
      .run(sqlWithOptions({ simplifyReferences: true }))
    ;

    expectText({ condenseSpace: true, ignoreCase: true }, x, `
      SELECT
        name
      FROM task
      WHERE id IN (1, 2, 3)
    `);
  });

  it('constants and subquery', () =>
  {
    const x = from(Task)
      .select(Task.only(['name']))
      .where(({ task }) => task.id.in(1, 2, Task.fields.id.max()))
      .run(sqlWithOptions({ simplifyReferences: true }))
    ;

    expectText({ condenseSpace: true, ignoreCase: true }, x, `
      SELECT
        name
      FROM task
      WHERE id IN (1, 2, (SELECT MAX(id) FROM task))
    `);
  });

  it('subquery plain', () =>
  {
    const x = from(Task)
      .select(Task.only(['name']))
      .where(({ task }) => task.id.in(
        from(Task).select(({ task }) => [task.parentId])
      ))
      .run(sqlWithOptions({ simplifyReferences: true }))
    ;

    expectText({ condenseSpace: true, ignoreCase: true }, x, `
      SELECT
        name
      FROM task
      WHERE id IN (SELECT parentId FROM task)
    `);
  });

  it('subquery list', () =>
  {
    const x = from(Task)
      .select(Task.only(['name']))
      .where(({ task }) => task.id.in(
        from(Task).select(Task.all()).list('parentId')
      ))
      .run(sqlWithOptions({ simplifyReferences: true }))
    ;

    expectText({ condenseSpace: true, ignoreCase: true }, x, `
      SELECT
        name
      FROM task
      WHERE id IN (SELECT parentId FROM task)
    `);
  });

});