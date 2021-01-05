import { from, table } from '@typed-query-builder/builder';
import { expectText, sqlWithOptions } from '../helper';


describe('Exists', () =>
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
      .select(Task.only(['name']))
      .where(({ task }, { exists }) => [
        exists(
          from(Task.as('child'))
            .where(({ child }) => [
              child.parentId.eq(task.id)
            ])
            .exists()
        )
      ])
      .run(sqlWithOptions({ simplifyReferences: true }))
    ;

    expectText({ condenseSpace: true, ignoreCase: true }, x, `
      SELECT
        "name"
      FROM task
      WHERE EXISTS (SELECT 1 FROM task AS child WHERE child.parentId = task.id LIMIT 1)
    `);
  });

  it('exists', () =>
  {
    const x = from(Task)
      .select(Task.only(['name']))
      .where(({ task }, { exists, not }) => [
        not(exists(
          from(Task.as('child'))
            .where(({ child }) => [
              child.parentId.eq(task.id)
            ])
            .exists()
        ))
      ])
      .run(sqlWithOptions({ simplifyReferences: true }))
    ;

    expectText({ condenseSpace: true, ignoreCase: true }, x, `
      SELECT
        "name"
      FROM task
      WHERE NOT EXISTS (SELECT 1 FROM task AS child WHERE child.parentId = task.id LIMIT 1)
    `);
  });

});