import { table, deletes } from '@typed-query-builder/builder';
import { expectText, sql, sqlWithOptions } from './helper';


describe('Delete', () =>
{
  
  const Task = table({
    name: 'task',
    fields: {
      id: 'INT',
      name: ['VARCHAR', 64],
      done: 'BOOLEAN',
      doneAt: ['NULL', 'TIMESTAMP'],
      parentId: ['NULL', 'INT'],
      assignee: 'INT',
    },
  });

  it('remove with target', () =>
  {
    const x = deletes(Task)
      .where(({ task }) => task.id.eq(10))
      .run(sql)
    ;

    expectText({ condenseSpace: true, ignoreCase: true }, x, `
      DELETE FROM task
      WHERE
        task.id = 10
    `);
  });

  it('remove without target', () =>
  {
    const x = deletes()
      .from(Task)
      .where(({ task }) => task.id.eq(10))
      .run(sql)
    ;

    expectText({ condenseSpace: true, ignoreCase: true }, x, `
      DELETE FROM task
      WHERE
        task.id = 10
    `);
  });

  it('remove without target', () =>
  {
    const x = deletes(Task)
      .where(({ task }) => task.id.eq(10))
      .run(sqlWithOptions({ simplifyReferences: true }))
    ;

    expectText({ condenseSpace: true, ignoreCase: true }, x, `
      DELETE FROM task
      WHERE
        id = 10
    `);
  });

  it('remove returning', () =>
  {
    const x = deletes(Task)
      .where(({ task }) => task.done)
      .returning(['id'])
      .run(sqlWithOptions({ simplifyReferences: true }))
    ;

    expectText({ condenseSpace: true, ignoreCase: true }, x, `
      DELETE FROM task
      WHERE
        done = TRUE
      RETURNING id
    `);
  });

});