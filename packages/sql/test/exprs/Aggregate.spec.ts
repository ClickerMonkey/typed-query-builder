import { from, table } from '@typed-query-builder/builder';
import { expectText, sql } from '../helper';


describe('Aggregate', () =>
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

  it('no arguments', () =>
  {
    const x = from(Task)
      .select(({ task }, { count }) => [
        count().as('count'),
      ])
      .run(sql)
    ;

    expectText({ condenseSpace: true, ignoreCase: true }, x, `
      SELECT 
        COUNT(*) AS "count"
      FROM task
    `);
  });

  it('count one argument', () =>
  {
    const x = from(Task)
      .select(({ task }, { count }) => [
        count(task.done).as('done_count'),
      ])
      .run(sql)
    ;

    expectText({ condenseSpace: true, ignoreCase: true }, x, `
      SELECT 
        COUNT(task.done) AS done_count
      FROM task
    `);
  });

  it('min one argument', () =>
  {
    const x = from(Task)
      .select(({ task }, { min }) => [
        min(task.doneAt).as('oldest_done'),
      ])
      .run(sql)
    ;

    expectText({ condenseSpace: true, ignoreCase: true }, x, `
      SELECT 
        MIN(task.doneAt) AS oldest_done
      FROM task
    `);
  });

  it('count distincts', () =>
  {
    const x = from(Task)
      .select(({ task }, { count }) => [
        count(task.assignee).distinct().as('number_of_assignees_with_tasks'),
      ])
      .run(sql)
    ;

    expectText({ condenseSpace: true, ignoreCase: true }, x, `
      SELECT 
        COUNT(DISTINCT task.assignee) AS number_of_assignees_with_tasks
      FROM task
    `);
  });

  it('string order', () =>
  {
    const x = from(Task)
      .select(({ task }, { aggregate }) => [
        aggregate('string', task.name, ',').order(task.name).as('ordered_tasks')
      ])
      .run(sql)
    ;

    expectText({ condenseSpace: true, ignoreCase: true }, x, `
      SELECT 
        string(task."name", ',' ORDER BY task."name") AS ordered_tasks
      FROM task
    `);
  });

  it('count done with filter', () =>
  {
    const x = from(Task)
      .select(({ task }, { count }) => [
        count().filter(task.done).as('done_count'),
      ])
      .run(sql)
    ;

    expectText({ condenseSpace: true, ignoreCase: true }, x, `
      SELECT
        COUNT(*) FILTER (WHERE task.done = true) AS done_count
      FROM task
    `);
  });

});