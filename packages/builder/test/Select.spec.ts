import { table, query, from, Select, values, Expr, ExprValueObjects, ExprType } from '../src';
import { expectExpr, expectExprType, expectSelect, expectExtends, expectTypeMatch } from './helper';


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
    },
  });
  
  const Task$ = Task.fields;

  it('simple', () => {
    const q = from(Task)
      .select(Task.all())
      .where([
        Task$.done.isTrue()
      ])
    ;

    expectExpr<[{ id: number, name: string, done: boolean, doneAt: Date, parentId: number }]>(q);
  });

  it('select *', () => {
    const q = from(Task)
      .select('*')
      .where([
        Task$.done.isTrue()
      ])
    ;

    expectExpr<[{ id: number, name: string, done: boolean, doneAt: Date, parentId: number }]>(q);
  });

  it('select distinct', () => {
    from(Task)
      .select('*')
      .distinct()
      .run((q) => {
        expectExpr<[{ id: number, name: string, done: boolean, doneAt: Date, parentId: number }]>(q);
      })
    ;
  });

  it('select distinct on', () => {
    from(Task)
      .select('*')
      .distinctOn('name')
      .orderBy('doneAt')
      .run((q) => {
        expectExpr<[{ id: number, name: string, done: boolean, doneAt: Date, parentId: number }]>(q);
      })
    ;
  });

  it('select orderBy', () => {
    from(Task)
      .select('*')
      .orderBy('done')
      .orderBy('done')
      .orderBy(Task.fields.doneAt)
      .orderBy(['done', 'name'])
      .orderBy(() => 'done')
      .orderBy(({ task }) => task.done)
      .orderBy(() => ['done'])
      .orderBy(({ task }) => ['done', task.done])
      .run((q) => {
        expectExpr<[{ id: number, name: string, done: boolean, doneAt: Date, parentId: number }]>(q);
      })
    ;
  });

  it('window named', () =>
  {
    from(Task)
      .window('nameWindow', (w, { task }) => w.partition(task.name).order(task.doneAt))
      .select((_, { rank }) => [
        rank().over('nameWindow').as('rank'),
      ])
      .run((q) => {
        expectExpr<[{ rank: number }]>(q);
      })
    ;
  });

  it('aggregate over', () =>
  {
    from(Task)
      .select(({ task }, { rank }) => [
        rank().over((w) => w.partition(task.name).order(task.doneAt)).as('rank'),
      ])
      .run((q) => {
        expectExpr<[{ rank: number }]>(q);
      })
    ;
  });

  it('group by', () =>
  {
    from(Task)
      .select(({ task }, { min, count }) => [
        task.doneAt,
        // @ts-ignore
        min(task.name).as('name'),
        count().as('count')
      ])
      .groupBy('doneAt')
      .run((q) => {
        expectExprType<[
          Select<"doneAt", Date>, Select<"name", string>, Select<"count", number>
        ][]>(q);
      })
    ;
  });

  it('group rollup', () =>
  {
    from(Task)
      .select(({ task }, { min, count }) => [
        task.doneAt,
        min(task.name).as('name'),
        count().as('count')
      ])
      .groupByRollup([['doneAt'], []])
      .run((q) => {
        expectExprType<[
          Select<"doneAt", Date>, Select<"name", string>, Select<"count", number>
        ][]>(q);
      })
    ;
  });

  it('group sets', () =>
  {
    from(Task)
      .select(({ task }, { min, count }) => [
        task.doneAt,
        min(task.name).as('name'),
        count().as('count')
      ])
      .groupBySet([['doneAt'], []])
      .run((q) => {
        expectExprType<[
          Select<"doneAt", Date>, Select<"name", string>, Select<"count", number>
        ][]>(q);
      })
    ;
  });

  it('group cube', () =>
  {
    from(Task)
      .select(({ task }, { min, count }) => [
        task.doneAt,
        min(task.name).as('name'),
        count().as('count')
      ])
      .groupByCube([['doneAt'], []])
      .run((q) => {
        expectExprType<[
          Select<"doneAt", Date>, Select<"name", string>, Select<"count", number>
        ][]>(q);
      })
    ;
  });

  it('row compare row to row', () => {
    from(Task)
      .select('*')
      .where(({ task }, { row }) => [
        row(task.id, task.name).is('=', [1, 'Hello'])
      ])
  });

  it('row compare row to subquery', () => {
    from(Task)
      .select('*')
      .where(({ task }, { row }, { lower }) => [
        row(task.all(), lower(task.name)).is('=', 
          from(Task)
            .select(Task.all())
            .select(({ task }, _, { lower }) => [
              lower(task.name).as('lower')
            ])
            .first()
        )
      ])
  });

  it('row compare row to subquery', () => {
    from(Task)
      .select('*')
      .where(({ task }, { row }) => [
        row(task.id, task.name).is('=', from(Task).select(({ task }) => [task.id, task.name]).first())
      ])
  });

  it('field shorthand', () => {
    expectExpr<number>(Task$.id.min());
    expectExpr<number>(Task$.id.max());
    expectExpr<number>(Task$.id.avg());
    expectExpr<number>(Task$.id.count());
    expectExpr<number>(Task$.id.sum());
    expectExpr<number>(Task$.id.first());
    expectExpr<number[]>(Task$.id.list());

    expectExpr<number>(Task$.id.min(Task$.done)); // min id of done tasks
    expectExpr<number>(Task$.id.max(Task$.done)); // max id of done tasks
    expectExpr<number>(Task$.id.avg(Task$.done)); // average id of done tasks
    expectExpr<number>(Task$.id.count(Task$.done)); // number of done tasks
    expectExpr<number>(Task$.id.sum(Task$.done)); // sum of done ids
    expectExpr<number>(Task$.id.first(Task$.done)); // first done id
    expectExpr<number[]>(Task$.id.list(Task$.done)); // ids of done tasks
  });

  it('maybe', () => {
    type Request = {
      query?: string;
      limit?: number;
      offset?: number;
      includeParent?: boolean;
    };

    const request: Request = {
      query: 'task%',
      limit: 23,
      offset: 1,
    };

    const q = from(Task)
      .select('*')
      .maybe(request.query, (q) => q
        .where(Task.fields.name.like(request.query as string))
      )
      .maybe(request.limit, (q) => q
        .limit(request.limit)
      )
      .maybe(request.offset, (q) => q
        .offset(request.offset)
      )
      .maybe(request.includeParent, (q) => q
        .joinLeft(Task.as('parentTask'), ({ parentTask }) => parentTask.id.eq(Task.fields.id))
        .select(({ parentTask }) => [parentTask.name.as('parentName')])
      )
    ;

    expectExpr<[{ id: number, name: string, done: boolean, doneAt: Date, parentId: number, parentName?: string }]>(q);
    expectTypeMatch<{
      id: number;
      name: string;
      done: boolean;
      doneAt: Date;
      parentId: number;
      parentName?: string | undefined;
    }[], ExprValueObjects<ExprType<typeof q>>>(true);

    expectExprType<string | undefined>(q.value('parentName'));
  });

  it('constant select', () => {
    const q = from(Task)
      .select((sources, { count }) => [
        count().as('count')
      ])
    ;

    expectExprType<[Select<'count', number>][]>(q);
  });

  it('counts', () => {

    const q = query()
      .from(Task)
      .select(({ task }) => task.all())
      .where(({ task }) => task.done.eq(true))
    ;

    expectExpr<[{ id: number, name: string, done: boolean, doneAt: Date, parentId: number }]>(q);
    expectExprType<number>(q.count());
    expectSelect<'count', number>(q.count().as('count'));

    const w = query()
      .select((sources, { count }) => [
        count().as('count')
      ])
    ;

    expectExprType<[Select<'count', number>]>(w.first());
  });

  it('recursive', () => {
    const q = query()
      .with(
        values([{ id: 43 }], ['id']).as('tasks'),
        ({ tasks }) =>
          from(Task)
          .select([Task.fields.id])
          .where([tasks.id.eq(Task.fields.parentId)])
      )
      .from('tasks')
      .select('*')
    ;

    expectExprType<[Select<'id', number>][]>(q);
  });

  it('lists from single select', () => {
    const q = query()
      .from(Task)
      .select(({ task }) => [task.name])
      .list('name')
    ;
    
    expectExprType<Select<'name', string>[]>(q);
    expectExpr<string[]>(q);
  });

  it('lists from all select', () => {
    const q = query()
      .from(Task)
      .select(({ task }) => task.all())
      .list('name')
    ;
    
    expectExprType<Select<'name', string>[]>(q);
    expectExtends<Expr<Select<'name', string>[]>, typeof q>();
    expectExpr<string[]>(q);
  });

  it('lists from expr', () => {
    const q = query()
      .from(Task)
      .list(({ task }) => task.name)
    ;
    
    expectExprType<string[]>(q);
  });

  it('exists', () => {
    const q = query()
      .from(Task)
      .select(({ task }, exprs, { lower }) => [
        lower(task.name).as('lower_name')
      ])
      .where(({ task }, { exists }) =>
        exists(
          query()
            .from(Task.as('parent'))
            .where(({ parent }) => [
              parent.id.eq(task.parentId)
            ])
            .exists()
        )
      )
    ;

    expectExpr<{ lower_name: string }[]>(q);
    expectExpr<{ lower_name: string }>(q.first());
  });

  it('union', () => {

    const q = query()
      .select((sources, { constant }) => [
        constant(1).as('value'),
        constant('hi').as('message'),
      ])
      .union(
        // TODO this is compatible
        from(Task)
          .select(({ task }, {}, { length }) => [
            length(task.name).as('name_length'),
            task.name
          ])
          .generic()
      )
      .union(
        // TODO this is compatible
        from(Task)
          .select(
            Task.fields.parentId,
            Task.fields.name
          )
          .generic()
      )
      .orderBy(({ set }) => set.message, 'DESC')
      .offset(10)
      .limit(10)
    ;

    expectExprType<[Select<'value', number>, Select<'message', string>][]>(q);
  });

});