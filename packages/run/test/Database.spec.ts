import { table, from, deletes, update } from '@typed-query-builder/builder';
import { createDatabase } from '../src';


import '../src/functions/string';


describe('Database', () =>
{

  const Todos = table({
    name: 'todo',
    fields: {
      id: 'INT',
      name: 'TEXT',
      done: 'BOOLEAN',
    },
  });
/*
  const Employees = table({
    name: 'employee',
    fields: {
      id: 'INT',
      name: 'TEXT',
      role: 'TEXT',
      project: 'TEXT',
      amount: 'MONEY',
    },
  });

  const Comments = table({
    name: 'comment',
    fields: {
      id: 'INT',
      parentId: ['NULL', 'INT'],
      content: 'TEXT',
    },
  });
*/
  it('database count', async () =>
  {
    const data = getDB();
    const db = createDatabase(data);

    const result = await from(Todos)
      .count()
      .run( db.count() )
    ;

    expect(result.result).toBe(3);
  });

  it('database count tuples', async () =>
  {
    const data = getDB();
    const db = createDatabase(data);

    const result = await update(Todos)
      .set('name', (_, { param }) => param('newName'))
      .where(({ todo }) => todo.id.eq(2))
      .returning(({ todo }) => [ todo.id, todo.name ])
      .run( db.countTuples({ newName: 'X' }) )
    ;

    expect(result).toStrictEqual({
      affected: 1,
      result: [[2, 'X']],
    });
  });

  it('database get', async () =>
  {
    const data = getDB();
    const db = createDatabase(data);

    const result = await from(Todos)
      .select(({ todo }) => [ todo.name ])
      .where(({ todo }) => todo.done)
      .run( db.get() )
    ;

    expect(result).toStrictEqual([
      { name: 'Task 1' },
      { name: 'Task 3' },
    ]);
  });

  it('database get tuples', async () =>
  {
    const data = getDB();
    const db = createDatabase(data);

    const result = await from(Todos)
      .select(({ todo }) => [ todo.name ])
      .where(({ todo }) => todo.done)
      .run( db.tuples() )
    ;

    expect(result).toStrictEqual([
      ['Task 1'],
      ['Task 3'],
    ]);
  });

  it('proc', async () =>
  {
    const data = getDB();
    const db = createDatabase(data, {
      procs: {
        message: async (db, params) => ({ value: `Hello ${params!.name}, there are ${db.todo.length} todos.`, result: undefined, output: {} }),
      },
    });

    const result = await db.proc('message', { name: 'Phil' });

    expect(result).toStrictEqual({
      value: 'Hello Phil, there are 3 todos.',
      result: undefined,
      output: {}
    });
  });

  it('global param', async () =>
  {
    const data = getDB();
    const db = createDatabase(data, {
      params: {
        done: true,
      },
    });

    const result = await from(Todos)
      .where(({ todo }, { param }) => todo.done.eq(param('done')))
      .count()
      .run( db.count() )
    ;

    expect(result.result).toBe(2);
  });

  it('local param', async () =>
  {
    const data = getDB();
    const db = createDatabase(data);

    const result = await from(Todos)
      .where(({ todo }, { param }) => todo.done.eq(param('done')))
      .count()
      .run( db.count({ done: false }) )
    ;

    expect(result.result).toBe(1);
  });

  it('transaction commit', async () =>
  {
    const data = getDB();
    const db = createDatabase(data);

    await db.transaction(async (txn, abort) => {

      expect(data.todo.length).toBe(3);

      expect(await from(Todos).count().run( txn.get() )).toBe(3);

      await deletes(Todos).run( txn.count() );

      expect(await from(Todos).count().run( txn.get() )).toBe(0);

      expect(data.todo.length).toBe(3);
    });

    expect(data.todo.length).toBe(0);
  });

  it('transaction abort', async () =>
  {
    const data = getDB();
    const db = createDatabase(data);

    await db.transaction(async (txn, abort) => {

      expect(data.todo.length).toBe(3);

      expect(await from(Todos).count().run( txn.get() )).toBe(3);

      await deletes(Todos).run( txn.count() );

      expect(await from(Todos).count().run( txn.get() )).toBe(0);

      expect(data.todo.length).toBe(3);

      abort();
    });

    expect(data.todo.length).toBe(3);
  });

  function getDB() {
    return {
      todo: [
        { id: 1, name: 'Task 1', done: true },
        { id: 2, name: 'Task 2', done: false },
        { id: 3, name: 'Task 3', done: true }
      ],
      employee: [
        { id: 1, name: 'Tom', role: 'Engineer', project: 'Home', amount: 1 },
        { id: 2, name: 'Phil', role: 'Engineer', project: 'Home', amount: 2 },
        { id: 3, name: 'John', role: 'Manager', project: 'Home', amount: 4 },
        { id: 4, name: 'Matt', role: 'Architect', project: 'Home', amount: 10 },
        { id: 5, name: 'Nick', role: 'Manager', project: 'Bridge', amount: 20 },
        { id: 6, name: 'Josh', role: 'Engineer', project: 'Bridge', amount: 40 },
        { id: 7, name: 'Erik', role: 'Architect', project: 'Bridge', amount: 100 },
        { id: 8, name: 'Kyle', role: 'Manager', project: 'Bridge', amount: 200 },
        { id: 9, name: 'Lori', role: 'Architect', project: 'Workshop', amount: 400 },
      ],
      comment: [
        { id: 1, content: 'A' },
        { id: 2, content: 'A1', parentId: 1 },
        { id: 3, content: 'A2', parentId: 1 },
        { id: 4, content: 'A1a', parentId: 2 },
        { id: 5, content: 'B' },
        { id: 6, content: 'C' },
        { id: 7, content: 'C1', parentId: 6 },
        { id: 8, content: 'A1b', parentId: 2 },
      ],
    };
  }

});