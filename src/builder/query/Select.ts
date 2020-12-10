import { isArray, isFunction, isString } from '../../fns';
import { AppendObjects, AggregateType, JoinType, Selects, Sources, Name, SourceInstance, OrderDirection, ObjectFromSelects, PartialChildren, AppendTuples, MergeObjects, SelectsKeys, Simplify, ArrayToTuple } from '../../_Types';
import { ExprAggregate } from '../exprs/Aggregate';
import { ExprProvider, ExprFactory } from '../exprs/Factory';
import { Expr, ExprInput, ExprType } from '../exprs/Expr';
import { QuerySelectBase } from './Base';
import { QuerySelectExistential } from './Existential';
import { QuerySelectFirst } from './First';
import { QuerySelectFirstRow } from './FirstRow';
import { QuerySelectFirstValue } from './FirstValue';
import { QuerySelectList } from './List';
import { Source, SourceInstanceFromTuple, SourcesFieldsFactory } from '../sources/Source';
import { SourceJoin } from '../sources/Join';
import { OrderBy } from '../Order';
import { Select } from '../select';
import { fns, FunctionProxy } from '../../Functions';
import { QuerySet, QuerySetQuery } from './Set';
import { SourceQuery } from '../sources';



export class QuerySelect<T extends Sources, S extends Selects> extends QuerySelectBase<T, S, ObjectFromSelects<S>[]>
{
  
  public static readonly id = 's';

  public static create<T extends Sources = {}, S extends Selects = []>(): QuerySelect<T, S> {
    return new QuerySelect<T, S>();
  }

  public constructor(extend?: QuerySelect<T, S>) {
    super(extend);
  }

  public as<A extends Name>(alias: A): SourceQuery<A, S> {
    return new SourceQuery(alias, this);
  }

  public extend(): QuerySelect<T, S> {
    return new QuerySelect( this );
  }

  public from<FS extends Source<any, any>[]>(sources: ExprProvider<T, S, FS>): QuerySelect<Simplify<MergeObjects<T, SourceInstanceFromTuple<FS>>>, S>
  public from<FS extends Source<any, any>[]>(...sources: FS): QuerySelect<Simplify<MergeObjects<T, SourceInstanceFromTuple<FS>>>, S>
  public from<FS extends Source<any, any>[]>(...sourceInput: any[]): QuerySelect<Simplify<MergeObjects<T, SourceInstanceFromTuple<FS>>>, S> {
    const sources: Source<any, any>[] = isFunction(sourceInput[0])
      ? this._exprs.provide(sourceInput[0])
      : isArray(sourceInput[0])
        ? sourceInput[0]
        : sourceInput;

    sources.forEach((source) => {
      this.addSource(source);
    });

    return this as any;
  }

  public join<JN extends Name, JT extends SourceInstance>(type: 'INNER', source: Source<JN, JT>, on: ExprProvider<AppendObjects<T, Record<JN, JT>>, S, ExprInput<boolean>>): QuerySelect<AppendObjects<T, Record<JN, JT>>, S>
  public join<JN extends Name, JT extends SourceInstance>(type: 'LEFT', source: Source<JN, JT>, on: ExprProvider<AppendObjects<T, Record<JN, Partial<JT>>>, S, ExprInput<boolean>>): QuerySelect<AppendObjects<T, Record<JN, Partial<JT>>>, S>
  public join<JN extends Name, JT extends SourceInstance>(type: 'RIGHT', source: Source<JN, JT>, on: ExprProvider<AppendObjects<PartialChildren<T>, Record<JN, JT>>, S, ExprInput<boolean>>): QuerySelect<AppendObjects<PartialChildren<T>, Record<JN, JT>>, S>
  public join<JN extends Name, JT extends SourceInstance>(type: 'OUTER', source: Source<JN, JT>, on: ExprProvider<AppendObjects<PartialChildren<T>, Record<JN, Partial<JT>>>, S, ExprInput<boolean>>): QuerySelect<AppendObjects<PartialChildren<T>, Record<JN, Partial<JT>>>, S>
  public join<JN extends Name, JT extends SourceInstance>(type: JoinType, source: Source<JN, JT>, on: ExprProvider<AppendObjects<T, Record<JN, JT>>, S, ExprInput<boolean>>): QuerySelect<AppendObjects<T, Record<JN, JT>>, S>  {
    const onExpr = Expr.parse(this._exprs.provide(on as any));

    this.addSource(new SourceJoin(source, type, onExpr));

    return this as any;
  }

  public joinInner<JN extends Name, JT extends SourceInstance>(source: Source<JN, JT>, on: ExprProvider<AppendObjects<T, Record<JN, JT>>, S, ExprInput<boolean>>): QuerySelect<AppendObjects<T, Record<JN, JT>>, S> {
    return this.join('INNER', source, on);
  }
  public joinLeft<JN extends Name, JT extends SourceInstance>(source: Source<JN, JT>, on: ExprProvider<AppendObjects<T, Record<JN, Partial<JT>>>, S, ExprInput<boolean>>): QuerySelect<AppendObjects<T, Record<JN, Partial<JT>>>, S> {
    return this.join('LEFT', source, on);
  }
  public joinRight<JN extends Name, JT extends SourceInstance>(source: Source<JN, JT>, on: ExprProvider<AppendObjects<PartialChildren<T>, Record<JN, JT>>, S, ExprInput<boolean>>): QuerySelect<AppendObjects<PartialChildren<T>, Record<JN, JT>>, S> {
    return this.join('RIGHT', source, on);
  }
  public joinOuter<JN extends Name, JT extends SourceInstance>(source: Source<JN, JT>, on: ExprProvider<AppendObjects<PartialChildren<T>, Record<JN, Partial<JT>>>, S, ExprInput<boolean>>): QuerySelect<AppendObjects<PartialChildren<T>, Record<JN, Partial<JT>>>, S> {
    return this.join('OUTER', source, on);
  }

  public select<FS extends Select<any, any>[]>(selects: ExprProvider<T, S, FS>): QuerySelect<T, AppendTuples<S, ArrayToTuple<FS>>>
  public select<FS extends Select<any, any>[]>(...selects: FS): QuerySelect<T, AppendTuples<S, FS>>
  public select<FS extends Select<any, any>[]>(...selectInput: any[]): QuerySelect<T, AppendTuples<S, FS>> {
    const selects: Select<any, any>[] = isFunction(selectInput[0])
      ? this._exprs.provide(selectInput[0])
      : isArray(selectInput[0])
        ? selectInput[0]
        : selectInput;

    selects.forEach((select) => {
      this.addSelect(select);
    });

    return this as any;
  }

  public with<R extends QuerySelect<T, any>>(context: (query: this, selects: SourcesFieldsFactory<T>, exprs: ExprFactory<T, S>, fns: FunctionProxy) => R): R {
    return context(this, this._sourcesFields, this._exprs, fns);
  }

  public clearSelect(): QuerySelect<Sources, []> {
    (this._selects as any) = [];
    
    return this as any;
  }

  public where(conditions: ExprProvider<T, S, Expr<boolean> | Expr<boolean>[]>): this {
    const resolved = this._exprs.provide(conditions);
    const values = isArray(resolved)
      ? resolved
      : [ resolved ];

    this._where.push(...values);

    return this;
  }

  public clearWhere(): this {
    this._where = [];

    return this;
  }

  public groupBy(value: Expr<any>): this
  public groupBy<K extends SelectsKeys<S>>(value: K): this
  public groupBy<K extends SelectsKeys<S>>(value: K | Expr<any>): this {
    this._groupBy.push(isString(value)
      ? this._selectsExpr[value as any]
      : value
    );

    return this;
  }

  public clearGroupBy(): this {
    this._groupBy = [];

    return this;
  }

  public having(condition: ExprProvider<T, S, Expr<boolean>>): this {
    this._having = this._exprs.provide(condition);

    return this;
  }

  public orderBy<K extends SelectsKeys<S>>(select: K, order?: OrderDirection, nullsLast?: boolean): this
  public orderBy(values: ExprProvider<T, S, Expr<any> | Expr<any>[]>, order?: OrderDirection, nullsLast?: boolean): this
  public orderBy<K extends SelectsKeys<S>>(values: K | ExprProvider<T, S, Expr<any> | Expr<any>[]>, order?: OrderDirection, nullsLast?: boolean): this {
    const resolved = isString(values)
      ? this._selectsExpr[values as any]
      : this._exprs.provide(values);
    const resolvedArray = isArray(resolved)
      ? resolved
      : [ resolved ];

    this._orderBy.push(...resolvedArray.map((value) => new OrderBy(value, order, nullsLast)));

    return this;
  }

  public clearOrderBy(): this {
    this._orderBy = [];

    return this;
  }

  public limit(limit?: number): this {
    this._limit = limit;

    return this;
  }

  public offset(offset?: number): this {
    this._offset = offset;

    return this;    
  }

  public aggregate(type: AggregateType, value?: Expr<any>, distinct: boolean = false): QuerySelectFirstValue<{}, [Select<any, number>], number> {
    return new QuerySelectFirstValue<{}, [Select<any, number>], number>(this as any, new ExprAggregate(type, distinct, value));
  }

  public count(distinct: boolean = false, value?: Expr<any>): QuerySelectFirstValue<{}, [Select<any, number>], number> {
    return this.aggregate('COUNT', value, distinct);
  }

  public countIf(condition: Expr<boolean>): QuerySelectFirstValue<{}, [Select<any, number>], number> {
    return this.aggregate('COUNT', this._exprs.inspect().when<1 | null>(condition, 1).else(null), false);
  }

  public sum(value: Expr<number>): QuerySelectFirstValue<{}, [Select<any, number>], number> {
    return this.aggregate('SUM', value);
  }

  public avg(value: Expr<number>): QuerySelectFirstValue<{}, [Select<any, number>], number> {
    return this.aggregate('AVG', value);
  }

  public min(value: Expr<number>): QuerySelectFirstValue<{}, [Select<any, number>], number> {
    return this.aggregate('MIN', value);
  }

  public max(value: Expr<number>): QuerySelectFirstValue<{}, [Select<any, number>], number> {
    return this.aggregate('MAX', value);
  }

  public first(): QuerySelectFirst<T, S> {
    return new QuerySelectFirst<T, S>(this);
  }

  public row(): QuerySelectFirstRow<T, S> {
    return new QuerySelectFirstRow<T, S>(this);
  }

  public exists(): QuerySelectExistential<T, S> {
    return new QuerySelectExistential<T, S>(this);
  }

  public list<V extends keyof ObjectFromSelects<S>>(select: V): QuerySelectList<T, S, ObjectFromSelects<S>[V]>
  public list<E>(value: ExprProvider<T, S, Expr<E>>): QuerySelectList<T, S, ExprType<E>>
  public list(value: any): Expr<any> {
    return new QuerySelectList(this, isString(value) 
      ? this._selectsExpr[value]
      : this._exprs.provide(value)
    );
  }

  public value<V extends keyof ObjectFromSelects<S>>(select: V): QuerySelectFirstValue<T, S, ObjectFromSelects<S>[V]>
  public value<E>(value: ExprProvider<T, S, Expr<E>>): QuerySelectFirstValue<T, S, E>
  public value(value: any): Expr<any> {
    return new QuerySelectFirstValue(this, isString(value)
      ? this._selectsExpr[value]
      : this._exprs.provide(value)
    );
  }

  public union<Q extends QuerySetQuery<S>>(query: Q, all: boolean = false) {
    return QuerySet.create('UNION', this, query, all);
  }

  public unionAll<Q extends QuerySetQuery<S>>(query: Q) {
    return QuerySet.create('UNION', this, query, true);
  }

  public intersect<Q extends QuerySetQuery<S>>(query: Q, all: boolean = false) {
    return QuerySet.create('INTERSECT', this, query, all);
  }

  public intersectAll<Q extends QuerySetQuery<S>>(query: Q) {
    return QuerySet.create('UNION', this, query, true);
  }

  public except<Q extends QuerySetQuery<S>>(query: Q, all: boolean = false) {
    return QuerySet.create('EXCEPT', this, query, all);
  }

  public exceptAll<Q extends QuerySetQuery<S>>(query: Q) {
    return QuerySet.create('EXCEPT', this, query, true);
  }

}
