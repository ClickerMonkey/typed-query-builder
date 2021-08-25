import { from, table } from '@typed-query-builder/builder';
import { expectText, sqlWithOptions } from '../helper';


describe('Case', () =>
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

  it('case expression', () =>
  {
    const x = from(Task)
      .select(({ task }) => [
        task.done.when(true, 'Done').else('Not Done').as('status')
      ])
      .run(sqlWithOptions({ simplifyReferences: true }))
    ;

    expectText({ condenseSpace: true, ignoreCase: true }, x, `
      SELECT
        (CASE done
          WHEN TRUE THEN 'Done'
          ELSE 'Not Done'
        END) AS "status"
      FROM task
    `);
  });

  it('case boolean', () =>
  {
    const x = from(Task)
      .select(({ task }, { cases }) => [
        cases().when(task.done, 'Done').else('Not Done').as('status')
      ])
      .run(sqlWithOptions({ simplifyReferences: true }))
    ;

    expectText({ condenseSpace: true, ignoreCase: true }, x, `
      SELECT
        (CASE
          WHEN done = TRUE THEN 'Done'
          ELSE 'Not Done'
        END) AS "status"
      FROM task
    `);
  });

  it('case mixed', () =>
  {
    const x = from(Task)
      .select(({ task }) => [
        task.name.when('Root', 1)
          .elseWhen('Base', 2)
          .elseWhen('Parent', 3)
          .else(4)
          .as('status')
      ])
      .run(sqlWithOptions({ simplifyReferences: true }))
    ;

    expectText({ condenseSpace: true, ignoreCase: true }, x, `
      SELECT
        (CASE "name"
          WHEN 'Root' THEN 1
          WHEN 'Base' THEN 2
          WHEN 'Parent' THEN 3
          ELSE 4
        END) AS "status"
      FROM task
    `);
  });

});