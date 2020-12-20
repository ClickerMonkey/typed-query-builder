import { table, update, query, from } from '../src';
import { expectExpr, expectExprType } from './helper';


// tslint:disable: no-magic-numbers

describe('Select', () => {

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

  const People = table({
    name: 'people',
    fields: {
      id: 'INT',
      name: ['VARCHAR', 64],
    },
  });

  it('update normal', () => {
    const q = update(Task)
      .set(Task.fields.name, 'Hello')
      .where(Task.fields.id.eq(10))
    ;

    expectExpr<[][]>(q);
  });

  it('update returning all', () => {
    const q = update(Task)
      .set(Task.fields.name, 'Hello')
      .where(Task.fields.id.eq(10))
      .returning('*')
    ;

    expectExpr<[{ id: number, name: string, done: boolean, doneAt: Date, parentId: number, assignee: number }]>(q);
  });

  it('update returning', () => {
    const q = update(Task)
      .returning(({ task }) => [
        task.id
      ])
    ;

    expectExpr<[{ id: number }]>(q);
  });

  it('update with multiple', () => {
    const q = update()
      .with(
        query()
          .from(People)
          .select(People.all())
          .as('people')
      )
      .update(Task)
      .set({
        done: true,
      })
      .where(({ people, task }) => people.id.eq(task.assignee))
    ;

    expectExprType<[][]>(q);
  });

  it('update row dynamic constant', () => {
    update(Task)
      .set(({ task }) => [
        task.id,
        task.name
      ], [
        43,
        'hello!'
      ])
    ;
  });

  it('update row dynamic dynamic', () => {
    update(Task)
      .set(({ task }) => [
        task.id,
        task.name
      ], ({ task }, exprs, { concat }) => [
        task.id.add(1),
        concat(task.name, '+')
      ])
    ;
  });

  it('update row constant dynamic', () => {
    update(Task)
      .set(['id', 'name'], ({ task }, exprs, { concat }) => [
        task.id.add(1),
        concat(task.name, '+')
      ])
    ;
  });

  it('update row constant select', () => {
    update(Task)
      .set(
        ['id', 'name'], 
        from(Task).select(({ task }) => [task.id, task.name]).first()
      )
    ;
  });

  it('update with multiple returning columns', () => {
    const q = update(Task)
      .set(Task.fields.done, true)
      .where(Task.fields.doneAt.lt(new Date()))
      .returning(['id', 'done'])
    ;

    expectExpr<[number, boolean][]>(q);
    expectExpr<{ id: number, done: boolean }[]>(q);
  });

  it('update with multiple returning expression', () => {
    const q = update(Task)
      .set(Task.fields.done, true)
      .where(Task.fields.doneAt.lt(new Date()))
      .returning(({ task }, {}, { lower }) => [
        lower(task.name).as('lower')
      ])
    ;

    expectExpr<[string][]>(q);
    expectExpr<{ lower: string }[]>(q);
  });

  it('update with multiple returning expression with rest', () => {
    const q = update(Task)
      .set(Task.fields.done, true)
      .where(Task.fields.doneAt.lt(new Date()))
      .returning(({ task }, {}, { lower }) => [
        lower(task.name).as('lower'),
        ...task.all()
      ])
    ;

    expectExpr<[{ lower: string, id: number, name: string, done: boolean, doneAt: Date, parentId: number, assignee: number }]>(q);
  });

});