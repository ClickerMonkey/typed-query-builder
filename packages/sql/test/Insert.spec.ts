import { insert, table } from '@typed-query-builder/builder';
import { expectText, sql, sqlWithOptions } from './helper';


describe('Insert', () =>
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

  // const Book = table({
  //   name: 'book',
  //   fields: {
  //     isbn: 'TEXT',
  //     title: 'TEXT',
  //     price: ['DECIMAL', 6],
  //   },
  // });

  // const People = table({
  //   name: 'people',
  //   fields: {
  //     id: 'INT',
  //     name: ['VARCHAR', 64],
  //   },
  // });

  it('single object', () =>
  {
    const x = insert()
      .into(Task)
      .values(({}, { defaults, nulls }) => ({
        id: defaults(),
        name: 'Hello World',
        done: false,
        doneAt: nulls(),
        parentId: nulls(),
        assignee: 10,
      }))
      .run(sql)
    ;

    expectText({ condenseSpace: true, ignoreCase: true }, x, `
      INSERT INTO task 
        (id, name, done, doneAt, parentId, assignee) 
      VALUES
        (DEFAULT, 'Hello World', FALSE, NULL, NULL, 10)
    `);
  });

  

  it('single object subset', () =>
  {
    const x = insert()
      .into(Task, ['name', 'assignee'])
      .values(({}, { defaults, nulls }) => ({
        name: 'Hello World',
        assignee: 10,
      }))
      .run(sql)
    ;

    expectText({ condenseSpace: true, ignoreCase: true }, x, `
      INSERT INTO task 
        (name, assignee) 
      VALUES
        ('Hello World', 10)
    `);
  });

  it('single object missing optional', () =>
  {
    const x = insert()
      .into(Task)
      .values(({}, { defaults }) => ({
        id: defaults(),
        name: 'Hello World',
        done: false,
        assignee: 10,
      }))
      .run(sql)
    ;

    expectText({ condenseSpace: true, ignoreCase: true }, x, `
      INSERT INTO task 
        (id, name, done, doneAt, parentId, assignee) 
      VALUES
        (DEFAULT, 'Hello World', FALSE, NULL, NULL, 10)
    `);
  });

  it('single tuple', () =>
  {
    const x = insert()
      .into(Task)
      .values(({}, { defaults, nulls }) => [
        defaults(),
        'Hello World',
        false,
        nulls(),
        nulls(),
        10,
      ])
      .run(sql)
    ;

    expectText({ condenseSpace: true, ignoreCase: true }, x, `
      INSERT INTO task 
        (id, name, done, doneAt, parentId, assignee) 
      VALUES
        (DEFAULT, 'Hello World', FALSE, NULL, NULL, 10)
    `);
  });

  it('multiple object', () =>
  {
    const x = insert()
      .into(Task)
      .values(({}, { defaults, nulls }) => [{
        id: defaults(),
        name: 'Hello World 1',
        done: false,
        doneAt: nulls(),
        parentId: nulls(),
        assignee: 10,
      }, {
        id: defaults(),
        name: 'Hello World 2',
        done: false,
        doneAt: nulls(),
        parentId: nulls(),
        assignee: 11,
      }])
      .run(sql)
    ;

    expectText({ condenseSpace: true, ignoreCase: true }, x, `
      INSERT INTO task 
        (id, name, done, doneAt, parentId, assignee) 
      VALUES
        (DEFAULT, 'Hello World 1', FALSE, NULL, NULL, 10),
        (DEFAULT, 'Hello World 2', FALSE, NULL, NULL, 11)
    `);
  });

  it('single tuple in array', () =>
  {
    const x = insert()
      .into(Task)
      .values(({}, { defaults, nulls }) => [[
        defaults(),
        'Hello World',
        false,
        nulls(),
        nulls(),
        10,
      ]])
      .run(sql)
    ;

    expectText({ condenseSpace: true, ignoreCase: true }, x, `
      INSERT INTO task 
        (id, name, done, doneAt, parentId, assignee) 
      VALUES
        (DEFAULT, 'Hello World', FALSE, NULL, NULL, 10)
    `);
  });

  it('multiple tuple', () =>
  {
    const x = insert()
      .into(Task)
      .values(({}, { defaults, nulls }) => [[
        defaults(),
        'Hello World 1',
        false,
        nulls(),
        nulls(),
        10,
      ], [
        defaults(),
        'Hello World 2',
        false,
        nulls(),
        nulls(),
        11,
      ]])
      .run(sql)
    ;

    expectText({ condenseSpace: true, ignoreCase: true }, x, `
      INSERT INTO task 
        (id, name, done, doneAt, parentId, assignee) 
      VALUES
        (DEFAULT, 'Hello World 1', FALSE, NULL, NULL, 10),
        (DEFAULT, 'Hello World 2', FALSE, NULL, NULL, 11)
    `);
  });

  it('params', () =>
  {
    const x = insert(Task)
      .valuesFromParams()
      .run(sql)
    ;

    expectText({ condenseSpace: true }, x, `
      INSERT INTO task 
        (id, name, done, doneAt, parentId, assignee) 
      VALUES
        ($id, $name, $done, $doneAt, $parentId, $assignee)
    `);
  });

  it('set on duplicate', () =>
  {
    const x = insert(Task)
      .valuesFromParams()
      .setOnDuplicate({
        name: 'New Name'
      })
      .run(sql)
    ;

    expectText({ condenseSpace: true }, x, `
      INSERT INTO task 
        (id, name, done, doneAt, parentId, assignee) 
      VALUES
        ($id, $name, $done, $doneAt, $parentId, $assignee)
      ON CONFLICT DO UPDATE SET name = 'New Name'
    `);
  });

  it('set on duplicate where', () =>
  {
    const x = insert(Task)
      .valuesFromParams()
      .setOnDuplicate({
        name: 'New Name'
      })
      .setOnDuplicateWhere(({ task }, { not }) => [ task.done.isFalse() ])
      .run(sql)
    ;

    expectText({ condenseSpace: true }, x, `
      INSERT INTO task 
        (id, name, done, doneAt, parentId, assignee) 
      VALUES
        ($id, $name, $done, $doneAt, $parentId, $assignee)
      ON CONFLICT DO UPDATE SET name = 'New Name' WHERE done IS FALSE
    `);
  });

  it('returning', () =>
  {
    const x = insert(Task, ['name'])
      .values([['Task 1'], ['Task 2'], ['Task 3']])
      .returning(({ task }) => [ task.id ])
      .run(sqlWithOptions({ simplifySelects: true }))
    ;

    expectText({ condenseSpace: true }, x, `
      INSERT INTO task 
        (name) 
      VALUES
        ('Task 1'),
        ('Task 2'),
        ('Task 3')
      RETURNING id
    `);
  });

});