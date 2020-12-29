import { from, table } from '@typed-query-builder/builder';
import { expectText, sql, sqlWithOptions } from './helper';


describe('Select', () =>
{
  
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

  const Book = table({
    name: 'book',
    fields: {
      isbn: 'TEXT',
      title: 'TEXT',
      price: ['DECIMAL', 6],
    },
  });

  const People = table({
    name: 'people',
    fields: {
      id: 'INT',
      name: ['VARCHAR', 64],
    },
  });

  it('all', () =>
  {
    const x = from(Task)
      .select('*')
      .run(sql)
    ;

    expectText({ condenseSpace: true }, x, `
      SELECT 
        task.id AS id, 
        task.name AS name,
        task.done AS done, 
        task.doneAt AS doneAt, 
        task.parentId AS parentId, 
        task.assignee AS assignee 
      FROM task
    `);
  });

  it('all with differing names', () =>
  {
    const Project = table({
      name: 'project',
      table: 'projects',
      fields: {
        id: 'INT',
        name: 'TEXT',
      },
      fieldColumn: {
        id: 'ProjectID',
        name: 'ProjectName'
      },
    });

    const x = from(Project)
      .select('*')
      .run(sql)
    ;

    expectText({ condenseSpace: true }, x, `
      SELECT 
        projects.ProjectID AS id, 
        projects.ProjectName AS name
      FROM projects
    `);
  });

  it('all with differing names simplified', () =>
  {
    const Project = table({
      name: 'project',
      table: 'projects',
      fields: {
        id: 'INT',
        name: 'TEXT',
      },
      fieldColumn: {
        id: 'ProjectID',
        name: 'ProjectName'
      },
    });

    const x = from(Project)
      .select('*')
      .run(sqlWithOptions({ simplifySelects: true }))
    ;

    expectText({ condenseSpace: true }, x, `
      SELECT 
        ProjectID AS id, 
        ProjectName AS name
      FROM projects
    `);
  });

  it('all simplified', () =>
  {
    const x = from(Task)
      .select('*')
      .run(sqlWithOptions({ simplifySelects: true }))
    ;

    expectText({ condenseSpace: true }, x, `
      SELECT 
        id, 
        name,
        done, 
        doneAt, 
        parentId, 
        assignee 
      FROM task
    `);
  });

  it('all simplified with join', () =>
  {
    const x = from(Task)
      .joinInner(People, ({ people, task }) => task.assignee.eq(people.id))
      .select(({ task }) => task.all())
      .select(({ people }) => people.all('assignee', 'CAPITAL'))
      .run(sqlWithOptions({ simplifySelects: true }))
    ;

    expectText({ condenseSpace: true }, x, `
      SELECT 
        task.id AS id, 
        task.name AS name,
        done, 
        doneAt, 
        parentId, 
        assignee,
        people.id AS assigneeId,
        people.name AS assigneeName
      FROM task
      INNER JOIN people ON assignee = people.id
    `);
  });

  it('select one', () =>
  {
    const x = from(Task)
      .select(Task.fields.id)
      .run(sql)
    ;

    expectText({ condenseSpace: true }, x, `
      SELECT 
        task.id AS id
      FROM task
    `);
  });

  it('select count', () =>
  {
    const x = from(Task)
      .select(({ task }, { count }) => [
        count().as('count'),
      ])
      .run(sql)
    ;

    expectText({ condenseSpace: true, ignoreCase: true }, x, `
      SELECT 
        COUNT(*) AS count
      FROM task
    `);
  });

  it('select func', () =>
  {
    const x = from(Task)
      .select(({ task }, { }, { upper }) => [
        upper(task.name).as('upper_names'),
      ])
      .list('upper_names')
      .run(sql)
    ;

    expectText({ condenseSpace: true, ignoreCase: true }, x, `
      SELECT 
        UPPER(task.name) AS item
      FROM task
    `);
  });

  it('select alias', () =>
  {
    const x = from(Task.as('my_tasks'))
      .select(({ my_tasks }) => my_tasks.only(['id', 'name'], 'my_task.'))
      .where(({ my_tasks }) => my_tasks.assignee.eq(10))
      .run(sql)
    ;

    expectText({ condenseSpace: true, ignoreCase: true }, x, `
      SELECT 
        my_tasks.id AS "my_task.id",
        my_tasks.name AS "my_task.name"
      FROM task AS my_tasks
      WHERE my_tasks.assignee = 10
    `);
  });

  it('select constants', () =>
  {
    const x = from(Task)
      .select(({ task }) => task.only(['id', 'name']))
      .where(({ task }) => [
        task.assignee.eq(10),
        task.done
      ])
      .run(sqlWithOptions({ constantsAsParams: true }))
    ;

    expectText({ condenseSpace: true, ignoreCase: true }, x, `
      SELECT 
        task.id AS id,
        task.name AS name
      FROM task
      WHERE task.assignee = $1
        AND task.done = true
    `);
  });

  it('select params', () =>
  {
    const x = from(Task)
      .select(({ task }) => task.only(['id', 'name']))
      .where(({ task }, { param }) => [
        task.assignee.eq(param('myid'))
      ])
      .run(sql)
    ;

    expectText({ condenseSpace: true, ignoreCase: true }, x, `
      SELECT 
        task.id AS id,
        task.name AS name
      FROM task
      WHERE task.assignee = $myid
    `);
  });

  it('select where subquery', () =>
  {
    const x = from(Book)
      .select(Book.all())
      .where(Book.fields.price.lt(Book.fields.price.avg()))
      .orderBy('title')
      .run(sql)
    ;

    expectText({ condenseSpace: true, ignoreCase: true }, x, `
      SELECT 
        book.isbn AS isbn,
        book.title AS title,
        book.price AS price
      FROM book
      WHERE book.price < (SELECT AVG(book.price) AS avg FROM book)
      ORDER BY book.title
    `);
  });

  it('select window', () =>
  {
    const x = from(Task)
      .window('w', (w, { task }) => w.partition(task.done).order(task.doneAt))
      .select(({ task }) => task.all())
      .select(({ task }, { rank }) => [
        rank().over('w').as('rank'),
      ])
      .run(sql)
    ;

    expectText({ condenseSpace: true, ignoreCase: true }, x, `
      SELECT 
        task.id AS id, 
        task.name AS name,
        task.done AS done, 
        task.doneAt AS doneAt, 
        task.parentId AS parentId, 
        task.assignee AS assignee,
        RANK() OVER w AS rank
      FROM task
      WINDOW w AS (PARTITION BY task.done ORDER BY task.doneAt)
    `);
  });

  it('select window over', () =>
  {
    const x = from(Task)
      .select(({ task }) => task.all())
      .select(({ task }, { rank }) => [
        rank().over((w) => w.partition(task.done).order(task.doneAt)).as('rank'),
      ])
      .run(sql)
    ;

    expectText({ condenseSpace: true, ignoreCase: true }, x, `
      SELECT 
        task.id AS id, 
        task.name AS name,
        task.done AS done, 
        task.doneAt AS doneAt, 
        task.parentId AS parentId, 
        task.assignee AS assignee,
        RANK() OVER (PARTITION BY task.done ORDER BY task.doneAt) AS rank
      FROM task
    `);
  });

});