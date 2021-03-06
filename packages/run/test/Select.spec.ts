import { table, from, withs } from '@typed-query-builder/builder';
import { exec, prepare } from '../src';


import '../src/functions/string';


describe('Select', () =>
{

  const Todos = table({
    name: 'todo',
    fields: {
      id: 'INT',
      name: 'TEXT',
      done: 'BOOLEAN',
    },
  });

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

  it('count', () =>
  {
    const db = getDB();
    const getResult = exec(db);

    const count = from(Todos)
      .count()
      .run(getResult)
    ;

    expect(count).toBe(3);
  });

  it('list', () =>
  {
    const db = getDB();
    const getResult = exec(db);

    const names = from(Todos)
      .list(({ todo }) => todo.name)
      .run(getResult)
    ;

    expect(names).toStrictEqual(['Task 1', 'Task 2', 'Task 3']);
  });

  it('list ordered', () =>
  {
    const db = getDB();
    const getResult = exec(db);

    const names = from(Todos)
      .orderBy(({ todo }) => todo.name, 'DESC')
      .list(({ todo }) => todo.name)
      .run(getResult)
    ;

    expect(names).toStrictEqual(['Task 3', 'Task 2', 'Task 1']);
  });

  it('select all', () =>
  {
    const db = getDB();
    const getResult = exec(db);

    const results = from(Todos)
      .select('*')
      .run(getResult)
    ;

    expect(results).toStrictEqual([
      { id: 1, name: 'Task 1', done: true },
      { id: 2, name: 'Task 2', done: false },
      { id: 3, name: 'Task 3', done: true }
    ]);
  });

  it('select only', () =>
  {
    const db = getDB();
    const getResult = exec(db);

    const results = from(Todos)
      .select(({ todo }) => todo.only(['id', 'name']))
      .run(getResult)
    ;

    expect(results).toStrictEqual([
      { id: 1, name: 'Task 1' },
      { id: 2, name: 'Task 2' },
      { id: 3, name: 'Task 3' }
    ]);
  });

  it('select computed', () =>
  {
    const db = getDB();
    const getResult = exec(db);

    const results = from(Todos)
      .select(({ todo }, {}, { lower }) => [
        todo.id.mul(2).as('id_2'),
        lower(todo.name).as('name_lower'),
      ])
      .run(getResult)
    ;

    expect(results).toStrictEqual([
      { id_2: 2, name_lower: 'task 1' },
      { id_2: 4, name_lower: 'task 2' },
      { id_2: 6, name_lower: 'task 3' }
    ]);
  });

  it('group by', () =>
  {
    const db = getDB();
    const getResult = exec(db);

    const results = from(Employees)
      .select(({ employee }, { count, sum }) => [
        count().as('count'),
        sum(employee.amount).as('total'),
        employee.project,
      ])
      .groupBy('project')
      .run(getResult)
    ;

    expect(results).toStrictEqual([
      { count: 4, total: 360, project: 'Bridge' },
      { count: 4, total:  17, project: 'Home' },
      { count: 1, total: 400, project: 'Workshop' },
    ]);
  });

  it('group by rollup', () =>
  {
    const db = getDB();
    const getResult = exec(db);

    const results = from(Employees)
      .select(({ employee }, { sum, count }) => [
        count().as('count'),
        sum(employee.amount).as('total'),
        employee.project,
        employee.role,
      ])
      .groupByRollup(['project', 'role']) // project role, project, []
      .run(getResult)
    ;

    expect(results).toStrictEqual([
      { count: 1, total: 100, project: 'Bridge', role: 'Architect' },
      { count: 1, total:  40, project: 'Bridge', role: 'Engineer' },
      { count: 2, total: 220, project: 'Bridge', role: 'Manager' },
      { count: 4, total: 360, project: 'Bridge', role: undefined },
      { count: 1, total:  10, project: 'Home', role: 'Architect' },
      { count: 2, total:   3, project: 'Home', role: 'Engineer' },
      { count: 1, total:   4, project: 'Home', role: 'Manager' },
      { count: 4, total:  17, project: 'Home', role: undefined },
      { count: 1, total: 400, project: 'Workshop', role: 'Architect' },
      { count: 1, total: 400, project: 'Workshop', role: undefined },
      { count: 9, total: 777, project: undefined, role: undefined },
    ]);
  });

  it('group by cube', () =>
  {
    const db = getDB();
    const getResult = exec(db);

    const results = from(Employees)
      .select(({ employee }, { sum, count }) => [
        count().as('count'),
        sum(employee.amount).as('total'),
        employee.project,
        employee.role,
      ])
      .groupByCube(['project', 'role']) // project role, project, role, []
      .run(getResult)
    ;

    expect(results).toStrictEqual([
      { count: 1, total: 100, project: 'Bridge', role: 'Architect' },
      { count: 1, total:  40, project: 'Bridge', role: 'Engineer' },
      { count: 2, total: 220, project: 'Bridge', role: 'Manager' },
      { count: 4, total: 360, project: 'Bridge', role: undefined },
      { count: 1, total:  10, project: 'Home', role: 'Architect' },
      { count: 2, total:   3, project: 'Home', role: 'Engineer' },
      { count: 1, total:   4, project: 'Home', role: 'Manager' },
      { count: 4, total:  17, project: 'Home', role: undefined },
      { count: 1, total: 400, project: 'Workshop', role: 'Architect' },
      { count: 1, total: 400, project: 'Workshop', role: undefined },
      { count: 3, total: 510, project: undefined, role: 'Architect' },
      { count: 3, total:  43, project: undefined, role: 'Engineer' },
      { count: 3, total: 224, project: undefined, role: 'Manager' },
      { count: 9, total: 777, project: undefined, role: undefined },
    ]);
  });

  it('group by cube having', () =>
  {
    const db = getDB();
    const getResult = exec(db);

    const results = from(Employees)
      .select(({ employee }, { sum, count }) => [
        count().as('count'),
        sum(employee.amount).as('total'),
        employee.project,
        employee.role,
      ])
      .groupByCube(['project', 'role']) // project role, project, role, []
      .having(({}, {}, {}, { count }) => count.gt(1))
      .run(getResult)
    ;

    expect(results).toStrictEqual([
      { count: 2, total: 220, project: 'Bridge', role: 'Manager' },
      { count: 4, total: 360, project: 'Bridge', role: undefined },
      { count: 2, total:   3, project: 'Home', role: 'Engineer' },
      { count: 4, total:  17, project: 'Home', role: undefined },
      { count: 3, total: 510, project: undefined, role: 'Architect' },
      { count: 3, total:  43, project: undefined, role: 'Engineer' },
      { count: 3, total: 224, project: undefined, role: 'Manager' },
      { count: 9, total: 777, project: undefined, role: undefined },
    ]);
  });

  it('group by rollup partial', () =>
  {
    const db = getDB();
    const getResult = exec(db);

    const results = from(Employees)
      .select(({ employee }, { sum, count }) => [
        count().as('count'),
        sum(employee.amount).as('total'),
        employee.project,
        employee.role,
      ])
      .groupBy('project')
      .groupByRollup(['role']) // project role, project
      .run(getResult)
    ;

    expect(results).toStrictEqual([
      { count: 1, total: 100, project: 'Bridge', role: 'Architect' },
      { count: 1, total:  40, project: 'Bridge', role: 'Engineer' },
      { count: 2, total: 220, project: 'Bridge', role: 'Manager' },
      { count: 4, total: 360, project: 'Bridge', role: undefined },
      { count: 1, total:  10, project: 'Home', role: 'Architect' },
      { count: 2, total:   3, project: 'Home', role: 'Engineer' },
      { count: 1, total:   4, project: 'Home', role: 'Manager' },
      { count: 4, total:  17, project: 'Home', role: undefined },
      { count: 1, total: 400, project: 'Workshop', role: 'Architect' },
      { count: 1, total: 400, project: 'Workshop', role: undefined },
    ]);
  });

  it('window named partition order', () =>
  {
    const db = getDB();
    const getResult = exec(db);

    const results = from(Employees)
      .select(({ employee }) => [
        employee.id,
        employee.project,
        employee.role,
      ])
      .window('w', (w) => w.partition('project').order('role'))
      .select(({}, { rank, rowNumber, denseRank }) => [
        rank().over('w').as('rank'),
        rowNumber().over('w').as('row'),
        denseRank().over('w').as('dense'),
      ])
      .run(getResult)
    ;

    expect(results).toStrictEqual([
      { id: 7, role: 'Architect', project: 'Bridge',   rank: 1, row: 1, dense: 1 },
      { id: 6, role: 'Engineer',  project: 'Bridge',   rank: 2, row: 2, dense: 2 },
      { id: 5, role: 'Manager',   project: 'Bridge',   rank: 3, row: 3, dense: 3 },
      { id: 8, role: 'Manager',   project: 'Bridge',   rank: 3, row: 4, dense: 3 },
      { id: 4, role: 'Architect', project: 'Home',     rank: 1, row: 1, dense: 1 },
      { id: 1, role: 'Engineer',  project: 'Home',     rank: 2, row: 2, dense: 2 },
      { id: 2, role: 'Engineer',  project: 'Home',     rank: 2, row: 3, dense: 2 },
      { id: 3, role: 'Manager',   project: 'Home',     rank: 4, row: 4, dense: 3 },
      { id: 9, role: 'Architect', project: 'Workshop', rank: 1, row: 1, dense: 1 },
    ]);
  });

  it('window named partition order reorder', () =>
  {
    const db = getDB();
    const getResult = exec(db);

    const results = from(Employees)
      .select(({ employee }) => [
        employee.id,
        employee.project,
        employee.role,
      ])
      .window('w', (w) => w.partition('project').order('role'))
      .select(({}, { rank, rowNumber, denseRank }) => [
        rank().over('w').as('rank'),
        rowNumber().over('w').as('row'),
        denseRank().over('w').as('dense'),
      ])
      .orderBy('rank')
      .run(getResult)
    ;

    expect(results).toStrictEqual([
      { id: 7, role: 'Architect', project: 'Bridge',   rank: 1, row: 1, dense: 1 },
      { id: 4, role: 'Architect', project: 'Home',     rank: 1, row: 1, dense: 1 },
      { id: 9, role: 'Architect', project: 'Workshop', rank: 1, row: 1, dense: 1 },
      { id: 6, role: 'Engineer',  project: 'Bridge',   rank: 2, row: 2, dense: 2 },
      { id: 1, role: 'Engineer',  project: 'Home',     rank: 2, row: 2, dense: 2 },
      { id: 2, role: 'Engineer',  project: 'Home',     rank: 2, row: 3, dense: 2 },
      { id: 5, role: 'Manager',   project: 'Bridge',   rank: 3, row: 3, dense: 3 },
      { id: 8, role: 'Manager',   project: 'Bridge',   rank: 3, row: 4, dense: 3 },
      { id: 3, role: 'Manager',   project: 'Home',     rank: 4, row: 4, dense: 3 },
    ]);
  });

  it('recursive', () =>
  {
    const db = getDB();
    const getPrepared = prepare(db);

    const results = 
      withs(
        () => 
        from(Comments)
          .select(({ comment }, { constant }) => [
            constant(0).as('depth'),
            comment.id,
            comment.content
          ])
          .where(({ comment }, { param }) => comment.id.eq(param('id')))
          .as('tree')
        ,
        ({ tree }) => 
        from(Comments)
          .joinInner(tree, ({ tree, comment }) => comment.parentId.eq(tree.id))
          .select(({ comment, tree }) => [
            tree.depth.add(1).as('depth'),
            comment.id,
            comment.content
          ])
      )
      .from('tree')
      .select('*')
      .orderBy('content')
      .run(getPrepared)
    ;

    expect(results({id: 1})).toStrictEqual([
      { id: 1, content: 'A', depth: 0 },
      { id: 2, content: 'A1', depth: 1 },
      { id: 4, content: 'A1a', depth: 2 },
      { id: 8, content: 'A1b', depth: 2 },
      { id: 3, content: 'A2', depth: 1 },
    ]);
  });

  it('union', () =>
  {
    const db = getDB();
    const getPrepared = prepare(db);

    const results = from(Todos)
      .select('*')
      .where(({ todo }) => todo.id.lte(2))
      .union(
        from(Todos)
          .select('*')
          .where(({ todo }) => todo.id.gte(2))
          .generic()
      )
      .run(getPrepared)
    ;

    const out = results();

    expect(out).toStrictEqual([
      { id: 1, name: 'Task 1', done: true },
      { id: 2, name: 'Task 2', done: false },
      { id: 3, name: 'Task 3', done: true }
    ]);
  });

  it('union all', () =>
  {
    const db = getDB();
    const getPrepared = prepare(db);

    const results = from(Todos)
      .select('*')
      .where(({ todo }) => todo.id.lte(2))
      .unionAll(
        from(Todos)
          .select('*')
          .where(({ todo }) => todo.id.gte(2))
          .generic()
      )
      .run(getPrepared)
    ;

    const out = results();

    expect(out).toStrictEqual([
      { id: 1, name: 'Task 1', done: true },
      { id: 2, name: 'Task 2', done: false },
      { id: 2, name: 'Task 2', done: false },
      { id: 3, name: 'Task 3', done: true }
    ]);
  });

  it('intersect', () =>
  {
    const db = getDB();
    const getPrepared = prepare(db);

    const results = from(Todos)
      .select('*')
      .where(({ todo }) => todo.id.lte(2))
      .intersect(
        from(Todos)
          .select('*')
          .where(({ todo }) => todo.id.gte(2))
          .generic()
      )
      .run(getPrepared)
    ;

    const out = results();

    expect(out).toStrictEqual([
      { id: 2, name: 'Task 2', done: false },
    ]);
  });

  it('except', () =>
  {
    const db = getDB();
    const getPrepared = prepare(db);

    const results = from(Todos)
      .select('*')
      .where(({ todo }) => todo.id.lte(2))
      .except(
        from(Todos)
          .select('*')
          .where(({ todo }) => todo.id.gte(2))
          .generic()
      )
      .run(getPrepared)
    ;

    const out = results();

    expect(out).toStrictEqual([
      { id: 1, name: 'Task 1', done: true },
    ]);
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