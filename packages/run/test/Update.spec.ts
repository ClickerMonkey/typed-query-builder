import { table, update, from } from '@typed-query-builder/builder';
import { prepare } from '../src';


import '../src/functions/string';


describe('Update', () =>
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

  const CommentsAliased = table({
    name: 'comment',
    table: 'Comments',
    fields: {
      id: 'INT',
      parentId: ['NULL', 'INT'],
      content: 'TEXT',
    },
    fieldColumn: {
      id: 'CommentID',
      content: 'CommentContent',
      parentId: 'CommentParentID',
    },
  });

  it('update by id set one', () =>
  {
    const db = getDB();
    const getResult = prepare(db, { affectedCount: true });

    const updater = update(Todos)
      .where(({ todo }, { param }) => todo.id.eq(param('id')))
      .set('done', true)
      .run(getResult)
    ;

    expect(db.todo[1].done).toBe(false);

    const result = updater({ id: 2 });

    expect(result.affected).toBe(1);

    expect(db.todo[1].done).toBe(true);
  });

  it('update by id set object', () =>
  {
    const db = getDB();
    const getResult = prepare(db, { affectedCount: true });

    const updater = update(Todos)
      .where(({ todo }, { param }) => todo.id.eq(param('id')))
      .set({ done: true })
      .run(getResult)
    ;

    expect(db.todo[1].done).toBe(false);

    const result = updater({ id: 2 });

    expect(result.affected).toBe(1);

    expect(db.todo[1].done).toBe(true);
  });

  it('update by id set row', () =>
  {
    const db = getDB();
    const getResult = prepare(db, { affectedCount: true });

    const updater = update(Employees)
      .where(({ employee }, { param }) => employee.id.eq(param('id')))
      .set(['project', 'amount'], () => ['None', 23])
      .run(getResult)
    ;

    expect(db.employee[1].project).toBe('Home');
    expect(db.employee[1].amount).toBe(2);

    const result = updater({ id: 2 });

    expect(result.affected).toBe(1);

    expect(db.employee[1].project).toBe('None');
    expect(db.employee[1].amount).toBe(23);
  });

  it('update multiple', () =>
  {
    const db = getDB();
    const getResult = prepare(db, { affectedCount: true });

    const updater = update(Employees)
      .where(({ employee }, { param }) => employee.amount.gte(param('threshold')))
      .set('amount', ({ employee }) => employee.amount.div(2))
      .run(getResult)
    ;

    const result = updater({ threshold: 40 });

    expect(result.affected).toBe(4);
    expect(db.employee[5].amount).toBe(20);
    expect(db.employee[6].amount).toBe(50);
    expect(db.employee[7].amount).toBe(100);
    expect(db.employee[8].amount).toBe(200);
  });

  it('update multiple returning', () =>
  {
    const db = getDB();
    const getResult = prepare(db, { affectedCount: true });

    const updater = update(Employees)
      .where(({ employee }, { param }) => employee.amount.gte(param('threshold')))
      .set('amount', ({ employee }) => employee.amount.div(2))
      .returning(({ employee }) => [employee.id, employee.amount])
      .run(getResult)
    ;

    const result = updater({ threshold: 40 });

    expect(result.affected).toBe(4);
    expect(result).toStrictEqual({
      affected: 4,
      result: [
        { id: 6, amount: 20 },
        { id: 7, amount: 50 },
        { id: 8, amount: 100 },
        { id: 9, amount: 200 },
      ]
    });
  });

  it('update set row subquery', () =>
  {
    const db = getDB();
    const getResult = prepare(db, { affectedCount: true });

    const updater = update(Employees)
      .where(({ employee }, { param }) => employee.id.in(param<number[]>('ids')))
      .set(['project', 'amount'], 
        ({ employee }) => from(Comments)
          .select(({ comment }) => [ comment.content, comment.parentId.required() ])
          .where(({ comment }) => comment.id.eq(employee.id))
          .first()
      )
      .run(getResult)
    ;

    const result = updater({ ids: [1, 2, 3] });

    expect(result.affected).toBe(3);

    expect(db.employee[0].project).toBe('A');
    expect(db.employee[0].amount).toBe(undefined);
    expect(db.employee[1].project).toBe('A1');
    expect(db.employee[1].amount).toBe(1);
    expect(db.employee[2].project).toBe('A2');
    expect(db.employee[2].amount).toBe(1);
    expect(db.employee[3].project).toBe('Home');
    expect(db.employee[3].amount).toBe(10);
  });

  it('update with aliases', () =>
  {
    const db = {
      comment: [
        { id: 2, parentId: null, content: 'Hi' }
      ],
    };

    const getResult = prepare(db, { affectedCount: true });

    const updater = update(CommentsAliased)
      .where(({ comment }, { param }) => comment.id.eq(param('id')))
      .set(['parentId', 'content'], () => [23, 'Changed'])
      .run(getResult)
    ;

    const result = updater({ id: 2 });

    expect(result.affected).toBe(1);

    expect(db.comment[0].content).toBe('Changed');
    expect(db.comment[0].parentId).toBe(23);
  });

  it('update with aliases useNames', () =>
  {
    const db = {
      Comments: [
        { CommentID: 2, CommentParentID: null, CommentContent: 'Hi' }
      ],
    };

    const getResult = prepare(db, { affectedCount: true, useNames: true });

    const updater = update(CommentsAliased)
      .where(({ comment }, { param }) => comment.id.eq(param('id')))
      .set(['parentId', 'content'], () => [23, 'Changed'])
      .run(getResult)
    ;

    const result = updater({ id: 2 });

    expect(result.affected).toBe(1);

    expect(db.Comments[0].CommentContent).toBe('Changed');
    expect(db.Comments[0].CommentParentID).toBe(23);
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