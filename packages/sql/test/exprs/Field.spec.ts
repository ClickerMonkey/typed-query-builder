import { from, table } from '@typed-query-builder/builder';
import { expectText, sql } from '../helper';


describe('Field', () =>
{
  
  const Task = table({
    name: 'task',
    table: 'Tasks',
    fields: {
      id: 'INT',
      name: ['VARCHAR', 64],
      done: 'BOOLEAN',
      doneAt: 'TIMESTAMP',
      parentId: 'INT',
      assignee: 'INT',
    },
  });
  
  const GlobalSettings = table({
    name: 'globalSetting',
    table: 'GlobalSettings',
    fields: {
      maxTasks: 'INT',
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
      .run(sql)
    ;

    expectText({ condenseSpace: true, ignoreCase: true }, x, `
      SELECT
        Tasks.id AS id
      FROM Tasks
      WHERE NOT Tasks.done = true
    `);
  });

  it('with join', () =>
  {
    const x = from(Task)
      .joinInner(Task.as('parent'), 
        ({ task, parent }) => parent.id.eq(task.parentId)
      )
      .select(({ task, parent }) => [
        task.id,
        parent.name
      ])
      .where(({ task }, { not }) => [
        not(task.done)
      ])
      .run(sql)
    ;

    expectText({ condenseSpace: true, ignoreCase: true }, x, `
      SELECT
        Tasks.id AS id,
        parent."name" AS "name"
      FROM Tasks
      INNER JOIN Tasks AS parent ON parent.id = Tasks.parentId
      WHERE NOT Tasks.done = true
    `);
  });

  it('with nameless join', () =>
  {
    const x = from(Task)
      .joinInner(GlobalSettings, 
        ({}, { constant }) => constant(true).eq(true)
      )
      .select(({ task, globalSetting }) => [
        task.id,
        globalSetting.maxTasks
      ])
      .where(({ task }, { not }) => [
        not(task.done)
      ])
      .run(sql)
    ;

    expectText({ condenseSpace: true, ignoreCase: true }, x, `
      SELECT
        Tasks.id AS id,
        GlobalSettings.maxTasks AS maxTasks
      FROM Tasks
      INNER JOIN GlobalSettings ON true = true
      WHERE NOT Tasks.done = true
    `);
  });

});