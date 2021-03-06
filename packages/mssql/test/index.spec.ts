import { table, insert, update, from, withs, deletes } from '@typed-query-builder/builder';
import { exec, prepare, stream } from '../src';
import { getConnection } from './helper';


describe('index', () =>
{

  jest.setTimeout(10 * 1000);

  const GroupTable = table({
    name: 'Group',
    primary: ['ID'],
    fields: {
      ID: "INT",
      Name: ["NVARCHAR", 128],
    },
  });

  const PersonTable = table({
    name: 'Person',
    primary: ['ID'],
    fields: {
      ID: "INT",
      Name: ["NVARCHAR", 128],
      Email: ["NVARCHAR", 128],
      Location: ["NULL", "POINT"],
    },
  });

  const PersonGroupTable = table({
    name: 'PersonGroup',
    primary: ['GroupID', 'PersonID'],
    fields: {
      GroupID: "INT",
      PersonID: "INT",
      Status: "SMALLINT",
    },
  });

  const TaskTable = table({
    name: 'Task',
    primary: ['ID'],
    fields: {
      ID: "INT",
      GroupID: "INT",
      Name: ["NVARCHAR", 128],
      Details: "NTEXT",
      Done: "BIT",
      DoneAt: ["NULL", "TIMESTAMP"],
      ParentID: ["NULL", "INT"],
      AssignedTo: ["NULL", "INT"],
      AssignedAt: ["NULL", "TIMESTAMP"],
      CreatedAt: "TIMESTAMP",
      CreatedBy: ["NULL", "INT"],
    },
  });

  it('insert, insert returning, insert object, insert object array, affectedCount', async () =>
  {
    const conn = await getConnection();
    const getResult = exec(conn);
    const getCount = exec(conn, { affectedCount: true });

    const groupInserts = await insert(GroupTable, ['Name'])
      .returning(({ Group }) => [Group.ID])
      .values({ Name: 'Group 1' })
      .run( getResult )
    ;

    expect(groupInserts).toBeInstanceOf(Array);
    expect(groupInserts.length).toEqual(1);
    expect(groupInserts[0].ID).toBeDefined();

    const groupId = groupInserts[0].ID;

    const personInserts = await insert(PersonTable, ['Name', 'Email'])
      .returning(({ Person }) => [Person.ID])
      .values([
        { Name: 'Person 1', Email: 'Person1@gmail.com' },
        { Name: 'Person 2', Email: 'Person2@gmail.com' }
      ])
      .run( getResult )
    ;

    const personGroupInserts = await insert(PersonGroupTable, ['GroupID', 'PersonID'])
      .values(personInserts.map(p => ({ GroupID: groupId, PersonID: p.ID })))
      .run( getCount )
    ;

    expect(personGroupInserts.affected).toEqual(2);

    const taskInserts = await insert(TaskTable, ['GroupID', 'Name', 'Details', 'CreatedBy', 'Done'])
      .values([{
        GroupID: groupId,
        Name: 'Task 1',
        Done: false,
        Details: 'Task 1 Details',
        CreatedBy: personInserts[0].ID,
      }])
      .run( getCount )
    ;

    expect(taskInserts.affected).toBe(1);
  });

  it('select first, update set column', async () =>
  {
    const conn = await getConnection();
    const getResult = exec(conn);
    const getCount = exec(conn, { affectedCount: true });

    const first = await from(TaskTable)
      .select('*')
      .first()
      .run( getResult )
    ;

    expect(first).toBeDefined();
    expect(first.Done).toBe(false);

    const updateCount = await update(TaskTable)
      .set('Done', true)
      .where(({ Task }) => Task.ID.eq(first.ID))
      .run( getCount )
    ;

    expect(updateCount.affected).toBe(1);

    const reloaded = await from(TaskTable)
      .select('*')
      .where(({ Task }) => Task.ID.eq(first.ID))
      .first()
      .run( getResult )
    ;

    expect(reloaded).toBeDefined();
    expect(reloaded.ID).toBe(first.ID);
    expect(reloaded.Done).toBe(true);
  });

  it('select list', async () =>
  {
    const conn = await getConnection();
    const getResult = exec(conn);

    const names = await from(TaskTable)
      .list(({ Task }) => Task.Name)
      .run( getResult )
    ;

    expect(names).toBeDefined();
    expect(names.length).toBe(1);
    expect(names).toStrictEqual(['Task 1']);
  });

  it('select value', async () =>
  {
    const conn = await getConnection();
    const getResult = exec(conn);

    const name = await from(TaskTable)
      .value(({ Task }) => Task.Name)
      .run( getResult )
    ;

    expect(name).toBeDefined();
    expect(name).toBe('Task 1');
  });

  it('select with param', async () =>
  {
    const conn = await getConnection();
    const getResult = exec(conn);

    const first = await from(TaskTable)
      .select('*')
      .first()
      .run( getResult )
    ;

    expect(first).toBeDefined();

    const paramed = await from(TaskTable)
      .select('*')
      .where(({ Task }, { param }) => Task.ID.eq(param('id')))
      .first()
      .run( exec(conn, { params: { id: first.ID } }))
    ;

    expect(paramed).toBeDefined();
    expect(paramed.ID).toBe(first.ID);
  });

  it('prepared select', async () =>
  {
    const conn = await getConnection();
    const getPrepared = prepare(conn);

    const findById = await from(TaskTable)
      .select('*')
      .where(({ Task }, { param }) => Task.Name.eq(param('name')))
      .first()
      .run( getPrepared )
    ;
    
    try
    {
      const first = await findById.exec({ name: 'Task 1' });
    
      expect(first).toBeDefined();
      expect(first.Name).toBe('Task 1');
    }
    finally
    {
      await findById.release();
    }
  });

  it('prepared update', async () =>
  {
    const conn = await getConnection();
    const getResult = exec(conn);
    const getPrepared = prepare(conn, { affectedCount: true });

    const first = await from(TaskTable)
      .select('*')
      .first()
      .run( getResult )
    ;

    expect(first).toBeDefined();
    expect(first.Name).toBe('Task 1');
    expect(first.DoneAt).toBeNull();

    const findById = await update(TaskTable)
      .set(({}, {}, { currentDate }) => ({ DoneAt: currentDate() }))
      .where(({ Task }, { param }) => Task.Name.eq(param('name')))
      .run( getPrepared )
    ;
    
    try
    {
      const affected = await findById.exec({ name: 'Task 1' });
    
      expect(affected.affected).toBe(1);
    }
    finally
    {
      await findById.release();
    }

    const reloaded = await from(TaskTable)
      .select('*')
      .first()
      .run( getResult )
    ;

    expect(reloaded).toBeDefined();
    expect(reloaded.Name).toBe('Task 1');
    expect(reloaded.DoneAt).toBeTruthy();
  });

  it('prepared insert', async () =>
  {
    const conn = await getConnection();
    const getResult = exec(conn);
    const getPrepared = prepare<{ GroupID: number, Name: string, Details: string }>(conn);

    const group = await from(GroupTable)
      .value(({ Group }) => Group.ID)
      .run( getResult )
    ;

    const insertPrepared = await insert(TaskTable, ['GroupID', 'Name', 'Details'])
      .returning(({ Task }) => [Task.ID, Task.CreatedAt])
      .valuesFromParams()
      .run( getPrepared )
    ;
    
    try
    {
      const inserted = await insertPrepared.exec({
        GroupID: group,
        Name: 'Task 1b',
        Details: 'Task 1b Details',
      });
    
      expect(inserted).toBeDefined();
      expect(inserted.length).toBe(1);
      expect(inserted[0].ID).toBeDefined();
      expect(inserted[0].CreatedAt).toBeDefined();
    }
    finally
    {
      await insertPrepared.release();
    }
  });

  it('delete', async () =>
  {
    const conn = await getConnection();
    const getResult = exec(conn);
    const getCount = exec(conn, { affectedCount: true });

    const first = await from(TaskTable)
      .select('*')
      .first()
      .run( getResult )
    ;

    expect(first).toBeDefined();

    const deleted = await deletes(TaskTable)
      .where(({ Task }) => Task.ID.eq(first.ID))
      .run( getCount )
    ;

    expect(deleted.affected).toBe(1);

    const reloaded = await from(TaskTable)
      .select('*')
      .where(({ Task }) => Task.ID.eq(first.ID))
      .first()
      .run( getResult )
    ;
    
    expect(reloaded).toBeNull();
  });

  it('with recursive', async () =>
  {
    const conn = await getConnection();
    const getResult = exec(conn);
    const getCount = exec(conn, { affectedCount: true });

    const group = await from(GroupTable)
      .select('*')
      .first()
      .run( getResult )
    ;

    const rootTasks = await insert(TaskTable, ['GroupID', 'Name', 'Details', 'Done'])
      .returning(({ Task }) => [Task.ID])
      .values([{
        GroupID: group.ID,
        Name: 'Task 2',
        Done: false,
        Details: 'Task 2 Details',
      }])
      .run( getResult )
    ;

    expect(rootTasks).toBeDefined();
    expect(rootTasks.length).toBe(1);

    const rootTask = rootTasks[0];
    
    const childTasks = await insert(TaskTable, ['GroupID', 'Name', 'Details', 'Done', 'ParentID'])
      .returning(({ Task }) => [Task.ID])
      .values([{
        GroupID: group.ID,
        Name: 'Task 3',
        Done: false,
        Details: 'Task 3 Details',
        ParentID: rootTask.ID,
      }, {
        GroupID: group.ID,
        Name: 'Task 4',
        Done: false,
        Details: 'Task 4 Details',
        ParentID: rootTask.ID,
      }])
      .run( getResult )
    ;

    expect(childTasks).toBeDefined();
    expect(childTasks.length).toBe(2);

    const grandchildTasks = await insert(TaskTable, ['GroupID', 'Name', 'Details', 'ParentID'])
      .returning(({ Task }) => [Task.ID])
      .values([{
        GroupID: group.ID,
        Name: 'Task 5',
        Details: 'Task 5 Details',
        ParentID: childTasks[0].ID,
      }, {
        GroupID: group.ID,
        Name: 'Task 6',
        Details: 'Task 6 Details',
        ParentID: childTasks[0].ID,
      }, {
        GroupID: group.ID,
        Name: 'Task 7',
        Details: 'Task 7 Details',
        ParentID: childTasks[1].ID,
      }])
      .run( getCount )
    ;

    expect(grandchildTasks.affected).toBe(3);
    
    const tasksTree = 
      await withs(
        from(TaskTable)
          .select(({ Task }, { constant }) => [
            Task.ID,
            Task.Name,
            constant(0).as('Depth'),
          ])
          .where(({ Task }) => Task.ID.eq(rootTask.ID))
          .as('TasksTree'),
        ({ TasksTree }) =>
          from(TaskTable)
            .joinInner(TasksTree, ({ Task, TasksTree }) => Task.ParentID.eq(TasksTree.ID))
            .select(({ Task, TasksTree }) => [
              Task.ID,
              Task.Name,
              TasksTree.Depth.add(1).as('Depth'),
            ])
      )
      .from('TasksTree')
      .select(({ TasksTree }) => [
        TasksTree.Name,
        TasksTree.Depth
      ])
      .run( getResult )
    ;

    expect(tasksTree).toStrictEqual([
      { Name: 'Task 2', Depth: 0 },
      { Name: 'Task 3', Depth: 1 },
      { Name: 'Task 4', Depth: 1 },
      { Name: 'Task 7', Depth: 2 },
      { Name: 'Task 5', Depth: 2 },
      { Name: 'Task 6', Depth: 2 },
    ]);

    // JSON test
    
    const allTasks = await from(TaskTable)
      .select(({ Task  }) => [
        Task.Name,
        // string[]
        from(TaskTable.as('Children'))
          .using((sub, { Children }) => sub
            .where(Children.ParentID.eq(Task.ID))
            .orderBy(Children.Name)
            .list(Children.Name)
            .json()
          )
          .as('ChildrenNames'),
        // { Name: string, Done: boolean }[]
        from(TaskTable.as('Children'))
          .using((sub, { Children }) => sub
            .select([
              Children.Name,
              Children.Done,
            ])
            .where(Children.ParentID.eq(Task.ID))
            .orderBy(Children.Name)
            .json()
          )
          .as('Children'),
        // { Name: string, Done: boolean }
        from(TaskTable.as('Parent'))
          .using((sub, { Parent }) => sub
            .select([
              Parent.Name,
              Parent.Done,
            ])
            .where([
              Task.ParentID.isNotNull(),
              Task.ParentID.eq(Parent.ID)
            ])
            .first()
            .json()
          )
          .as('Parent')
      ])
      .where(({ Task }) => [
        Task.ID.eq(childTasks[0].ID)
      ])
      .first()
      .run( getResult )
    ;

    expect(allTasks).toStrictEqual({
      Name: 'Task 3',
      ChildrenNames: ['Task 5', 'Task 6'],
      Children: [{ 
        Name: 'Task 5', Done: false 
      }, { 
        Name: 'Task 6', Done: false 
      }],
      Parent: {
        Name: 'Task 2', Done: false
      },
    });
  });

  it('update affected & result', async () =>
  {
    const conn = await getConnection();
    const getResult = exec(conn, { affectedCount: true });

    const { affected, result } = await update(TaskTable)
      .returning(({ Task }) => [
        Task.Name
      ])
      .set({
        Done: true,
      })
      .run( getResult )
    ;

    expect(affected).toBe(7);
    expect(result).toStrictEqual([
      { Name: 'Task 1b' },
      { Name: 'Task 2' },
      { Name: 'Task 3' },
      { Name: 'Task 4' },
      { Name: 'Task 5' },
      { Name: 'Task 6' },
      { Name: 'Task 7' },
    ]);
  });

  it('select arrayMode', async () =>
  {
    const conn = await getConnection();
    const getResult = exec(conn, { arrayMode: true });

    const result = await from(TaskTable)
      .select(({ Task }) => [
        Task.Name,
        Task.Done
      ])
      .where(({ Task }) => [
        Task.Name.gt('Task 4'),
      ])
      .run( getResult )
    ;

    expect(result).toStrictEqual([
      ['Task 5', true],
      ['Task 6', true],
      ['Task 7', true],
    ]);
  });

  it('stream', async () =>
  {
    const conn = await getConnection();
    const getStream = stream(conn);

    const streamer = from(TaskTable)
      .select(({ Task }) => [
        Task.Name,
        Task.Done
      ])
      .orderBy('Name')
      .run( getStream )
    ;

    const accum = await streamer((task) => {
      return task.Name.substring(5);
    });

    expect(accum).toStrictEqual([
      '1b', '2', '3', '4', '5', '6', '7'
    ]);
  });

  it('select json', async () =>
  {
    const conn = await getConnection();
    const getResult = exec(conn);

    const result = await from(TaskTable)
      .select(({ Task }) => [
        Task.Name.as('task.name'),
        Task.Done.as('task.done')
      ])
      .where(({ Task }) => [
        Task.Name.gt('Task 4'),
      ])
      .json()
      .run( getResult )
    ;

    expect(result).toStrictEqual([
      { task: { name: 'Task 5', done: true } },
      { task: { name: 'Task 6', done: true } },
      { task: { name: 'Task 7', done: true } },
    ]);
  });

  it('select json nested', async () =>
  {
    const conn = await getConnection();
    const getResult = exec(conn, { detectJson: true, detectAllDates: true });

    const result = await from(TaskTable)
      .select(({ Task }) => [
        Task.Name.as('task.name'),
        Task.Done.as('task.done'),
        from(TaskTable.as('parent'))
          .where(({ parent }) => Task.ParentID.eq(parent.ID))
          .select(({ parent }) => parent.only(['Name', 'CreatedAt']))
          .first()
          .json()
          .as('task.parent')
      ])
      .where(({ Task }) => [
        Task.Name.gt('Task 4'),
      ])
      .json()
      .run( getResult )
    ;

    expect(result).toStrictEqual([
      { task: { name: 'Task 5', done: true, parent: { Name: 'Task 3', CreatedAt: (result as any)[0].task.parent.CreatedAt } } },
      { task: { name: 'Task 6', done: true, parent: { Name: 'Task 3', CreatedAt: (result as any)[1].task.parent.CreatedAt } } },
      { task: { name: 'Task 7', done: true, parent: { Name: 'Task 4', CreatedAt: (result as any)[2].task.parent.CreatedAt } } },
    ]);
  });

  it('select json first', async () =>
  {
    const conn = await getConnection();
    const getResult = exec(conn);

    const result = await from(TaskTable)
      .select(({ Task }) => [
        Task.Name.as('task.name'),
        Task.Done.as('task.done')
      ])
      .where(({ Task }) => [
        Task.Name.gt('Task 4'),
      ])
      .first()
      .json()
      .run( getResult )
    ;

    expect(result).toStrictEqual(
      { task: { name: 'Task 5', done: true } }
    );
  });

});