import { schema, insert, ExprField, QueryInsert, Select, query } from '../src/';
import { expectExprType, expectType } from './helper';


// tslint:disable: no-magic-numbers

describe('Select', () => {

  const Task = schema({
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

  const People = schema({
    name: 'people',
    fields: {
      id: 'INT',
      name: ['VARCHAR', 64],
    },
  });

  it('insert normal', () => {
    const q = insert()
      .into(Task, ['name'])
    ;

    expectType<
      QueryInsert<
        {}, // With
        "task", // Into
        { // Type
          id: number;
          name: string;
          done: boolean;
          doneAt: Date;
          parentId: number;
          assignee: number;
        }, // Columns
        ["name"],
        [] // Returning
      >
    >(q);
  });

  it('insert returning all', () => {
    const q = insert()
      .into(Task)
      .returning('*')
    ;

    expectType<
      QueryInsert<
        {}, // With
        "task", // Into
        { // Type
          id: number;
          name: string;
          done: boolean;
          doneAt: Date;
          parentId: number;
          assignee: number;
        }, // Columns
        ["id", "name", "done", "doneAt", "parentId", "assignee"], 
        [ // Returning
          Select<"id", number>,
          Select<"name", string>,
          Select<"done", boolean>,
          Select<"doneAt", Date>,
          Select<"parentId", number>,
          Select<"assignee", number>,
        ]
      >
    >(q);

    expectExprType<{ 
      id: number, 
      name: string,
      done: boolean,
      doneAt: Date,
      parentId: number,
      assignee: number,
    }>(q);
  });

  it('insert returning', () => {
    const q = insert()
      .into(Task)
      .returning(({ task }) => [
        task.id
      ])
    ;

    expectType<
      QueryInsert<
        {}, // With
        "task", // Into
        { // Type
          id: number;
          name: string;
          done: boolean;
          doneAt: Date;
          parentId: number;
          assignee: number;
        }, 
        ["id", "name", "done", "doneAt", "parentId", "assignee"], // Columns
        [ExprField<"id", number>] // Returning
      >
    >(q);

    expectExprType<{ id: number }>(q);
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
      .values(({ people }, { defaults }) => [
        defaults(),
        'Task #1',
        false,
        null,
        null,
        people.id
      ])
    ;

    expectExprType<number>(q);
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
      .values(({ people }, { defaults }) => [{
        id: defaults(),
        name: 'Task #1',
        done: false,
        doneAt: null,
        parentId: null,
        assignee: people.id
      }, {
        id: defaults(),
        name: 'Task #1 Child',
        done: false,
        doneAt: null,
        parentId: null,
        assignee: people.id
      }])
    ;

    expectExprType<number>(q);
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
      .values(({ people }, { defaults }) => [
        defaults(),
        'Task #1',
        false,
        null,
        null,
        people.id
      ])
      .returning(['id'])
    ;

    expectExprType<[number][]>(q.tuples());
    expectExprType<{ id: number }[]>(q.objects());
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
      .values(({ people }, { defaults }) => [
        defaults(),
        'Task #1',
        false,
        null,
        null,
        people.id
      ])
    ;

    expectExprType<never>(q.tuples());
    expectExprType<never>(q.objects());
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
      .values(({ people }, { defaults }) => [
        defaults(),
        'Task #1',
        false,
        null,
        null,
        people.id
      ])
      .returning(['id', 'done'])
    ;

    expectExprType<[number, boolean][]>(q.tuples());
    expectExprType<{ id: number, done: boolean }[]>(q.objects());
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
      .values(({ people }, { defaults }) => [
        defaults(),
        'Task #1',
        false,
        null,
        null,
        people.id
      ])
      .returning(({ task }, {}, { lower }) => [
        lower(task.name).as('lower')
      ])
    ;

    expectExprType<[string][]>(q.tuples());
    expectExprType<{ lower: string }[]>(q.objects());
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
      .values(({ people }, { defaults }) => [
        defaults(),
        'Task #1',
        false,
        null,
        null,
        people.id
      ])
      .returning(({ task }, {}, { lower }) => [
        lower(task.name).as('lower'),
        ...task.all()
      ])
    ;

    expectExprType<[
      string, 
      number, 
      string, 
      boolean, 
      Date, 
      number, 
      number
    ][]>(q.tuples()); // TODO

    expectExprType<{ 
      lower: string,
      id: number,
      name: string,
      done: boolean,
      doneAt: Date,
      parentId: number,
      assignee: number,
    }[]>(q.objects());
  });

});