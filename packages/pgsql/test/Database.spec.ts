import { table, from, deletes, insert } from '@typed-query-builder/builder';
import { createDatabase } from '../src';
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

  /*
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
  */

  it('transaction', async () =>
  {
    const conn = await getConnection();
    const db = createDatabase(conn);

    await insert(GroupTable, ['id', 'name'])
      .values([
        { id: 1, name: 'Group 1' },
        { id: 2, name: 'Group 2' },
      ])
      .run( db.get() )
    ;

    const initialCount = await 
      from(GroupTable)
      .count()
      .run(db.get())
    ;

    expect(initialCount).toBeGreaterThan(0);

    await db.transaction(async (txn, abort) => 
    {
      await deletes(GroupTable)
        .run(txn.count())
      ;

      const exists = await 
        from(GroupTable)
        .count()
        .run(txn.count())
      ;

      expect(exists.result).toBe(0);

      abort();
    });

    const remainingCount = await 
      from(GroupTable)
      .count()
      .run(db.get())
    ;

    expect(remainingCount).toBe(initialCount);
  });

  it('run', async () =>
  {
    const conn = await getConnection();
    const db = createDatabase(conn);
    const run = db.run();

    await deletes(GroupTable).run(db.get());

    const i0 = insert(GroupTable, ['id', 'name']).values({ id: 3, name: 'Group 3' });
    const i1 = insert(GroupTable, ['id', 'name']).values({ id: 4, name: 'Group 4' });

    await run([i0, i1]);

    const currentCount = await 
      from(GroupTable)
      .count()
      .run(db.get())
    ;

    expect(currentCount).toBe(2);
  });

  it('getMany', async () =>
  {
    const conn = await getConnection();
    const db = createDatabase(conn);
    const getMany = db.many();

    const s0 = from(GroupTable).count();
    const s1 = from(GroupTable).select('*').first();
    
    const [r0, r1] = await getMany(s0, s1);

    expect(r0).toBe(2);
    expect(r1).toStrictEqual({
      id: 3,
      name: 'Group 3'
    });
  });

});