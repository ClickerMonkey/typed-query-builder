import { isArray, isFunction, isString } from '../fns';
import { SourcesFieldsFactory, Cast, AggregateType, JoinType, Selects, Sources, Name, OrderDirection, AppendTuples, MergeObjects, SelectsKeys, ArrayToTuple, LockType, SelectWithKey, SourcesSelectsOptional, SelectsOptional, NamedSourcesRecord } from '../Types';
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
import { fns, FunctionProxy } from '../Functions';
import { QueryCriteria } from './Criteria';
import { ExprKind } from '../Kind';
import { NamedSource } from '../sources/Named';
import { SourceRecursive } from '../sources/Recursive';
import { ExprInput, ExprScalar } from '../exprs/Scalar';



type JoinedInner<T extends Sources, JN extends Name, JT extends Selects> = 
  MergeObjects<T, Record<JN, JT>>;

type JoinedLeft<T extends Sources, JN extends Name, JT extends Selects> = 
  MergeObjects<T, Record<JN, SelectsOptional<JT>>>;

type JoinedRight<T extends Sources, JN extends Name, JT extends Selects> = 
  Cast<MergeObjects<SourcesSelectsOptional<T>, Record<JN, JT>>, Sources>;

type JoinedFull<T extends Sources, JN extends Name, JT extends Selects> = 
  Cast<MergeObjects<SourcesSelectsOptional<T>, Record<JN, SelectsOptional<JT>>>, Sources>;


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

  public with<WN extends Name, WS extends Selects>(query: ExprProvider<T, S, NamedSource<WN, WS>>, recursive?: ExprProvider<JoinedInner<T, WN, WS>, S, Source<WS>>, all?: boolean): QuerySelect<JoinedInner<T, WN, WS>, S> {
    const source = this._criteria.exprs.provide(query);

    this._criteria.addSource(source as any);

    if (recursive) {
      const recursiveSource = this._criteria.exprs.provide(recursive as any);

      this._criteria.addSource(new SourceRecursive(source.getName(), source.getSource(), recursiveSource, all) as any);
    }

    return this as any;
  }

  public from<FS extends NamedSource<any, any>[]>(sources: ExprProvider<T, S, FS>): QuerySelect<MergeObjects<T, NamedSourcesRecord<FS>>, S>
  public from<FS extends NamedSource<any, any>[]>(...sources: FS): QuerySelect<MergeObjects<T, NamedSourcesRecord<FS>>, S>
  public from<FS extends NamedSource<any, any>[]>(...sourceInput: any[]): QuerySelect<MergeObjects<T, NamedSourcesRecord<FS>>, S> {
    const sources: NamedSource<any, any>[] = isFunction(sourceInput[0])
      ? this._criteria.exprs.provide(sourceInput[0])
      : isArray(sourceInput[0])
        ? sourceInput[0]
        : sourceInput;

    this._criteria.addSources(sources);

    return this as any;
  }

  public join<JN extends Name, JT extends Selects>(type: 'INNER', source: NamedSource<JN, JT>, on: ExprProvider<JoinedInner<T, JN, JT>, S, ExprInput<boolean>>): QuerySelect<JoinedInner<T, JN, JT>, S>
  public join<JN extends Name, JT extends Selects>(type: 'LEFT', source: NamedSource<JN, JT>, on: ExprProvider<JoinedLeft<T, JN, JT>, S, ExprInput<boolean>>): QuerySelect<JoinedLeft<T, JN, JT>, S>
  public join<JN extends Name, JT extends Selects>(type: 'RIGHT', source: NamedSource<JN, JT>, on: ExprProvider<JoinedRight<T, JN, JT>, S, ExprInput<boolean>>): QuerySelect<JoinedRight<T, JN, JT>, S>
  public join<JN extends Name, JT extends Selects>(type: 'FULL', source: NamedSource<JN, JT>, on: ExprProvider<JoinedFull<T, JN, JT>, S, ExprInput<boolean>>): QuerySelect<JoinedFull<T, JN, JT>, S>
  public join<JN extends Name, JT extends Selects>(type: JoinType, source: NamedSource<JN, JT>, on: any): never  {
    const onExpr = ExprScalar.parse(this._criteria.exprs.provide(on as any));

    this._criteria.addSource(new SourceJoin(source as any, type, onExpr));

    return this as never;
  }

  public joinInner<JN extends Name, JT extends Selects>(source: NamedSource<JN, JT>, on: ExprProvider<JoinedInner<T, JN, JT>, S, ExprInput<boolean>>): QuerySelect<JoinedInner<T, JN, JT>, S> {
    return this.join('INNER', source, on);
  }
  public joinLeft<JN extends Name, JT extends Selects>(source: NamedSource<JN, JT>, on: ExprProvider<JoinedLeft<T, JN, JT>, S, ExprInput<boolean>>): QuerySelect<JoinedLeft<T, JN, JT>, S> {
    return this.join('LEFT', source, on);
  }
  public joinRight<JN extends Name, JT extends Selects>(source: NamedSource<JN, JT>, on: ExprProvider<JoinedRight<T, JN, JT>, S, ExprInput<boolean>>): QuerySelect<JoinedRight<T, JN, JT>, S> {
    return this.join('RIGHT', source, on);
  }
  public joinOuter<JN extends Name, JT extends Selects>(source: NamedSource<JN, JT>, on: ExprProvider<JoinedFull<T, JN, JT>, S, ExprInput<boolean>>): QuerySelect<JoinedFull<T, JN, JT>, S> {
    return this.join('FULL', source, on);
  }

  public select<FS extends Select<any, any>[]>(selects: ExprProvider<T, S, FS>): QuerySelect<T, AppendTuples<S, ArrayToTuple<FS>>>
  public select<FS extends Select<any, any>[]>(...selects: FS): QuerySelect<T, AppendTuples<S, FS>>
  public select<FS extends Select<any, any>[]>(...selectInput: any[]): QuerySelect<T, AppendTuples<S, FS>> {
    const selects: Select<any, any>[] = isFunction(selectInput[0])
      ? this._criteria.exprs.provide(selectInput[0])
      : isArray(selectInput[0])
        ? selectInput[0]
        : selectInput;

    this._criteria.addSelects(selects);

    return this as any;
  }

  public clearSelect(): QuerySelect<Sources, []> {
    this._criteria.clearSelects();
    
    return this as any;
  }

  public using<R extends QuerySelect<T, any>>(context: (query: this, selects: SourcesFieldsFactory<T>, exprs: ExprFactory<T, S>, fns: FunctionProxy) => R): R {
    return context(this, this._criteria.sourcesFields, this._criteria.exprs, fns);
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

  public aggregate<AT extends AggregateType>(type: AT, value?: ExprScalar<any>, distinct: boolean = false): QuerySelectFirstValue<{}, [Select<AT, number>], Select<AT, number>> {
    return new QuerySelectFirstValue(this._criteria.extend(), new ExprAggregate(type, distinct, value).as(type)) as any;
  }

  public count(distinct: boolean = false, value?: ExprScalar<any>) {
    return this.aggregate('COUNT', value, distinct);
  }

  public countIf(condition: ExprScalar<boolean>) {
    return this.aggregate('COUNT', this._criteria.exprs.inspect().when<1 | null>(condition, 1).else(null), false);
  }

  public sum(value: ExprScalar<number>) {
    return this.aggregate('SUM', value);
  }

  public avg(value: ExprScalar<number>) {
    return this.aggregate('AVG', value);
  }

  public min(value: ExprScalar<number>) {
    return this.aggregate('MIN', value);
  }

  public max(value: ExprScalar<number>) {
    return this.aggregate('MAX', value);
  }

  public first(): QuerySelectFirst<T, S> {
    return new QuerySelectFirst<T, S>(this._criteria.extend());
  }

  public exists(): QuerySelectExistential<T, S> {
    return new QuerySelectExistential<T, S>(this._criteria.extend());
  }

  public list<V extends SelectsKeys<S>>(select: V): QuerySelectList<T, S, SelectWithKey<S, V>>
  public list<E>(value: ExprProvider<T, S, Expr<E>>): QuerySelectList<T, S, ExprType<E>>
  public list(value: any): Expr<any> {
    return new QuerySelectList(this._criteria.extend(), isString(value) 
      ? this._criteria.selectsExpr[value]
      : this._criteria.exprs.provide(value)
    );
  }

  public value<V extends SelectsKeys<S>>(select: V): QuerySelectFirstValue<T, S, SelectWithKey<S, V>>
  public value<E>(value: ExprProvider<T, S, Expr<E>>): QuerySelectFirstValue<T, S, E>
  public value(value: any): Expr<any> {
    return new QuerySelectFirstValue(this._criteria.extend(), isString(value)
      ? this._criteria.selectsExpr[value]
      : this._criteria.exprs.provide(value)
    );
  }

}
