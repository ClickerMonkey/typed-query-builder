import { DataInterval, from, table, withs } from '@typed-query-builder/builder';
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

  const PeopleAliased = table({
    name: 'people',
    table: 'Persons',
    fields: {
      id: 'INT',
      name: ['VARCHAR', 64],
    },
  });

  const GetRoles = table({
    name: 'getRoles',
    fields: {
      id: 'INT',
      name: 'TEXT',
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
        task."name" AS "name",
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
        project.ProjectID AS id, 
        project.ProjectName AS "name"
      FROM projects AS project
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
        ProjectName AS "name"
      FROM projects AS project
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
        ProjectName AS "name"
      FROM projects AS project
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
        "name",
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
        task."name" AS "name",
        done, 
        doneAt, 
        parentId, 
        assignee,
        people.id AS assigneeId,
        people."name" AS assigneeName
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
        COUNT(*) AS "count"
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
        UPPER(task."name") AS item
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
        my_tasks."name" AS "my_task.name"
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
        task."name" AS "name"
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
        task."name" AS "name"
      FROM task
      WHERE task.assignee = $myid
    `);
  });

  it('select actual constants', () =>
  {
    const x = DataInterval.from({ hours: 1, minutes: 20 }).run(sql);

    expectText({ condenseSpace: true }, x, `
      SELECT '1 hour 20 minutes'
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
        task."name" AS "name",
        task.done AS done, 
        task.doneAt AS doneAt, 
        task.parentId AS parentId, 
        task.assignee AS assignee,
        RANK() OVER w AS "rank"
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
        task."name" AS "name",
        task.done AS done, 
        task.doneAt AS doneAt, 
        task.parentId AS parentId, 
        task.assignee AS assignee,
        RANK() OVER (PARTITION BY task.done ORDER BY task.doneAt) AS "rank"
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
        id, 
        "name"
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
          .where(({ task }) => task.id.in(from(tasksDone).list(({ tasksDone }) => tasksDone.id)))
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
      ), tasksDoneNames AS (
        SELECT "name"
        FROM task
        WHERE id IN (SELECT tasksDone.id FROM tasksDone)
      )
      SELECT 
        id, 
        "name"
      FROM task
      WHERE id IN (SELECT tasksDone.id FROM tasksDone) 
         OR "name" IN (SELECT tasksDoneNames."name" FROM tasksDoneNames)
    `);
  });
  
  it('with recursive', () =>
  {
    const x = 
      withs(
        from(Task)
          .select(({ task }, { constant }) => [
            constant(0).as('depth'),
            task.id,
            task.name
          ])
          .where(({ task }, { param }) => [
            task.id.eq(param('rootId'))
          ])
          .as('tasksTree')
        , ({ tasksTree }) =>
          from(Task)
          .joinInner(tasksTree, ({ tasksTree, task }) => task.parentId.eq(tasksTree.id))
          .select(({ task, tasksTree }) => [
            tasksTree.depth.add(1).as('depth'),
            task.id,
            task.name
          ])
      )
      .with(
        from(Task)
          .select(({ task }) => [
            task.id,
          ])
          .where(({ task }) => task.done)
          .as('tasksDone')
      )
      .from('tasksTree')
      .select(({ tasksTree }) => tasksTree.all())
      .where(({ tasksDone, tasksTree }) => [
        tasksTree.id.in(tasksDone.id.list())
      ])
      .run(sqlWithOptions({ simplifyReferences: true }))
    ;
    
    expectText({ ignoreSpace: true, ignoreCase: true }, x, `
      WITH RECURSIVE tasksTree ("depth", id, "name") AS (
        SELECT 0, id, "name"
        FROM task
        WHERE id = $rootId
        UNION
        SELECT (tasksTree."depth" + 1), task.id, task."name"
        FROM task
        INNER JOIN tasksTree ON parentId = tasksTree.id
      ), tasksDone AS (
        SELECT id
        FROM task
        WHERE done = true
      )
      SELECT 
        "depth",
        id, 
        "name"
      FROM tasksTree
      WHERE id IN (SELECT tasksDone.id FROM tasksDone)
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
      SELECT DISTINCT "name"
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
      SELECT DISTINCT ON ("name") 
        id, 
        "name"
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
        task."name" AS "name",
        people."name" AS assigneeeName
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
        task."name" AS "name",
        people."name" AS assigneeeName
      FROM task
      LEFT JOIN people ON people.id = assignee
    `);
  });

  it('join left lateral', () =>
  {
    const x = from(People)
      .joinLeft(({ people }) =>
        from(Task)
          .select(({ task }, { count, max }) => [
            max(task.doneAt).as('lastDoneAt'),
            count().as('taskCount')
          ])
          .where(({ task }) => [
            task.assignee.eq(people.id)
          ])
          .as('taskStats')
      )
      .select(({ people, taskStats }) => [
        people.id,
        people.name,
        taskStats.lastDoneAt,
        taskStats.taskCount
      ])
      .run(sqlWithOptions({ simplifyReferences: true }))
    ;
    
    expectText({ condenseSpace: true, ignoreCase: true }, x, `
      SELECT
        id,
        "name",
        lastDoneAt,
        taskCount
      FROM people
      LEFT JOIN LATERAL (SELECT
          MAX(doneAt) AS lastDoneAt,
          COUNT(*) AS taskCount
        FROM task
        WHERE assignee = people.id) AS taskStats ON true
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
        task."name" AS "name",
        people."name" AS assigneeeName
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
        task."name" AS "name",
        people."name" AS assigneeeName
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
        task."name" AS "name",
        done, 
        doneAt, 
        parentId, 
        assignee,
        people.id as assigneeId,
        people."name" as assigneeName
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
      FROM "a"
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
        dateGet('dayOfWeek', doneAt) AS "dayOfWeek",
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
        "name"
      FROM task
      ORDER BY "name"
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
        "name"
      FROM task
      ORDER BY "name" ASC
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
        "name"
      FROM task
      ORDER BY "name" DESC
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
        "name"
      FROM task
      ORDER BY "name" ASC NULLS LAST
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
        "name"
      FROM task
      ORDER BY "name" ASC NULLS FIRST
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
        "name"
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
        "name"
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
        "name"
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
        "name",
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
          id, "name"
        FROM task
        WHERE done = TRUE
      )
      UNION
      (
        SELECT 
          id, "name"
        FROM task
        WHERE doneAt IS NOT NULL
      )
      ORDER BY id
    `);
  });

  it('aliases', () =>
  {
    const x = from(PeopleAliased)
      .select('*')
      .run(sql)
    ;
    
    expectText({ ignoreSpace: true, ignoreCase: true }, x, `
      SELECT
        people.id AS id,
        people."name" AS "name"
      FROM Persons as people
    `);
  });

  it('aliases aliased', () =>
  {
    const x = from(PeopleAliased.as('people'))
      .select('*')
      .run(sql)
    ;
    
    expectText({ ignoreSpace: true, ignoreCase: true }, x, `
      SELECT
        people.id AS id,
        people."name" AS "name"
      FROM Persons AS people
    `);
  });

  it('function table', () =>
  {
    const x = from((_, __, { currentTimestamp }) => GetRoles.call({
        0: 'Hello', 
        1: currentTimestamp()
      }))
      .select('*')
      .run(sql)
    ;

    expectText({ ignoreSpace: true, ignoreCase: true }, x, `
      SELECT
        getRoles.id AS id,
        getRoles."name" AS "name"
      FROM getRoles('Hello', currentTimestamp())
    `);
  });

  it('function table named parameters', () =>
  {
    const x = from((_, __, { currentTimestamp }) => GetRoles.call({
        name: 'Hello', 
        time: currentTimestamp()
      }))
      .select('*')
      .run(sql)
    ;

    expectText({ ignoreSpace: true, ignoreCase: true }, x, `
      SELECT
        getRoles.id AS id,
        getRoles."name" AS "name"
      FROM getRoles("name" => 'Hello', "time" => currentTimestamp())
    `);
  });

  it('quotes aliases appropriately', () => 
  {
    const Person = table({
      name: 'person',
      table: 'persons',
      fields: {
        id: 'INT',
        name: ['VARCHAR', 64],
        done: 'BOOLEAN',
        doneAt: 'TIMESTAMP',
        parentId: 'INT',
        assignee: 'INT',
      },
    });

    const x = from(Person)
      .joinInner(Task, ({ task, person }) => task.assignee.eq(person.id))
      .select(({ person, task }) => [
        person.id,
        person.name,
        task.name.as('taskName')
      ])
      .run(sql)
    ;

    expectText({ ignoreSpace: true, ignoreCase: true }, x, `
      SELECT
        person.id AS id,
        person."name" AS "name",
        task."name" as taskName
      FROM persons AS person
      INNER JOIN task 
        ON task.assignee = person.id
    `);
  });

  it('quotes aliases virtual', () => 
  {
    const Person = table({
      name: 'person',
      table: 'persons',
      fields: {
        id: 'INT',
        name: ['VARCHAR', 64],
        done: 'BOOLEAN',
        doneAt: 'TIMESTAMP',
        parentId: 'INT',
        assignee: 'INT',
      },
    });

    const x = withs(
        from(Person)
        .select(({ person }) => person.only(['id', 'name']))
        .as('names')
      )
      .with(
        from(Task)
        .select(({ task }) => task.only(['assignee']))
        .as('assignees')
      )
      .from('names')
      .joinInner('assignees', ({ names, assignees }) => 
        assignees.assignee.eq(names.id)
      )
      .select(({ names, assignees }) => [
        names.name,
        assignees.assignee
      ])
      .run(sql)
    ;

    expectText({ ignoreSpace: true, ignoreCase: true }, x, `
      WITH "names" AS (
        SELECT person.id AS id, person."name" AS "name" FROM persons AS person
      ), assignees AS (
        SELECT task.assignee AS assignee FROM task
      )
      SELECT
        "names"."name" AS "name",
        assignees.assignee AS assignee
      FROM "names"
      INNER JOIN assignees
        ON assignees.assignee = "names".id
    `);
  });

  it('quotes aliases virtual simplify references', () => 
  {
    const Person = table({
      name: 'person',
      table: 'persons',
      fields: {
        id: 'INT',
        name: ['VARCHAR', 64],
        done: 'BOOLEAN',
        doneAt: 'TIMESTAMP',
        parentId: 'INT',
        assignee: 'INT',
      },
    });

    const x = withs(
        from(Person)
        .select(({ person }) => person.only(['id', 'name']))
        .as('names')
      )
      .with(
        from(Task)
        .select(({ task }) => task.only(['assignee']))
        .as('assignees')
      )
      .from('names')
      .joinInner('assignees', ({ names, assignees }) => 
        assignees.assignee.eq(names.id)
      )
      .select(({ names, assignees }) => [
        names.name,
        assignees.assignee
      ])
      .run(sqlWithOptions({ simplifyReferences: true }))
    ;

    expectText({ ignoreSpace: true, ignoreCase: true }, x, `
      WITH "names" AS (
        SELECT id, "name" FROM persons AS person
      ), assignees AS (
        SELECT assignee FROM task
      )
      SELECT
        "name",
        assignee
      FROM "names"
      INNER JOIN assignees
        ON assignee = id
    `);
  });

  it('quotes aliases virtual simplify references duplicate', () => 
  {
    const Person = table({
      name: 'person',
      table: 'persons',
      fields: {
        id: 'INT',
        name: ['VARCHAR', 64],
        done: 'BOOLEAN',
        doneAt: 'TIMESTAMP',
        parentId: 'INT',
        assignee: 'INT',
      },
    });

    const x = withs(
        from(Person)
        .select(({ person }) => person.only(['id', 'name']))
        .as('names')
      )
      .with(
        from(Task)
        .select(({ task }) => task.only(['id', 'assignee']))
        .as('assignees')
      )
      .from('names')
      .joinInner('assignees', ({ names, assignees }) => 
        assignees.assignee.eq(names.id)
      )
      .select(({ names, assignees }) => [
        names.name,
        assignees.assignee
      ])
      .run(sqlWithOptions({ simplifyReferences: true }))
    ;

    expectText({ ignoreSpace: true, ignoreCase: true }, x, `
      WITH "names" AS (
        SELECT id, "name" FROM persons AS person
      ), assignees AS (
        SELECT id, assignee FROM task
      )
      SELECT
        "name",
        assignee
      FROM "names"
      INNER JOIN assignees
        ON assignee = "names".id
    `);
  });

});