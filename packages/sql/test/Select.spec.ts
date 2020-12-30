import { from, table, withs } from '@typed-query-builder/builder';
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
      .run(sqlWithOptions({ simplifyReferences: true }))
    ;

    expectText({ condenseSpace: true }, x, `
      SELECT 
        ProjectID AS id, 
        ProjectName AS name
      FROM projects
    `);
  });

  it('all with differing names aliased simplified', () =>
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
      .select(({ project }) => [
        project.id.as('ProjectID'),
        project.name
      ])
      .run(sqlWithOptions({ simplifyReferences: true }))
    ;

    expectText({ condenseSpace: true }, x, `
      SELECT 
        ProjectID, 
        ProjectName AS name
      FROM projects
    `);
  });

  it('all simplified', () =>
  {
    const x = from(Task)
      .select('*')
      .run(sqlWithOptions({ simplifyReferences: true }))
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
      .run(sqlWithOptions({ simplifyReferences: true }))
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
      WHERE book.price < (SELECT AVG(book.price) FROM book)
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
  
  it('with one', () =>
  {
    const x = 
      withs(
        from(Task)
          .select(({ task }) => [
            task.id,
          ])
          .where(({ task }) => task.done)
          .as('tasksDone')
      )
      .from(Task)
      .select(({ task }) => [
        task.id,
        task.name
      ])
      .where(({ task, tasksDone }) => [
        task.id.in(tasksDone.id.list())
      ])
      .run(sqlWithOptions({ simplifyReferences: true }))
    ;
     
    expectText({ ignoreSpace: true, ignoreCase: true }, x, `
      WITH tasksDone AS (
        SELECT id
        FROM task
        WHERE done = TRUE
      )
      SELECT 
        task.id as id, 
        name
      FROM task
      WHERE id IN (SELECT tasksDone.id FROM tasksDone)
    `);
  });
  
  it('with multiple', () =>
  {
    const x = 
      withs(
        from(Task)
          .select(({ task }) => [
            task.id,
          ])
          .where(({ task }) => task.done)
          .as('tasksDone')
      )
      .with(({ tasksDone }) =>
        from(Task)
          .select(({ task }) => [
            task.name,
          ])
          .where(({ task }) => task.id.in(tasksDone.id.list()))
          .as('tasksDoneNames')
      )
      .from(Task)
      .select(({ task }) => [
        task.id,
        task.name
      ])
      .where(({ task, tasksDone, tasksDoneNames }, { or }) => or([
        task.id.in(tasksDone.id.list()),
        task.name.in(tasksDoneNames.name.list())
      ]))
      .run(sqlWithOptions({ simplifyReferences: true }))
    ;
    
    expectText({ ignoreSpace: true, ignoreCase: true }, x, `
      WITH tasksDone AS (
        SELECT id
        FROM task
        WHERE done = TRUE
      )
      WITH tasksDoneNames AS (
        SELECT name
        FROM task
        WHERE task.id IN (SELECT tasksDone.id FROM tasksDone)
      )
      SELECT 
        task.id as id, 
        task.name as name
      FROM task
      WHERE id IN (SELECT tasksDone.id FROM tasksDone) 
         OR name IN (SELECT tasksDoneNames.name FROM tasksDoneNames)
    `);
  });

  it('distinct', () =>
  {
    const x = from(Task)
      .distinct()
      .select(({ task }) => [
        task.name
      ])
      .run(sqlWithOptions({ simplifyReferences: true }))
    ;
    
    expectText({ ignoreSpace: true, ignoreCase: true }, x, `
      SELECT DISTINCT name
      FROM task
    `);
  });

  it('distinctOn', () =>
  {
    const x = from(Task)
      .distinctOn(({ task }) => [task.name])
      .select(({ task }) => [
        task.id,
        task.name
      ])
      .run(sqlWithOptions({ simplifyReferences: true }))
    ;
    
    expectText({ ignoreSpace: true, ignoreCase: true }, x, `
      SELECT DISTINCT ON (name) 
        id, 
        name
      FROM task
    `);
  });

  it('join inner', () =>
  {
    const x = from(Task)
      .joinInner(People, ({ people, task}) => people.id.eq(task.assignee))
      .select(({ task, people }) => [
        task.id,
        task.name,
        people.name.as('assigneeeName')
      ])
      .run(sqlWithOptions({ simplifyReferences: true }))
    ;
    
    expectText({ condenseSpace: true, ignoreCase: true }, x, `
      SELECT
        task.id AS id, 
        task.name AS name,
        people.name AS assigneeeName
      FROM task
      INNER JOIN people ON people.id = assignee
    `);
  });

  it('join left', () =>
  {
    const x = from(Task)
      .joinLeft(People, ({ people, task}) => people.id.eq(task.assignee))
      .select(({ task, people }) => [
        task.id,
        task.name,
        people.name.as('assigneeeName')
      ])
      .run(sqlWithOptions({ simplifyReferences: true }))
    ;
    
    expectText({ condenseSpace: true, ignoreCase: true }, x, `
      SELECT
        task.id AS id, 
        task.name AS name,
        people.name AS assigneeeName
      FROM task
      LEFT JOIN people ON people.id = assignee
    `);
  });

  it('join right', () =>
  {
    const x = from(Task)
      .joinRight(People, ({ people, task}) => people.id.eq(task.assignee))
      .select(({ task, people }) => [
        task.id,
        task.name,
        people.name.as('assigneeeName')
      ])
      .run(sqlWithOptions({ simplifyReferences: true }))
    ;
    
    expectText({ condenseSpace: true, ignoreCase: true }, x, `
      SELECT
        task.id AS id, 
        task.name AS name,
        people.name AS assigneeeName
      FROM task
      RIGHT JOIN people ON people.id = assignee
    `);
  });

  it('join full', () =>
  {
    const x = from(Task)
      .joinFull(People, ({ people, task}) => people.id.eq(task.assignee))
      .select(({ task, people }) => [
        task.id,
        task.name,
        people.name.as('assigneeeName')
      ])
      .run(sqlWithOptions({ simplifyReferences: true }))
    ;
    
    expectText({ condenseSpace: true, ignoreCase: true }, x, `
      SELECT
        task.id AS id, 
        task.name AS name,
        people.name AS assigneeeName
      FROM task
      FULL JOIN people ON people.id = assignee
    `);
  });

  it('select prefix', () =>
  {
    const x = from(Task)
      .joinInner(People, ({ people, task}) => people.id.eq(task.assignee))
      .select(({ task }) => task.all())
      .select(({ people }) => people.all('assignee', 'CAPITAL'))
      .run(sqlWithOptions({ simplifyReferences: true }))
    ;
    
    expectText({ condenseSpace: true, ignoreCase: true }, x, `
      SELECT
        task.id AS id, 
        task.name AS name,
        done, 
        doneAt, 
        parentId, 
        assignee,
        people.id as assigneeId,
        people.name as assigneeName
      FROM task
      INNER JOIN people ON people.id = assignee
    `);
  });

  it('select all multiple', () =>
  {
    const A = table({
      name: 'a',
      fields: {
        a_id: 'INT',
        a_name: 'TEXT',
      }
    });
    const B = table({
      name: 'b',
      fields: {
        b_id: 'INT',
        b_name: 'TEXT',
        a_id_ref: ['NULL', 'INT'],
      },
    });

    const x = from(A)
      .joinInner(B, ({ a, b }) => b.a_id_ref.eq(a.a_id))
      .select('*')
      .run(sqlWithOptions({ simplifyReferences: true }))
    ;
    
    expectText({ condenseSpace: true, ignoreCase: true }, x, `
      SELECT
        a_id,
        a_name,
        b_id,
        b_name,
        a_id_ref
      FROM a
      INNER JOIN b ON a_id_ref = a_id
    `);
  });

  it('group by having', () =>
  {
    const x = from(Task)
      .select(({ task }, { count }, { dateGet }) => [
        dateGet('dayOfWeek', task.doneAt).as('dayOfWeek'),
        count().as('tasksOnDay')
      ])
      .where(({ task }) => [
        task.doneAt.isNotNull()
      ])
      .groupBy('dayOfWeek')
      .having(({}, {}, {}, { tasksOnDay }) => 
        tasksOnDay.gt(0)
      )
      .run(sqlWithOptions({ simplifyReferences: true }))
    ;
    
    expectText({ condenseSpace: true, ignoreCase: true }, x, `
      SELECT
        dateGet('dayOfWeek', doneAt) AS dayOfWeek,
        COUNT(*) AS tasksOnDay
      FROM task
      WHERE doneAt IS NOT NULL
      GROUP BY dateGet('dayOfWeek', doneAt)
      HAVING COUNT(*) > 0
    `);
  });

  it('order by default', () =>
  {
    const x = from(Task)
      .select(Task.only(['id', 'name']))
      .orderBy('name')
      .run(sqlWithOptions({ simplifyReferences: true }))
    ;
    
    expectText({ condenseSpace: true, ignoreCase: true }, x, `
      SELECT
        id,
        name
      FROM task
      ORDER BY name
    `);
  });

  it('order by asc', () =>
  {
    const x = from(Task)
      .select(Task.only(['id', 'name']))
      .orderBy('name', 'ASC')
      .run(sqlWithOptions({ simplifyReferences: true }))
    ;
    
    expectText({ condenseSpace: true, ignoreCase: true }, x, `
      SELECT
        id,
        name
      FROM task
      ORDER BY name ASC
    `);
  });

  it('order by desc', () =>
  {
    const x = from(Task)
      .select(Task.only(['id', 'name']))
      .orderBy('name', 'DESC')
      .run(sqlWithOptions({ simplifyReferences: true }))
    ;
    
    expectText({ condenseSpace: true, ignoreCase: true }, x, `
      SELECT
        id,
        name
      FROM task
      ORDER BY name DESC
    `);
  });

  it('order by asc nulls last', () =>
  {
    const x = from(Task)
      .select(Task.only(['id', 'name']))
      .orderBy('name', 'ASC', true)
      .run(sqlWithOptions({ simplifyReferences: true }))
    ;
    
    expectText({ condenseSpace: true, ignoreCase: true }, x, `
      SELECT
        id,
        name
      FROM task
      ORDER BY name ASC NULLS LAST
    `);
  });

  it('order by asc nulls first', () =>
  {
    const x = from(Task)
      .select(Task.only(['id', 'name']))
      .orderBy('name', 'ASC', false)
      .run(sqlWithOptions({ simplifyReferences: true }))
    ;
    
    expectText({ condenseSpace: true, ignoreCase: true }, x, `
      SELECT
        id,
        name
      FROM task
      ORDER BY name ASC NULLS FIRST
    `);
  });

  it('limit only', () =>
  {
    const x = from(Task)
      .select(Task.only(['id', 'name']))
      .limit(10)
      .run(sqlWithOptions({ simplifyReferences: true }))
    ;
    
    expectText({ condenseSpace: true, ignoreCase: true }, x, `
      SELECT
        id,
        name
      FROM task
      LIMIT 10
    `);
  });

  it('limit offset', () =>
  {
    const x = from(Task)
      .select(Task.only(['id', 'name']))
      .limit(10)
      .offset(5)
      .run(sqlWithOptions({ simplifyReferences: true }))
    ;
    
    expectText({ condenseSpace: true, ignoreCase: true }, x, `
      SELECT
        id,
        name
      FROM task
      LIMIT 10
      OFFSET 5
    `);
  });

  it('offset only', () =>
  {
    const x = from(Task)
      .select(Task.only(['id', 'name']))
      .offset(5)
      .run(sqlWithOptions({ simplifyReferences: true }))
    ;
    
    expectText({ condenseSpace: true, ignoreCase: true }, x, `
      SELECT
        id,
        name
      FROM task
      LIMIT ALL
      OFFSET 5
    `);
  });

  it('select count', () =>
  {
    const x = from(Task)
      .count()
      .run(sqlWithOptions({ simplifyReferences: true }))
    ;
    
    expectText({ condenseSpace: true, ignoreCase: true }, x, `
      SELECT
        COUNT(*)
      FROM task
    `);
  });

  it('select countIf', () =>
  {
    const x = from(Task)
      .countIf(Task.fields.done)
      .run(sqlWithOptions({ simplifyReferences: true }))
    ;
    
    expectText({ condenseSpace: true, ignoreCase: true }, x, `
      SELECT
        COUNTIF(done)
      FROM task
    `);
  });

  it('select sum', () =>
  {
    const x = from(Task)
      .sum(Task.fields.assignee)
      .run(sqlWithOptions({ simplifyReferences: true }))
    ;
    
    expectText({ condenseSpace: true, ignoreCase: true }, x, `
      SELECT
        SUM(assignee)
      FROM task
    `);
  });

  it('select first', () =>
  {
    const x = from(Task)
      .select(Task.only(['id']))
      .first()
      .run(sqlWithOptions({ simplifyReferences: true }))
    ;
    
    expectText({ condenseSpace: true, ignoreCase: true }, x, `
      SELECT
        id
      FROM task
      LIMIT 1
    `);
  });

  it('select exists', () =>
  {
    const x = from(Task)
      .select(Task.only(['id']))
      .where(Task.fields.done)
      .exists()
      .run(sqlWithOptions({ simplifyReferences: true }))
    ;
    
    expectText({ condenseSpace: true, ignoreCase: true }, x, `
      SELECT 1
      FROM task
      WHERE done = TRUE
      LIMIT 1
    `);
  });

  it('select list', () =>
  {
    const x = from(Task)
      .select(Task.only(['id']))
      .where(Task.fields.done)
      .list('id')
      .run(sqlWithOptions({ simplifyReferences: true }))
    ;
    
    expectText({ condenseSpace: true, ignoreCase: true }, x, `
      SELECT 
        id AS item
      FROM task
      WHERE done = TRUE
    `);
  });

  it('select value', () =>
  {
    const x = from(Task)
      .select(Task.only(['id']))
      .where(Task.fields.done)
      .value('id')
      .run(sqlWithOptions({ simplifyReferences: true }))
    ;
    
    expectText({ condenseSpace: true, ignoreCase: true }, x, `
      SELECT 
        id
      FROM task
      WHERE done = TRUE
      LIMIT 1
    `);
  });
  
  it('select subquery', () =>
  {
    const x = from(Task)
      .select(({ task }) => [
        task.id,
        task.name,
        from(Task.as('child')).where(({ child }) => child.parentId.eq(task.id)).count().as('childCount')
      ])
      .run(sqlWithOptions({ simplifyReferences: true }))
    ;
    
    expectText({ condenseSpace: true, ignoreCase: true }, x, `
      SELECT 
        id,
        name,
        (SELECT COUNT(*) FROM task AS child WHERE child.parentId = task.id) AS childCount
      FROM task
    `);
  });

  it('union', () =>
  {
    const x = from(Task)
      .select(Task.only(['id', 'name']))
      .where(Task.fields.done)
      .union(
        from(Task)
        .select(Task.only(['id', 'name']))
        .where(Task.fields.doneAt.isNotNull())
        .generic()
      )
      .orderBy('id')
      .run(sqlWithOptions({ simplifyReferences: true }))
    ;
    
    expectText({ ignoreSpace: true, ignoreCase: true }, x, `
      (
        SELECT 
          id, name
        FROM task
        WHERE done = TRUE
      )
      UNION
      (
        SELECT 
          id, name
        FROM task
        WHERE doneAt IS NOT NULL
      )
      ORDER BY id
    `);
  });

});