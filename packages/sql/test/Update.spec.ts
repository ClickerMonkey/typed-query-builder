import { fns, from, table, update } from '@typed-query-builder/builder';
import { expectText, sql, sqlWithOptions } from './helper';


describe('Update', () =>
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

  it('update with target', () =>
  {
    const x = update(Task)
      .set('done', true)
      .where(({ task }) => task.id.eq(10))
      .run(sql)
    ;

    expectText({ condenseSpace: true, ignoreCase: true }, x, `
      UPDATE task SET
        done = TRUE
      WHERE
        task.id = 10
    `);
  });

  it('update without target', () =>
  {
    const x = update()
      .update(Task)
      .set('done', true)
      .where(({ task }) => task.id.eq(10))
      .run(sql)
    ;

    expectText({ condenseSpace: true, ignoreCase: true }, x, `
      UPDATE task SET
        done = TRUE
      WHERE
        task.id = 10
    `);
  });

  it('update without target simplify', () =>
  {
    const x = update()
      .update(Task)
      .set('done', true)
      .where(({ task }) => task.id.eq(10))
      .run(sqlWithOptions({ simplifyReferences: true }))
    ;

    expectText({ condenseSpace: true, ignoreCase: true }, x, `
      UPDATE task SET
        done = TRUE
      WHERE
        id = 10
    `);
  });

  it('update single field reference', () =>
  {
    const x = update(Task)
      .set('done', true)
      .where(Task.fields.id.eq(10))
      .run(sql)
    ;

    expectText({ condenseSpace: true, ignoreCase: true }, x, `
      UPDATE task SET
        done = TRUE
      WHERE
        task.id = 10
    `);
  });

  it('update single field subquery', () =>
  {
    const x = update(Task)
      .set('doneAt', Task.fields.doneAt.max())
      .where(Task.fields.id.eq(10))
      .run(sql)
    ;

    expectText({ condenseSpace: true, ignoreCase: true }, x, `
      UPDATE task SET
        doneAt = (SELECT MAX(task.doneAt) FROM task)
      WHERE
        task.id = 10
    `);
  });

  it('update multiple object', () =>
  {
    const x = update(Task)
      .set({
        done: true,
        doneAt: fns.currentDate(),
      })
      .run(sql)
    ;

    expectText({ condenseSpace: true, ignoreCase: true }, x, `
      UPDATE task SET
        done = TRUE,
        doneAt = currentDate()
    `);
  });

  it('update multiple object provider', () =>
  {
    const x = update(Task)
      .set(({}, {}, { currentDate }) => ({
        done: true,
        doneAt: currentDate(),
      }))
      .run(sql)
    ;

    expectText({ condenseSpace: true, ignoreCase: true }, x, `
      UPDATE task SET
        done = TRUE,
        doneAt = currentDate()
    `);
  });

  it('update multiple single constants', () =>
  {
    const x = update(Task)
      .set(['done'], [true])
      .run(sql)
    ;

    expectText({ condenseSpace: true, ignoreCase: true }, x, `
      UPDATE task SET
        done = TRUE
    `);
  });

  it('update multiple constants', () =>
  {
    const x = update(Task)
      .set(['done', 'doneAt'], [true, fns.currentDate()])
      .run(sql)
    ;

    expectText({ condenseSpace: true, ignoreCase: true }, x, `
      UPDATE task SET
        (done, doneAt) = (TRUE, currentDate())
    `);
  });

  it('update multiple subquery', () =>
  {
    const x = update(Task)
      .set(
        ['done', 'doneAt'], 
        from(Task)
          .select(({ task }, { max, constant }) => [
            constant(false).as('done'),
            max(task.doneAt).as('mostRecentDoneAt')
          ])
          .first()
      )
      .run(sql)
    ;

    expectText({ condenseSpace: true, ignoreCase: true }, x, `
      UPDATE task SET
        (done, doneAt) = (SELECT FALSE, MAX(task.doneAt) FROM task LIMIT 1)
    `);
  });

  it('update returning', () =>
  {
    const x = update(Task)
      .set('doneAt', Task.fields.doneAt.max())
      .where(Task.fields.id.eq(10))
      .returning(['doneAt'])
      .run(sqlWithOptions({ simplifyReferences: true }))
    ;

    expectText({ condenseSpace: true, ignoreCase: true }, x, `
      UPDATE task SET
        doneAt = (SELECT MAX(doneAt) FROM task)
      WHERE
        id = 10
      RETURNING doneAt
    `);
  });

});