import { describe, it } from '@jest/globals';
import { table, insert, query } from '@typed-query-builder/builder';
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

  it('insert normal', () => {
    const q = insert()
      .into(Task, ['name'])
      .values({ name: 'Hello' })
      .values([{ name: '2nd instance' }])
      .values(['tuple'])
      .values([['tuple']])
    ;

    expectExpr<[][]>(q);
  });

  it('insert returning all', () => {
    const q = insert()
      .into(Task)
      .values({ id: 3, name: 't3', done: false, doneAt: new Date(), parentId: -1, assignee: -1 })
      .returning('*')
    ;

    expectExpr<[{ id: number, name: string, done: boolean, doneAt: Date, parentId: number, assignee: number }]>(q);
  });

  it('insert returning', () => {
    const q = insert()
      .into(Task)
      .returning(({ task }) => [
        task.id
      ])
    ;

    expectExpr<[{ id: number }]>(q);
  });

  it('insert with one', () => {
    const q = insert()
      .with(
        query()
          .from(People)
          .select(People.all())
          .as('people')
      )
      .into(Task)
      .values(({ people }, { defaults, nulls }) => [
        defaults(),
        'Task #1',
        false,
        nulls(),
        nulls(),
        people.id
      ])
    ;

    expectExprType<[][]>(q);
  });

  it('insert with multiple', () => {
    const q = insert()
      .with(
        query()
          .from(People)
          .select(People.all())
          .as('people')
      )
      .into(Task)
      .values(({ people }, { defaults, nulls }) => [{
        id: defaults(),
        name: 'Task #1',
        done: false,
        doneAt: nulls(),
        parentId: nulls(),
        assignee: people.id
      }, {
        id: defaults(),
        name: 'Task #1 Child',
        done: false,
        doneAt: nulls(),
        parentId: nulls(),
        assignee: people.id
      }])
    ;

    expectExprType<[][]>(q);
  });

  it('insert with one returning', () => {
    const q = insert()
      .with(
        query()
          .from(People)
          .select(People.all())
          .as('people')
      )
      .into(Task)
      .values(({ people }, { defaults, nulls }) => [
        defaults(),
        'Task #1',
        false,
        nulls(),
        nulls(),
        people.id
      ])
      .returning(['id'])
    ;

    expectExpr<[number][]>(q);
  });

  it('insert with no returning', () => {
    const q = insert()
      .with(
        query()
          .from(People)
          .select(People.all())
          .as('people')
      )
      .into(Task)
      .values(({ people }, { defaults, nulls }) => [
        defaults(),
        'Task #1',
        false,
        nulls(),
        nulls(),
        people.id
      ])
    ;

    expectExprType<[][]>(q);
  });

  it('insert with multiple returning columns', () => {
    const q = insert()
      .with(
        query()
          .from(People)
          .select(People.all())
          .as('people')
      )
      .into(Task)
      .values(({ people }, { defaults, nulls }) => [
        defaults(),
        'Task #1',
        false,
        nulls(),
        nulls(),
        people.id
      ])
      .returning(['id', 'done'])
    ;

    expectExpr<[number, boolean][]>(q);
    expectExpr<{ id: number, done: boolean }[]>(q);
  });

  it('insert with multiple returning expression', () => {
    const q = insert()
      .with(
        query()
          .from(People)
          .select(People.all())
          .as('people')
      )
      .into(Task)
      .values(({ people }, { defaults, nulls }) => [
        defaults(),
        'Task #1',
        false,
        nulls(),
        nulls(),
        people.id
      ])
      .returning(({ task }, {}, { lower }) => [
        lower(task.name).as('lower')
      ])
    ;

    expectExpr<[string][]>(q);
    expectExpr<{ lower: string }[]>(q);
  });

  it('insert with multiple returning expression with rest', () => {
    const q = insert()
      .with(
        query()
          .from(People)
          .select(People.all())
          .as('people')
      )
      .into(Task)
      .values(({ people }, { defaults, nulls }) => [
        defaults(),
        'Task #1',
        false,
        nulls(),
        nulls(),
        people.id
      ])
      .returning(({ task }, {}, { lower }) => [
        lower(task.name).as('lower'),
        ...task.all()
      ])
    ;

    expectExpr<[{ lower: string, id: number, name: string, done: boolean, doneAt: Date, parentId: number, assignee: number }]>(q);
  });

});