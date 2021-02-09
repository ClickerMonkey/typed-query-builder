import { table, insert, from } from '@typed-query-builder/builder';
import { prepare } from '../src';


import '../src/functions/string';


describe('Insert', () =>
{

  const Todos = table({
    name: 'todo',
    primary: ['id'],
    fields: {
      id: 'INT',
      name: 'TEXT',
      done: 'BOOLEAN',
    },
  });

  const Employees = table({
    name: 'employee',
    primary: ['id'],
    fields: {
      id: 'INT',
      name: 'TEXT',
      role: 'TEXT',
      project: 'TEXT',
      amount: 'MONEY',
    },
  });

  it('insert object', () =>
  {
    const db = getDB();
    const getResult = prepare(db, { affectedCount: true });

    const inserter = insert(Todos)
      .values({ id: 4, name: 'Task 4', done: false })
      .run(getResult)
    ;

    expect(db.todo.length).toBe(3);

    const result = inserter({});

    expect(result).toStrictEqual({ affected: 1, result: [] });

    expect(db.todo.length).toBe(4);
    expect(db.todo[3]).toStrictEqual({
      id: 4,
      name: 'Task 4',
      done: false,
    });
  });

  it('insert object array', () =>
  {
    const db = getDB();
    const getResult = prepare(db, { affectedCount: true });

    const inserter = insert(Todos)
      .values([{ id: 4, name: 'Task 4', done: false }])
      .run(getResult)
    ;

    expect(db.todo.length).toBe(3);

    const result = inserter({});

    expect(result).toStrictEqual({ affected: 1, result: [] });

    expect(db.todo.length).toBe(4);
    expect(db.todo[3]).toStrictEqual({
      id: 4,
      name: 'Task 4',
      done: false,
    });
  });

  it('insert tuple', () =>
  {
    const db = getDB();
    const getResult = prepare(db, { affectedCount: true });

    const inserter = insert(Todos, ['id', 'name', 'done'])
      .values([4, 'Task 4', false])
      .run(getResult)
    ;

    expect(db.todo.length).toBe(3);

    const result = inserter({});

    expect(result).toStrictEqual({ affected: 1, result: [] });

    expect(db.todo.length).toBe(4);
    expect(db.todo[3]).toStrictEqual({
      id: 4,
      name: 'Task 4',
      done: false,
    });
  });

  it('insert tuple returning', () =>
  {
    const db = getDB();
    const getResult = prepare(db, { affectedCount: true });

    const inserter = insert(Todos, ['id', 'name', 'done'])
      .values([4, 'Task 4', false])
      .returning(({ todo }) => [
        todo.name
      ])
      .run(getResult)
    ;

    expect(db.todo.length).toBe(3);

    const result = inserter({});

    expect(result).toStrictEqual({ affected: 1, result: [{ name: 'Task 4'}] });

    expect(db.todo.length).toBe(4);
    expect(db.todo[3]).toStrictEqual({
      id: 4,
      name: 'Task 4',
      done: false,
    });
  });

  it('insert tuple array', () =>
  {
    const db = getDB();
    const getResult = prepare(db, { affectedCount: true });

    const inserter = insert(Todos, ['id', 'name', 'done'])
      .values([[4, 'Task 4', false]])
      .run(getResult)
    ;

    expect(db.todo.length).toBe(3);

    const result = inserter({});

    expect(result).toStrictEqual({ affected: 1, result: [] });

    expect(db.todo.length).toBe(4);
    expect(db.todo[3]).toStrictEqual({
      id: 4,
      name: 'Task 4',
      done: false,
    });
  });

  it('insert query', () =>
  {
    const db = getDB();
    const getResult = prepare(db, { affectedCount: true });

    const inserter = insert(Todos, ['id', 'name', 'done'])
      .values(
        from(Employees)
          .select(({ employee }, { constant }) => [
            employee.id,
            employee.name,
            constant(false).as('done'),
          ])
          .where(({ employee }) => [
            employee.amount.gt(20)
          ])
          .generic()
      )
      .run(getResult)
    ;

    expect(db.todo.length).toBe(3);

    const result = inserter();

    expect(result).toStrictEqual({ affected: 4, result: [] });

    expect(db.todo.length).toBe(7);

    expect(db.todo.slice(3)).toStrictEqual([{
      id: 6,
      name: 'Josh',
      done: false,
    }, {
      id: 7,
      name: 'Erik',
      done: false,
    }, {
      id: 8,
      name: 'Kyle',
      done: false,
    }, {
      id: 9,
      name: 'Lori',
      done: false,
    }]);
  });

  it('insert query ignore duplicate', () =>
  {
    const db = getDB();
    const getResult = prepare(db, { affectedCount: true });

    const inserter = insert(Todos, ['id', 'name', 'done'])
      .values(
        from(Employees)
          .select(({ employee }, { constant }) => [
            employee.id,
            employee.name,
            constant(false).as('done'),
          ])
          .generic()
      )
      .ignoreDuplicate()
      .run(getResult)
    ;

    expect(db.todo.length).toBe(3);

    const result = inserter();

    expect(result).toStrictEqual({ affected: 6, result: [] });

    expect(db.todo.length).toBe(9);

    expect(db.todo.slice(3)).toStrictEqual([{
      id: 4,
      name: 'Matt',
      done: false,
    }, {
      id: 5,
      name: 'Nick',
      done: false,
    }, {
      id: 6,
      name: 'Josh',
      done: false,
    }, {
      id: 7,
      name: 'Erik',
      done: false,
    }, {
      id: 8,
      name: 'Kyle',
      done: false,
    }, {
      id: 9,
      name: 'Lori',
      done: false,
    }]);
  });

  it('insert query conflict set', () =>
  {
    const db = getDB();
    const getResult = prepare(db, { affectedCount: true });

    const inserter = insert(Todos, ['id', 'name', 'done'])
      .values(
        from(Employees)
          .select(({ employee }, { constant }) => [
            employee.id,
            employee.name,
            constant(false).as('done'),
          ])
          .generic()
      )
      .setOnDuplicate({done: false})
      .run(getResult)
    ;

    expect(db.todo.length).toBe(3);

    const result = inserter();

    expect(result).toStrictEqual({ affected: 9, result: [] });

    expect(db.todo.length).toBe(9);

    expect(db.todo).toStrictEqual([{
      id: 1,
      name: 'Task 1',
      done: false,
    }, {
      id: 2,
      name: 'Task 2',
      done: false,
    }, {
      id: 3,
      name: 'Task 3',
      done: false,
    }, {
      id: 4,
      name: 'Matt',
      done: false,
    }, {
      id: 5,
      name: 'Nick',
      done: false,
    }, {
      id: 6,
      name: 'Josh',
      done: false,
    }, {
      id: 7,
      name: 'Erik',
      done: false,
    }, {
      id: 8,
      name: 'Kyle',
      done: false,
    }, {
      id: 9,
      name: 'Lori',
      done: false,
    }]);
  });

  it('insert query conflict set where', () =>
  {
    const db = getDB();
    const getResult = prepare(db, { affectedCount: true });

    const inserter = insert(Todos, ['id', 'name', 'done'])
      .values(
        from(Employees)
          .select(({ employee }, { constant }) => [
            employee.id,
            employee.name,
            constant(false).as('done'),
          ])
          .generic()
      )
      .setOnDuplicate({done: false})
      .setOnDuplicateWhere(({ todo }) => todo.done.isTrue())
      .run(getResult)
    ;

    expect(db.todo.length).toBe(3);

    const result = inserter();

    expect(result).toStrictEqual({ affected: 8, result: [] });

    expect(db.todo.length).toBe(9);

    expect(db.todo).toStrictEqual([{
      id: 1,
      name: 'Task 1',
      done: false,
    }, {
      id: 2,
      name: 'Task 2',
      done: false,
    }, {
      id: 3,
      name: 'Task 3',
      done: false,
    }, {
      id: 4,
      name: 'Matt',
      done: false,
    }, {
      id: 5,
      name: 'Nick',
      done: false,
    }, {
      id: 6,
      name: 'Josh',
      done: false,
    }, {
      id: 7,
      name: 'Erik',
      done: false,
    }, {
      id: 8,
      name: 'Kyle',
      done: false,
    }, {
      id: 9,
      name: 'Lori',
      done: false,
    }]);
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