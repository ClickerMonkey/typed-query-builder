import { table, deletes } from '@typed-query-builder/builder';
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

  it('delete by id', () =>
  {
    const db = getDB();
    const getResult = prepare(db, { affectedCount: true });

    expect(db.todo.length).toBe(3);

    const deleter = deletes(Todos)
      .where(({ todo }, { param }) => todo.id.eq(param('id')))
      .run(getResult)
    ;

    const result = deleter({ id: 2 });

    expect(result.affected).toBe(1);
    expect(db.todo.length).toBe(2);
  });

  it('delete all', () =>
  {
    const db = getDB();
    const getResult = exec(db);

    expect(db.employee.length).toBe(9);

    deletes(Employees)
      .run( getResult )
    ;

    expect(db.employee.length).toBe(0);
  });

  it('delete multiple', () =>
  {
    const db = getDB();
    const getResult = exec(db, { affectedCount: true });

    const result = deletes(Comments)
      .where(({ comment }) => comment.parentId.isNull())
      .returning(({ comment }) => [
        comment.id
      ])
      .run(getResult)
    ;

    expect(result).toStrictEqual({
      affected: 3,
      result: [
        { id: 1 },
        { id: 5 },
        { id: 6 },
      ]
    });
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