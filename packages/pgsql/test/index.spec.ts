import { table, insert, update, from, withs, deletes, exprs } from '@typed-query-builder/builder';
import { DialectPgsql } from '@typed-query-builder/sql-pgsql';
import { exec, prepare, stream } from '../src';
import { getConnection } from './helper';


describe('index', () =>
{

  jest.setTimeout(10 * 1000);

  const GroupTable = table({ 
    name: 'group', 
    primary: ['id'], 
    fields: { 
      id: "INT", 
      name: ["VARCHAR", 128], 
    }, 
  }); 
  
  const PersonGroupTable = table({ 
    name: 'personGroup',
    table: 'person_group', 
    primary: ['groupId', 'personId'], 
    fields: { 
      groupId: "INT", 
      personId: "INT", 
      status: "SMALLINT", 
    }, 
    fieldColumn: {
      groupId: 'group_id',
      personId: 'person_id',
    },
  }); 
  
  const PersonTable = table({ 
    name: 'person', 
    primary: ['id'], 
    fields: { 
      id: "INT", 
      name: ["VARCHAR", 128], 
      email: ["VARCHAR", 128], 
      location: ["NULL", "POINT"], 
    }, 
  }); 
  
  const TaskTable = table({ 
    name: 'task', 
    primary: ['id'], 
    fields: { 
      id: "INT", 
      groupId: "INT", 
      name: ["VARCHAR", 128], 
      details: "TEXT", 
      done: "BOOLEAN", 
      doneAt: ["NULL", "TIMESTAMP"], 
      parentId: ["NULL", "INT"], 
      assignedTo: ["NULL", "INT"], 
      assignedAt: ["NULL", "TIMESTAMP"], 
      createdAt: "TIMESTAMP", 
      createdBy: ["NULL", "INT"], 
    }, 
    fieldColumn: {
      groupId: 'group_id',
      doneAt: 'done_at',
      parentId: 'parent_id',
      assignedTo: 'assigned_to',
      assignedAt: 'assigned_at',
      createdAt: 'created_at',
      createdBy: 'created_by',
    },
  });

  const LocationsTable = table({ 
    name: 'locations', 
    primary: ['id'], 
    fields: { 
      id: "INT", 
      location: ["NULL", "GEOMETRY"], 
      name: ["NULL", "TEXT"], 
    }, 
  });

  it('select constant', async () => 
  {
    const conn = await getConnection();
    const getResult = exec(conn);
    const one = await exprs().constant(1).run( getResult );

    expect( one ).toEqual(1);
  });

  it('select null exists', async () => 
  {
    const conn = await getConnection();
    const getResult = exec(conn);

    const exists = await from(GroupTable)
      .exists()
      .run( getResult )
    ;

    expect( exists ).toEqual(null);
  });

  it('select first null', async () => 
  {
    const conn = await getConnection();
    const getResult = exec(conn);

    const first = await from(GroupTable)
      .first()
      .run( getResult )
    ;

    expect( first ).toEqual(null);
  });

  it('select first value null', async () => 
  {
    const conn = await getConnection();
    const getResult = exec(conn);

    const name = await from(GroupTable)
      .select(({ group }) => [ group.name ])
      .value('name')
      .run( getResult )
    ;

    expect( name ).toEqual(null);
  });

  it('insert, insert returning, insert object, insert object array, affectedCount', async () =>
  {
    const conn = await getConnection();
    const getResult = exec(conn);
    const getCount = exec(conn, { affectedCount: true });

    const groupInserts = await insert(GroupTable, ['name'])
      .returning(({ group }) => [group.id])
      .values({ name: 'Group 1' })
      .run( getResult )
    ;

    expect(groupInserts).toBeInstanceOf(Array);
    expect(groupInserts.length).toEqual(1);
    expect(groupInserts[0].id).toBeDefined();

    const groupId = groupInserts[0].id;

    const personInserts = await insert(PersonTable, ['name', 'email'])
      .returning(({ person }) => [person.id])
      .values([
        { name: 'Person 1', email: 'Person1@gmail.com' },
        { name: 'Person 2', email: 'Person2@gmail.com' }
      ])
      .run( getResult )
    ;

    const personGroupInserts = await insert(PersonGroupTable, ['groupId', 'personId'])
      .values(personInserts.map(p => ({ groupId, personId: p.id })))
      .run( getCount )
    ;

    expect(personGroupInserts.affected).toEqual(2);

    const taskInserts = await insert(TaskTable, ['groupId', 'name', 'details', 'createdBy', 'done'])
      .values([{
        groupId,
        name: 'Task 1',
        done: false,
        details: 'Task 1 Details',
        createdBy: personInserts[0].id,
      }])
      .run( getCount )
    ;

    expect(taskInserts.affected).toBe(1);
  });

  it('select 1 exists', async () => 
  {
    const conn = await getConnection();
    const getResult = exec(conn);

    const exists = await from(GroupTable)
      .exists()
      .run( getResult )
    ;

    expect( exists ).toEqual(1);
  });

  it('select first empty', async () => 
  {
    const conn = await getConnection();
    const getResult = exec(conn);

    const first = await from(GroupTable)
      .first()
      .run( getResult )
    ;

    expect( first ).toStrictEqual({});
  });

  it('select first simple', async () => 
  {
    const conn = await getConnection();
    const getResult = exec(conn);

    const first = await from(GroupTable)
      .select(({ group }) => [ group.name ])
      .first()
      .run( getResult )
    ;

    expect( first ).toStrictEqual({ name: 'Group 1' });
  });

  it('select first value', async () => 
  {
    const conn = await getConnection();
    const getResult = exec(conn);

    const name = await from(GroupTable)
      .select(({ group }) => [ group.name ])
      .value('name')
      .run( getResult )
    ;

    expect( name ).toEqual('Group 1');
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
    expect(first.done).toBe(false);

    const updateCount = await update(TaskTable)
      .set('done', true)
      .where(({ task }) => task.id.eq(first.id))
      .run( getCount )
    ;

    expect(updateCount.affected).toBe(1);

    const reloaded = await from(TaskTable)
      .select('*')
      .where(({ task }) => task.id.eq(first.id))
      .first()
      .run( getResult )
    ;

    expect(reloaded).toBeDefined();
    expect(reloaded.id).toBe(first.id);
    expect(reloaded.done).toBe(true);
  });

  it('select list', async () =>
  {
    const conn = await getConnection();
    const getResult = exec(conn);

    const names = await from(TaskTable)
      .list(({ task }) => task.name)
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
      .value(({ task }) => task.name)
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
      .where(({ task }, { param }) => task.id.eq(param('id')))
      .first()
      .run( exec(conn, { params: { id: first.id } }))
    ;

    expect(paramed).toBeDefined();
    expect(paramed.id).toBe(first.id);
  });

  it('prepared select', async () =>
  {
    const conn = await getConnection();
    const getPrepared = prepare(conn);

    const findById = await from(TaskTable)
      .select('*')
      .where(({ task }, { param }) => task.name.eq(param('name')))
      .first()
      .run( getPrepared )
    ;
    
    try
    {
      const first = await findById.exec({ name: 'Task 1' });
    
      expect(first).toBeDefined();
      expect(first.name).toBe('Task 1');
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
    expect(first.name).toBe('Task 1');
    expect(first.doneAt).toBeNull();

    const findById = await update(TaskTable)
      .set(({}, {}, { currentDate }) => ({ doneAt: currentDate() }))
      .where(({ task }, { param }) => task.name.eq(param('name')))
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
    expect(reloaded.name).toBe('Task 1');
    expect(reloaded.doneAt).toBeTruthy();
  });

  it('prepared insert', async () =>
  {
    const conn = await getConnection();
    const getResult = exec(conn);
    const getPrepared = prepare<{ groupId: number, name: string, details: string }>(conn);

    const group = await from(GroupTable)
      .value(({ group }) => group.id)
      .run( getResult )
    ;

    const insertPrepared = await insert(TaskTable, ['groupId', 'name', 'details'])
      .returning(({ task }) => [task.id, task.createdAt])
      .valuesFromParams()
      .run( getPrepared )
    ;
    
    try
    {
      const inserted = await insertPrepared.exec({
        groupId: group,
        name: 'Task 1b',
        details: 'Task 1b Details',
      });
    
      expect(inserted).toBeDefined();
      expect(inserted.length).toBe(1);
      expect(inserted[0].id).toBeDefined();
      expect(inserted[0].createdAt).toBeDefined();
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
      .where(({ task }) => task.id.eq(first.id))
      .run( getCount )
    ;

    expect(deleted.affected).toBe(1);

    const reloaded = await from(TaskTable)
      .select('*')
      .where(({ task }) => task.id.eq(first.id))
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

    const rootTasks = await insert(TaskTable, ['groupId', 'name', 'details', 'done'])
      .returning(({ task }) => [task.id])
      .values([{
        groupId: group.id,
        name: 'Task 2',
        done: false,
        details: 'Task 2 Details',
      }])
      .run( getResult )
    ;

    expect(rootTasks).toBeDefined();
    expect(rootTasks.length).toBe(1);

    const rootTask = rootTasks[0];
    
    const childTasks = await insert(TaskTable, ['groupId', 'name', 'details', 'done', 'parentId'])
      .returning(({ task }) => [task.id])
      .values([{
        groupId: group.id,
        name: 'Task 3',
        done: false,
        details: 'Task 3 Details',
        parentId: rootTask.id,
      }, {
        groupId: group.id,
        name: 'Task 4',
        done: false,
        details: 'Task 4 Details',
        parentId: rootTask.id,
      }])
      .run( getResult )
    ;

    expect(childTasks).toBeDefined();
    expect(childTasks.length).toBe(2);

    const grandchildTasks = await insert(TaskTable, ['groupId', 'name', 'details', 'parentId'])
      .returning(({ task }) => [task.id])
      .values([{
        groupId: group.id,
        name: 'Task 5',
        details: 'Task 5 Details',
        parentId: childTasks[0].id,
      }, {
        groupId: group.id,
        name: 'Task 6',
        details: 'Task 6 Details',
        parentId: childTasks[0].id,
      }, {
        groupId: group.id,
        name: 'Task 7',
        details: 'Task 7 Details',
        parentId: childTasks[1].id,
      }])
      .run( getCount )
    ;

    expect(grandchildTasks.affected).toBe(3);
    
    const tasksTree = 
      await withs(
        from(TaskTable)
          .select(({ task }, { constant }) => [
            task.id,
            task.name,
            constant(0).as('depth'),
          ])
          .where(({ task }) => task.id.eq(rootTask.id))
          .as('TasksTree'),
        ({ TasksTree }) =>
          from(TaskTable)
            .joinInner(TasksTree, ({ task, TasksTree }) => task.parentId.eq(TasksTree.id))
            .select(({ task, TasksTree }) => [
              task.id,
              task.name,
              TasksTree.depth.add(1).as('depth'),
            ])
      )
      .from('TasksTree')
      .select(({ TasksTree }) => [
        TasksTree.name,
        TasksTree.depth
      ])
      .orderBy('depth')
      .orderBy('name')
      .run( getResult )
    ;

    expect(tasksTree).toStrictEqual([
      { name: 'Task 2', depth: 0 },
      { name: 'Task 3', depth: 1 },
      { name: 'Task 4', depth: 1 },
      { name: 'Task 5', depth: 2 },
      { name: 'Task 6', depth: 2 },
      { name: 'Task 7', depth: 2 },
    ]);

    // JSON test
    
    const allTasks = await from(TaskTable)
      .select(({ task }) => [
        task.name,
        // string[]
        from(TaskTable.as('children'))
          .using((sub, { children }) => sub
            .where(children.parentId.eq(task.id))
            .orderBy(children.name)
            .list(children.name)
            .json()
          )
          .as('childrenNames'),
        // { name: string, done: boolean }[]
        from(TaskTable.as('children'))
          .using((sub, { children }) => sub
            .select([
              children.name,
              children.done,
            ])
            .where(children.parentId.eq(task.id))
            .orderBy(children.name)
            .json()
          )
          .as('children'),
        // { name: string, done: boolean }
        from(TaskTable.as('parent'))
          .using((sub, { parent }) => sub
            .select([
              parent.name,
              parent.done,
            ])
            .where([
              task.parentId.isNotNull(),
              task.parentId.eq(parent.id)
            ])
            .first()
            .json()
          )
          .as('parent')
      ])
      .where(({ task }) => [
        task.id.eq(childTasks[0].id)
      ])
      .first()
      .run( getResult )
    ;

    expect(allTasks).toStrictEqual({
      name: 'Task 3',
      childrenNames: ['Task 5', 'Task 6'],
      children: [{ 
        name: 'Task 5', done: false 
      }, { 
        name: 'Task 6', done: false 
      }],
      parent: {
        name: 'Task 2', done: false
      },
    });
  });

  it('update affected & result', async () =>
  {
    const conn = await getConnection();
    const getResult = exec(conn, { affectedCount: true });

    const { affected, result } = await update(TaskTable)
      .returning(({ task }) => [
        task.name
      ])
      .set({
        done: true,
      })
      .run( getResult )
    ;

    expect(affected).toBe(7);
    expect(result).toStrictEqual([
      { name: 'Task 1b' },
      { name: 'Task 2' },
      { name: 'Task 3' },
      { name: 'Task 4' },
      { name: 'Task 5' },
      { name: 'Task 6' },
      { name: 'Task 7' },
    ]);
  });

  it('select arrayMode', async () =>
  {
    const conn = await getConnection();
    const getResult = exec(conn, { arrayMode: true });

    const result = await from(TaskTable)
      .select(({ task }) => [
        task.name,
        task.done
      ])
      .where(({ task }) => [
        task.name.gt('Task 4'),
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
      .select(({ task }) => [
        task.name,
        task.done
      ])
      .orderBy('name')
      .run( getStream )
    ;

    const accum = await streamer((task) => {
      return task.name.substring(5);
    });

    expect(accum).toStrictEqual([
      '1b', '2', '3', '4', '5', '6', '7'
    ]);
  });

  it('geometry distance', async () => 
  {
    const conn = await getConnection();
    const getResult = exec(conn);

    DialectPgsql.gis = true;

    const locations = await insert(LocationsTable, ['name', 'location'])
      .values([
        { name: '4 up', location: { x: 0, y: 4 } },
        { name: '4 down', location: { x: 0, y: -4 } },
        { name: 'origin', location: { x: 0, y: 0 } },
        { name: '4 left', location: { x: -4, y: 0 } },
      ])
      .run( getResult )
    ;

    expect(locations).toBeTruthy();

    const near = await withs(
      from(LocationsTable)
        .select(({ locations }, {}, { geomDistance }) => [
          locations.name,
          geomDistance(locations.location.required(), { x: -2.1, y: -2}).as('distance')
        ])
        .as('distancedLocations')
      )
      .from('distancedLocations')
      .select('*')
      .where(({ distancedLocations }) => distancedLocations.distance.lt(3))
      .orderBy('distance')
      .run( getResult )
    ;

    expect(near).toStrictEqual([
      { name: '4 left', distance: 2.758622844826744 },
      { name: '4 down', distance: 2.9 },
      { name: 'origin', distance: 2.9 }
    ]);

    DialectPgsql.gis = false;
  });

  it('geography distance', async () => 
  {
    const conn = await getConnection();
    const getResult = exec(conn);

    DialectPgsql.gis = true;

    const near = await from(LocationsTable)
      .select(({ locations }, { cast }, { geomDistance }) => [
        locations.name,
        geomDistance(
          locations.location.required().cast(['POINT', 4326]), 
          cast('GEOGRAPHY', { x: -2.1, y: -2})
        ).as('distance')
      ])
      .where(({}, {}, {}, { distance }) => [
        distance.lt(400000)
      ])
      .orderBy('distance')
      .run( getResult )
    ;
    
    expect(near).toStrictEqual([
      { name: '4 left', distance: 305980.8078121 },
      { name: '4 down', distance: 321565.03691648 },
      { name: 'origin', distance: 321766.80599594 }
    ]);

    DialectPgsql.gis = false;
  });

});