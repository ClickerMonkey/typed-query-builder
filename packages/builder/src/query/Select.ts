import { isArray, isFunction, isString } from '../fns';
import { SourcesFieldsFactory, JoinType, Selects, Sources, Name, OrderDirection, MergeObjects, SelectsKeys, LockType, SelectWithKey, Simplify, SelectValueWithKey, SelectsKey, SelectsKeyWithType, JoinedInner, JoinedRight, JoinedLeft, JoinedFull, SelectAllSelects, SelectGivenSelects, MaybeSources, MaybeSelects, AggregateFunctions, Tuple, SourceCompatible } from '../types';
import { ExprAggregate } from '../exprs/Aggregate';
import { ExprProvider, ExprFactory } from '../exprs/Factory';
import { Expr, ExprType } from '../exprs/Expr';
import { QuerySelectExistential } from './Existential';
import { QuerySelectFirst } from './First';
import { QuerySelectFirstValue } from './FirstValue';
import { QuerySelectList } from './List';
import { Source } from '../sources/Source';
import { SourceJoin } from '../sources/Join';
import { OrderBy } from '../Order';
import { Select } from '../select/Select';
import { fns, FunctionArgumentInputs, FunctionProxy, FunctionResult, Functions } from '../Functions';
import { QueryCriteria } from './Criteria';
import { ExprKind } from '../Kind';
import { NamedSource } from '../sources/Named';
import { SourceRecursive } from '../sources/Recursive';
import { ExprInput, ExprScalar } from '../exprs/Scalar';



export class QuerySelect<T extends Sources, S extends Selects> extends Source<S>
{
  
  public static readonly id = ExprKind.QUERY_SELECT;

  public static create<T extends Sources = {}, S extends Selects = []>(): QuerySelect<T, S> {
    return new QuerySelect<T, S>();
  }

  public _lock: LockType;
  public _criteria: QueryCriteria<T, S>;

  public constructor(extend?: QuerySelect<T, S>) {
    super();

    this._criteria = new QueryCriteria(extend?._criteria);
    this._lock = 'none';
  }

  public getKind(): ExprKind {
    return ExprKind.QUERY_SELECT;
  }

  public getSelects(): S {
    return this._criteria.selects;
  }

  public extend(): QuerySelect<T, S> {
    return new QuerySelect( this );
  }

  public with<WN extends Name, WS extends Selects>(sourceProvider: ExprProvider<T, S, NamedSource<WN, WS>>, recursive?: ExprProvider<JoinedInner<T, WN, WS>, S, Source<WS>>, all?: boolean): QuerySelect<JoinedInner<T, WN, WS>, S> {
    const source = this._criteria.exprs.provide(sourceProvider);

    this._criteria.addSource(source as any);

    if (recursive) {
      const recursiveSource = this._criteria.exprs.provide(recursive as any);

      this._criteria.addSource(new SourceRecursive(source.getName(), source.getSource(), recursiveSource, all) as any);
    }

    return this as any;
  }

  public from<FN extends keyof T>(source: FN): QuerySelect<T, S>
  public from<FN extends Name, FS extends Selects>(source: ExprProvider<T, S, NamedSource<FN, FS>>): QuerySelect<Simplify<MergeObjects<T, Record<FN, FS>>>, S> 
  public from<FN extends Name, FS extends Selects>(source: keyof T | ExprProvider<T, S, NamedSource<FN, FS>>): never {
    
    if (!isString(source)) {
      this._criteria.addSource(this._criteria.exprs.provide(source) as any);
    }

    return this as never;
  }

  public join<JN extends Name, JT extends Selects>(type: 'INNER', source: NamedSource<JN, JT>, on: ExprProvider<JoinedInner<T, JN, JT>, S, ExprInput<boolean>>): QuerySelect<JoinedInner<T, JN, JT>, S>
  public join<JN extends Name, JT extends Selects>(type: 'LEFT', source: NamedSource<JN, JT>, on: ExprProvider<JoinedInner<T, JN, JT>, S, ExprInput<boolean>>): QuerySelect<JoinedLeft<T, JN, JT>, S>
  public join<JN extends Name, JT extends Selects>(type: 'RIGHT', source: NamedSource<JN, JT>, on: ExprProvider<JoinedInner<T, JN, JT>, S, ExprInput<boolean>>): QuerySelect<JoinedRight<T, JN, JT>, S>
  public join<JN extends Name, JT extends Selects>(type: 'FULL', source: NamedSource<JN, JT>, on: ExprProvider<JoinedInner<T, JN, JT>, S, ExprInput<boolean>>): QuerySelect<JoinedFull<T, JN, JT>, S>
  public join<JN extends Name, JT extends Selects>(type: JoinType, source: NamedSource<JN, JT>, on: any): never  {
    const onExpr = ExprScalar.parse(this._criteria.exprs.provide(on as any));

    this._criteria.addSource(new SourceJoin(source as any, type, onExpr));

    return this as never;
  }

  public joinInner<JN extends Name, JT extends Selects>(source: NamedSource<JN, JT>, on: ExprProvider<JoinedInner<T, JN, JT>, S, ExprInput<boolean>>): QuerySelect<JoinedInner<T, JN, JT>, S> {
    return this.join('INNER', source, on);
  }
  public joinLeft<JN extends Name, JT extends Selects>(source: NamedSource<JN, JT>, on: ExprProvider<JoinedInner<T, JN, JT>, S, ExprInput<boolean>>): QuerySelect<JoinedLeft<T, JN, JT>, S> {
    return this.join('LEFT', source, on);
  }
  public joinRight<JN extends Name, JT extends Selects>(source: NamedSource<JN, JT>, on: ExprProvider<JoinedInner<T, JN, JT>, S, ExprInput<boolean>>): QuerySelect<JoinedRight<T, JN, JT>, S> {
    return this.join('RIGHT', source, on);
  }
  public joinOuter<JN extends Name, JT extends Selects>(source: NamedSource<JN, JT>, on: ExprProvider<JoinedInner<T, JN, JT>, S, ExprInput<boolean>>): QuerySelect<JoinedFull<T, JN, JT>, S> {
    return this.join('FULL', source, on);
  }


  public select(selects: '*'): QuerySelect<T, SelectAllSelects<T, S>>
  public select<FS extends Tuple<Select<any, any>>>(selects: ExprProvider<T, S, FS>): QuerySelect<T, SelectGivenSelects<S, FS>>
  public select<FS extends Tuple<Select<any, any>>>(...selects: FS): QuerySelect<T, SelectGivenSelects<S, FS>>
  public select(...selectInput: any[]): never {
    const selects: Select<any, any>[] = isFunction(selectInput[0])
      ? this._criteria.exprs.provide(selectInput[0])
      : isArray(selectInput[0])
        ? selectInput[0]
        : selectInput;

    this._criteria.addSelects(selects);

    return this as never;
  }

  public clearSelect(): QuerySelect<Sources, []> {
    this._criteria.clearSelects();
    
    return this as any;
  }

  public where(conditions: ExprProvider<T, S, ExprScalar<boolean> | ExprScalar<boolean>[]>): this {
    const resolved = this._criteria.exprs.provide(conditions);
    const values = isArray(resolved)
      ? resolved
      : [ resolved ];

    this._criteria.where.push(...values);

    return this;
  }

  public clearWhere(): this {
    this._criteria.where = [];

    return this;
  }

  public groupBy(value: Expr<any>): this
  public groupBy<K extends SelectsKeys<S>>(value: K): this
  public groupBy<K extends SelectsKeys<S>>(value: K | ExprScalar<any>): this {
    this._criteria.groupBy.push(isString(value)
      ? this._criteria.selectsExpr[value as any]
      : value
    );

    return this;
  }

  public clearGroupBy(): this {
    this._criteria.groupBy = [];

    return this;
  }

  public having(condition: ExprProvider<T, S, ExprScalar<boolean>>): this {
    this._criteria.having = this._criteria.exprs.provide(condition);

    return this;
  }

  public orderBy<K extends SelectsKeys<S>>(select: K, order?: OrderDirection, nullsLast?: boolean): this
  public orderBy(values: ExprProvider<T, S, ExprScalar<any> | ExprScalar<any>[]>, order?: OrderDirection, nullsLast?: boolean): this
  public orderBy<K extends SelectsKeys<S>>(values: K | ExprProvider<T, S, ExprScalar<any> | ExprScalar<any>[]>, order?: OrderDirection, nullsLast?: boolean): this {
    const resolved = isString(values)
      ? this._criteria.selectsExpr[values as any]
      : this._criteria.exprs.provide(values);
    const resolvedArray = isArray(resolved)
      ? resolved
      : [ resolved ];

    this._criteria.orderBy.push(...resolvedArray.map((value) => new OrderBy(value, order, nullsLast)));

    return this;
  }

  public clearOrderBy(): this {
    this._criteria.orderBy = [];

    return this;
  }

  public limit(limit?: number): this {
    this._criteria.limit = limit;

    return this;
  }

  public offset(offset?: number): this {
    this._criteria.offset = offset;

    return this;    
  }

  public lock(type: LockType): this {
    this._lock = type;

    return this;
  }

  public using<R>(context: (query: this, selects: SourcesFieldsFactory<T>, exprs: ExprFactory<T, S>, fns: FunctionProxy<Functions>) => R): R {
    return context(this, this._criteria.sourcesFields, this._criteria.exprs, fns);
  }

  public maybe<MT extends Sources = {}, MS extends Selects = []>(condition: any, maybeQuery: (query: this) => QuerySelect<MT, MS>): QuerySelect<MaybeSources<T, MT>, MaybeSelects<S, MS>> {
    return (condition ? maybeQuery(this) : this) as any;
  }

  public aggregate<A extends keyof Aggs, V extends SelectsKey<S>, Aggs = AggregateFunctions>(type: A, values: V | ExprProvider<T, S, FunctionArgumentInputs<A, Aggs>>, distinct?: boolean, filter?: ExprProvider<T, S, ExprScalar<boolean>>, orderBy?: OrderBy[]): ExprScalar<FunctionResult<A, Aggs>> {
    return new QuerySelectFirstValue(this._criteria.extend(), 
      new ExprAggregate<A, Aggs>(type,
        isString(values)
          ? this._criteria.selectsExpr[values as any]
          : this._criteria.exprs.provide(values),
        distinct,
        this._criteria.exprs.provide(filter),
        orderBy
      ).as(String(type))
    );
  }

  public count(): ExprScalar<number>
  public count<V extends SelectsKey<S>>(distinct: boolean, select: V): ExprScalar<number>
  public count(distinct: boolean, value: ExprProvider<T, S, ExprScalar<any>>): ExprScalar<number>
  public count(distinct: boolean, value?: ExprProvider<T, S, ExprScalar<any>>): ExprScalar<number>
  public count(distinct: boolean = false, value?: ExprProvider<T, S, ExprScalar<any>>): ExprScalar<number> {
    return this.aggregate('count', [value], distinct);
  }

  public countIf<V extends SelectsKeyWithType<S, boolean>>(select: V): ExprScalar<number>
  public countIf(value: ExprProvider<T, S, ExprScalar<boolean>>): ExprScalar<number>
  public countIf(condition: ExprScalar<boolean>): ExprScalar<number> {
    return this.aggregate('countIf', [condition], false);
  }

  public sum<V extends SelectsKeyWithType<S, number>>(select: V): ExprScalar<number>
  public sum(value: ExprProvider<T, S, ExprScalar<number>>): ExprScalar<number>
  public sum(value: ExprScalar<number>): ExprScalar<number> {
    return this.aggregate('sum', [value]);
  }

  public avg<V extends SelectsKeyWithType<S, number>>(select: V): ExprScalar<number>
  public avg(value: ExprProvider<T, S, ExprScalar<number>>): ExprScalar<number>
  public avg(value: ExprScalar<number>): ExprScalar<number> {
    return this.aggregate('avg', [value]);
  }

  public min<V extends SelectsKey<S>>(select: V): ExprScalar<SelectValueWithKey<S, V>>
  public min<V>(value: ExprProvider<T, S, ExprScalar<V>>): ExprScalar<V>
  public min(value: ExprScalar<any>): ExprScalar<any> {
    return this.aggregate('min', [value]);
  }

  public max<V extends SelectsKey<S>>(select: V): ExprScalar<SelectValueWithKey<S, V>>
  public max<V>(value: ExprProvider<T, S, ExprScalar<V>>): ExprScalar<V>
  public max(value: ExprScalar<any>): ExprScalar<any> {
    return this.aggregate('max', [value]);
  }

  public first(): Expr<S> {
    return new QuerySelectFirst<T, S>(this._criteria.extend());
  }

  public exists(): ExprScalar<1 | null> {
    return new QuerySelectExistential<T, S>(this._criteria.extend());
  }

  public list<V extends SelectsKey<S>>(select: V): QuerySelectList<T, S, SelectWithKey<S, V>>
  public list<E>(value: ExprProvider<T, S, Expr<E>>): QuerySelectList<T, S, ExprType<E>>
  public list<V extends SelectsKey<S>, E>(value: V | ExprProvider<T, S, Expr<E>>): Expr<any> {
    return new QuerySelectList(this._criteria.extend(), isString(value) 
      ? this._criteria.selectsExpr[value as any]
      : this._criteria.exprs.provide(value)
    );
  }

  public value<V extends SelectsKey<S>>(select: V): ExprScalar<SelectValueWithKey<S, V>>
  public value<E>(value: ExprProvider<T, S, ExprScalar<E>>): ExprScalar<E>
  public value<V extends SelectsKey<S>, E>(value: V | ExprProvider<T, S, ExprScalar<E>>): ExprScalar<any> {
    return new QuerySelectFirstValue(this._criteria.extend(), isString(value)
      ? this._criteria.selectsExpr[value as any]
      : this._criteria.exprs.provide(value)
    );
  }

  public generic(): SourceCompatible<S> {
    return this as any;
  }

  public hasSelect(name: any): name is SelectsKeys<S> {
    return Boolean(this._criteria.selectsExpr[name as any]);
  }

  public hasSource(name: any): name is keyof T {
    return Boolean(this._criteria.sources[name]);
  }

}
