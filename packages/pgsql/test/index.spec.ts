import { table, insert, update, from, withs, deletes, exprs, createFns, fns, _Timestamp, _Ints, query, _Point, _Numeric, _Segment, _Line, _Box, _Circle, DataPoint, DataSegment, DataLine, DataBox, DataPath, DataPolygon, DataCircle, DataInterval, DataTemporal as Temporal } from '@typed-query-builder/builder';
import { DialectPgsql } from '@typed-query-builder/sql-pgsql';
import { exec, prepare, stream } from '../src';
import { getClient, getConnection } from './helper';


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

  it('select time types', async () => 
  {
    const conn = await getConnection();
    const getResult = exec(conn);
    
    interface Fns {
      make_timestamptz(year: _Ints, month: _Ints, day: _Ints, hour: _Ints, min: _Ints, sec: _Ints): _Timestamp;
    }
    const fn2 = createFns<Fns>();

    const times = [
      await fns.createTime(18, 23, 0).run( getResult ),
      await fns.createDate(1989, 1, 3).run( getResult ),
      await fns.createTimestamp(1989, 1, 3, 18, 23, 0).run( getResult ),
      await fn2.make_timestamptz(1989, 1, 3, 18, 23, 0).run( getResult ),
    ];

    expect(times).toStrictEqual([
      Temporal.fromText('18:23:00'),
      Temporal.fromText('1989-01-03'),
      Temporal.fromText('1989-01-03 18:23:00'),
      Temporal.fromText('1989-01-03 18:23:00+00'),
    ]);
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
      .select(({ locations }, {}, { geomDistance }) => [
        locations.name,
        geomDistance(
          locations.location.required().cast(['POINT', 4326]),
          DataPoint.earth(-2.1, -2),
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

  it('type formats default', async () => 
  {
    await getClient({}, async (client) => {
      const getResult = exec(client);

      const r = await query()
        .select((_, { raw }) => [
          raw(`point '(1,3)'`).as('_point'),
          raw(`line '{1,3,2}'`).as('_line'),
          raw(`lseg '((1,3),(6,8))'`).as('_lseg'),
          raw(`box '((1,3),(6,8))'`).as('_box'),
          raw(`path '((0,1),(2,3),(4,5),(6,7))'`).as('_path'),
          raw(`polygon '((0,1),(2,3),(4,5),(6,7))'`).as('_polygon'),
          raw(`circle '<(0,1),2>'`).as('_circle'),
          raw(`'1'::boolean`).as('_boolean'),
          raw(`TIMESTAMP '2004-10-19 10:23:54'`).as('_timestamp'),
          raw(`TIMESTAMP WITH TIME ZONE '2004-10-19 10:23:54+02'`).as('_timestamptz'),
          raw(`DATE '1999-01-08'`).as('_date'),
          raw(`TIME WITH TIME ZONE '04:05:06-08:00'`).as('_timetz'),
          raw(`TIME '04:05'`).as('_time'),
          raw(`'80 minutes'::interval`).as('_interval'),
          raw(`'\\xDEADBEEF'::bytea`).as('_bytea'),
          raw(`'abc'::text`).as('_text'),
          raw(`'abc'::varchar(4)`).as('_varchar'),
          raw(`'abc'::char(4)`).as('_char'),
          raw(`2.3::money`).as('_money'),
          raw(`2::smallint`).as('_smallint'),
          raw(`2::integer`).as('_integer'),
          raw(`2::bigint`).as('_bigint'),
          raw(`2::decimal`).as('_decimal'),
          raw(`2::numeric`).as('_numeric'),
          raw(`2.1::real`).as('_real'),
          raw(`2.3::double precision`).as('_double'),
          raw(`'192.168.100.128/25'::cidr`).as('_cidr'),
          raw(`'192.168.0.1/24'::inet`).as('_inet'),
          raw(`'08:00:2b:01:02:03'::macaddr`).as('_macaddr'),
          raw(`'a0eebc999c0b4ef8bb6d6bb9bd380a11'::uuid`).as('_uuid'),
          raw(`'[1, 2, "foo", null]'::json`).as('_json'),
          raw(`'{1,2,3}'::integer[]`).as('_array'),
        ])
        .first()
        .run(getResult)
      ;

      expect(r).toStrictEqual({
        _point: new DataPoint(1, 3),
        _line: new DataLine(1, 3, 2),
        _lseg: new DataSegment(1, 3, 6, 8),
        _box: new DataBox(1, 3, 6, 8),
        _path: new DataPath([new DataPoint(0, 1), new DataPoint(2, 3), new DataPoint(4, 5), new DataPoint(6, 7)]),
        _polygon: new DataPolygon([new DataPoint(0, 1), new DataPoint(2, 3), new DataPoint(4, 5), new DataPoint(6, 7)]),
        _circle: new DataCircle(0, 1, 2),
        _boolean: true,
        _timestamp: Temporal.fromText('2004-10-19 10:23:54'),
        _timestamptz: Temporal.fromText('2004-10-19 08:23:54+00'),
        _date: Temporal.fromText('1999-01-08'),
        _timetz: Temporal.fromText('04:05:06-08'),
        _time: Temporal.fromText('04:05:00'),
        _interval: DataInterval.from({ hours: 1, minutes: 20 }),
        _bytea: Buffer.from('DEADBEEF', 'hex'),
        _text: 'abc',
        _varchar: 'abc',
        _char: 'abc ',
        _money: '$2.30',
        _smallint: 2,
        _integer: 2,
        _bigint: 2,
        _decimal: 2,
        _numeric: 2,
        _real: 2.1,
        _double: 2.3,
        _cidr: '192.168.100.128/25',
        _inet: '192.168.0.1/24',
        _macaddr: '08:00:2b:01:02:03',
        _uuid: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        _json: [1, 2, 'foo', null],
        _array: [1,2,3],
      });
    });
  });

  it('type formats geography text raw', async () => 
  {
    await getClient({}, async (client) => {
      const getResult = exec(client);

      const r = await query()
        .select((_, { raw }) => [
          raw(`ST_Point(0,1)`).as('_point'),
          raw(`ST_SetSRID(ST_Point(-76.514612,40.103422), 4326)`).as('_geoPoint'),
        ])
        .first()
        .run(getResult)
      ;

      expect(r).toStrictEqual({
        _point: new DataPoint(0, 1),
        _geoPoint: DataPoint.earth(-76.514612, 40.103422),
      });
    });
  });

});

