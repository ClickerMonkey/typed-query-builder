import { defineSource, Select, query, UnionToTuple } from '../src/';
import { expectExprType, expectSelect } from './helper';


// tslint:disable: no-magic-numbers

describe('Select', () => {

  const Task = defineSource({
    name: 'task',
    fields: {
      id: 'INT',
      name: ['VARCHAR', 64],
      done: 'BOOLEAN',
      doneAt: 'TIMESTAMP',
      parentId: 'INT',
    },
  });

  it('counts', () => {
    const q = query()
      .from(Task)
      .select(({ task }) => task.all())
      .where(({ task }) => task.done.eq(true))
    ;

    expectExprType<number>(q.count());
    expectSelect<'count', number>(q.count().as('count'));

    const w = query()
      .select(() => [
        q.count().as('count')
      ])
    ;

    expectExprType<{ count: number }>(w.first());
    expectExprType<[number]>(w.row());
  });

  it('lists from single select', () => {
    const q = query()
      .from(Task)
      .select(({ task }) => [task.name])
      .list('name')
    ;
    
    expectExprType<string[]>(q);
  });

  it('lists from all select', () => {
    const q = query()
      .from(Task)
      .select(({ task }) => task.all())
      .list('name')
    ;
    
    expectExprType<string[]>(q);
  });

  it('lists from expr', () => {
    const q = query()
      .from(Task)
      .list(({ task }) => task.name)
    ;
    
    expectExprType<string[]>(q);
  });

  it('row', () => {
    const q = query()
      .from(Task)
      .select(Task.all())
      .where(({ task }) => task.doneAt.isNotNull())
      .orderBy(({ task }) => task.doneAt, 'DESC')
      .row()
    ;
    
    expectExprType<[number, string, boolean, Date]>(q);
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
        )
      )
    ;

    expectExprType<{ lower_name: string }[]>(q);
    expectExprType<{ lower_name: string }>(q.first());
    expectExprType<[string]>(q.row());
  });

  it('union', () => {
    const q = query()
      .select((sources, { constant }) => [
        constant(1).as('value'),
        constant('hi').as('message'),
      ])
      .union(
        // TODO this is compatible
        query()
          .from(Task)
          .select(({ task }, {}, { length }) => [
            length(task.name).as('other'),
            task.name
          ])
      )
      .union(
        // TODO this is NOT compatible
        query()
          .from(Task)
          .count()
      )
      .union(
        // TODO this is compatible
        query()
          .from(Task)
          .select(
            Task.select.parentId,
            Task.select.name
          )
      )
      .orderBy(({ set }) => set.message, 'DESC')
      .offset(10)
      .limit(10)
    ;
  });

});

type AB<T> = T extends Array<infer E> ? UnionToTuple<E> : T;

type AC = AB<(Select<'a', number> | Select<'b', string>)[]>;
type AD = AB<[Select<'a', number>, Select<'b', string>]>;