import { 
  QueryWindow, SelectsExprs, QuerySelectScalarProvider, QuerySelectScalarInput, SourceKind, isArray, isFunction, isString, 
  SourcesFieldsFactory, JoinType, Selects, Sources, Name, OrderDirection, MergeObjects, Lock, SelectWithKey, Simplify, 
  SelectValueWithKey, SelectsKey, SelectsKeyWithType, JoinedInner, JoinedRight, JoinedLeft, JoinedFull, SelectAllSelects, 
  SelectGivenSelects, MaybeSources, MaybeSelects, AggregateFunctions, Tuple, SourceCompatible, ExprAggregate, ExprProvider, 
  ExprFactory, Expr, ExprType, QueryExistential, QueryFirst, QueryFirstValue, QueryList, Source, SourceTable, SourceVirtual,
  SourceJoin, OrderBy, Select, FunctionArgumentInputs, FunctionProxy, FunctionResult, Functions, QueryCriteria, ExprKind, 
  NamedSource, SourceRecursive, ExprInput, ExprScalar, fns, QueryGroup, toExpr, GroupingSetType, LockRowLock, LockStrength,
  WithProvider, _Boolean, _BigInt, _Numbers, _Floats, isName, SourceKindPair
} from '../internal';


export class QuerySelect<T extends Sources, S extends Selects, W extends Name> extends Source<S>
{
  
  public static readonly id = ExprKind.QUERY_SELECT;

  
  public _locks: Lock[];
  public _distinct: boolean;
  public _distinctOn: ExprScalar<any>[];
  public _criteria: QueryCriteria<T, S, W>;

  public constructor(extend?: QuerySelect<T, S, W>) 
  {
    super();

    this._criteria = new QueryCriteria(extend?._criteria);
    this._locks = extend ? extend._locks.slice() : [];
    this._distinct = extend?._distinct || false;
    this._distinctOn = extend?._distinctOn?.slice() || [];
  }

  public getKind(): ExprKind 
  {
    return ExprKind.QUERY_SELECT;
  }

  public isStatement(): boolean 
  {
    return true;
  }

  public getSelects(): S 
  {
    return this._criteria.selects;
  }

  public extend(): QuerySelect<T, S, W> 
  {
    return new QuerySelect( this );
  }

  public with<WN extends Name, WS extends Selects>(sourceProvider: WithProvider<T, NamedSource<WN, WS>>, recursive?: WithProvider<JoinedInner<T, WN, WS>, Source<WS>>, all?: boolean): QuerySelect<JoinedInner<T, WN, WS>, S, W>
  {
    const source = isFunction(sourceProvider)
      ? sourceProvider(this._criteria.sourceMap)
      : sourceProvider;
    
    this._criteria.addSource(new SourceVirtual(source) as any, SourceKind.WITH);

    if (recursive)
    {
      const recursiveSource = isFunction(recursive)
        ? recursive(this._criteria.sourceMap as any)
        : recursive;

      this._criteria.replaceSource(new SourceRecursive(source.getName(), source.getSource(), recursiveSource, all) as any, SourceKind.WITH);
    }

    return this as any;
  }

  public from<FN extends keyof T>(source: FN, only?: boolean): QuerySelect<T, S, W>
  public from<FN extends Name, FS extends Selects>(source: ExprProvider<T, S, W, NamedSource<FN, FS>>, only?: boolean): QuerySelect<Simplify<MergeObjects<T, Record<FN, FS>>>, S, W> 
  public from<FN extends Name, FS extends Selects>(source: keyof T | ExprProvider<T, S, W, NamedSource<FN, FS>>, only: boolean = false): never 
  {  
    if (!isString(source)) 
    {
      this._criteria.addSource(this._criteria.exprs.provide(source) as any, only ? SourceKind.ONLY : SourceKind.FROM);
    }
    else
    {
      const sourceNamed = this._criteria.sources.find( s => s.source.getName() === source );

      if (!sourceNamed)
      {
        throw new Error(`A source with the name ${source} does not exist.`);
      }

      this._criteria.addSource(new SourceVirtual(sourceNamed.source), only ? SourceKind.ONLY : SourceKind.FROM);
    }

    return this as never;
  }

  public join<JN extends keyof T, JT extends Selects>(type: 'INNER', source: T, on?: ExprProvider<JoinedInner<T, JN, JT>, S, W, ExprInput<_Boolean>>): QuerySelect<JoinedInner<T, JN, JT>, S, W>
  public join<JN extends keyof T, JT extends Selects>(type: 'LEFT', source: T, on?: ExprProvider<JoinedInner<T, JN, JT>, S, W, ExprInput<_Boolean>>): QuerySelect<JoinedLeft<T, JN, JT>, S, W>
  public join<JN extends keyof T, JT extends Selects>(type: 'RIGHT', source: T, on?: ExprProvider<JoinedInner<T, JN, JT>, S, W, ExprInput<_Boolean>>): QuerySelect<JoinedRight<T, JN, JT>, S, W>
  public join<JN extends keyof T, JT extends Selects>(type: 'FULL', source: T, on?: ExprProvider<JoinedInner<T, JN, JT>, S, W, ExprInput<_Boolean>>): QuerySelect<JoinedFull<T, JN, JT>, S, W>
  public join<JN extends Name, JT extends Selects>(type: 'INNER', source: ExprProvider<T, S, W, NamedSource<JN, JT>>, on?: ExprProvider<JoinedInner<T, JN, JT>, S, W, ExprInput<_Boolean>>): QuerySelect<JoinedInner<T, JN, JT>, S, W>
  public join<JN extends Name, JT extends Selects>(type: 'LEFT', source: ExprProvider<T, S, W, NamedSource<JN, JT>>, on?: ExprProvider<JoinedInner<T, JN, JT>, S, W, ExprInput<_Boolean>>): QuerySelect<JoinedLeft<T, JN, JT>, S, W>
  public join<JN extends Name, JT extends Selects>(type: 'RIGHT', source: ExprProvider<T, S, W, NamedSource<JN, JT>>, on?: ExprProvider<JoinedInner<T, JN, JT>, S, W, ExprInput<_Boolean>>): QuerySelect<JoinedRight<T, JN, JT>, S, W>
  public join<JN extends Name, JT extends Selects>(type: 'FULL', source: ExprProvider<T, S, W, NamedSource<JN, JT>>, on?: ExprProvider<JoinedInner<T, JN, JT>, S, W, ExprInput<_Boolean>>): QuerySelect<JoinedFull<T, JN, JT>, S, W>
  public join<JN extends Name | keyof T, JT extends Selects>(type: JoinType, source: ExprProvider<T, S, W, NamedSource<JN, JT>> | JN, on?: any): never
  {
    let lateral = false;
    let joinSource: NamedSource<JN, JT>;

    if (isFunction(source))
    {
      joinSource = this._criteria.exprs.provide(source);
      lateral = true;
    }
    else if (isName<JN>(source))
    {
      const sourceNamed = this._criteria.sources.find( s => s.source.getName() === source ) as SourceKindPair<JN, JT> | undefined;

      if (!sourceNamed)
      {
        throw new Error(`A source with the name ${source} does not exist.`);
      }

      joinSource = new SourceVirtual<JN, JT>(sourceNamed.source);
    }
    else
    {
      joinSource = source;
    }

    const join = new SourceJoin(joinSource, type, toExpr(true), lateral);

    this._criteria.addSource(join as any, SourceKind.JOIN);

    if (on)
    {
      join.condition = toExpr(this._criteria.exprs.provide(on as any));
    }

    return this as never;
  }

  public joinInner<JN extends keyof T, JT extends Selects>(source: JN, on?: ExprProvider<JoinedInner<T, JN, JT>, S, W, ExprInput<_Boolean>>): QuerySelect<JoinedInner<T, JN, JT>, S, W>
  public joinInner<JN extends Name, JT extends Selects>(source: ExprProvider<T, S, W, NamedSource<JN, JT>>, on?: ExprProvider<JoinedInner<T, JN, JT>, S, W, ExprInput<_Boolean>>): QuerySelect<JoinedInner<T, JN, JT>, S, W>
  public joinInner<JN extends Name | keyof T, JT extends Selects>(source: ExprProvider<T, S, W, NamedSource<JN, JT>> | JN, on?: ExprProvider<JoinedInner<T, JN, JT>, S, W, ExprInput<_Boolean>>): QuerySelect<JoinedInner<T, JN, JT>, S, W>
  {
    return this.join('INNER', source as any, on);
  }

  public joinLeft<JN extends keyof T, JT extends Selects>(source: JN, on?: ExprProvider<JoinedInner<T, JN, JT>, S, W, ExprInput<_Boolean>>): QuerySelect<JoinedLeft<T, JN, JT>, S, W> 
  public joinLeft<JN extends Name, JT extends Selects>(source: ExprProvider<T, S, W, NamedSource<JN, JT>>, on?: ExprProvider<JoinedInner<T, JN, JT>, S, W, ExprInput<_Boolean>>): QuerySelect<JoinedLeft<T, JN, JT>, S, W> 
  public joinLeft<JN extends Name | keyof T, JT extends Selects>(source: ExprProvider<T, S, W, NamedSource<JN, JT>> | JN, on?: ExprProvider<JoinedInner<T, JN, JT>, S, W, ExprInput<_Boolean>>): QuerySelect<JoinedLeft<T, JN, JT>, S, W> 
  {
    return this.join('LEFT', source as any, on);
  }

  public joinRight<JN extends keyof T, JT extends Selects>(source: JN, on?: ExprProvider<JoinedInner<T, JN, JT>, S, W, ExprInput<_Boolean>>): QuerySelect<JoinedRight<T, JN, JT>, S, W> 
  public joinRight<JN extends Name, JT extends Selects>(source: ExprProvider<T, S, W, NamedSource<JN, JT>>, on?: ExprProvider<JoinedInner<T, JN, JT>, S, W, ExprInput<_Boolean>>): QuerySelect<JoinedRight<T, JN, JT>, S, W> 
  public joinRight<JN extends Name | keyof T, JT extends Selects>(source: ExprProvider<T, S, W, NamedSource<JN, JT>> | JN, on?: ExprProvider<JoinedInner<T, JN, JT>, S, W, ExprInput<_Boolean>>): QuerySelect<JoinedRight<T, JN, JT>, S, W> 
  {
    return this.join('RIGHT', source as any, on);
  }

  public joinFull<JN extends keyof T, JT extends Selects>(source: JN, on?: ExprProvider<JoinedInner<T, JN, JT>, S, W, ExprInput<_Boolean>>): QuerySelect<JoinedFull<T, JN, JT>, S, W> 
  public joinFull<JN extends Name, JT extends Selects>(source: ExprProvider<T, S, W, NamedSource<JN, JT>>, on?: ExprProvider<JoinedInner<T, JN, JT>, S, W, ExprInput<_Boolean>>): QuerySelect<JoinedFull<T, JN, JT>, S, W> 
  public joinFull<JN extends Name | keyof T, JT extends Selects>(source: ExprProvider<T, S, W, NamedSource<JN, JT>> | JN, on?: ExprProvider<JoinedInner<T, JN, JT>, S, W, ExprInput<_Boolean>>): QuerySelect<JoinedFull<T, JN, JT>, S, W> 
  {
    return this.join('FULL', source as any, on);
  }

  public window<WA extends Name>(name: WA, defined: (window: QueryWindow<WA, T, S, W>, sources: SourcesFieldsFactory<T>, exprs: ExprFactory<T, S, W>, fns: FunctionProxy<Functions>, selects: SelectsExprs<S>) => QueryWindow<WA, T, S, W>): QuerySelect<T, S, WA | W> 
  {
    this._criteria.addWindow(name, defined);

    return this as any;
  }

  public clearWindows(): QuerySelect<T, S, never> 
  {
    this._criteria.clearWindows();

    return this as any;
  }

  public distinct(): this 
  {
    this._distinct = true;
    this._distinctOn = [];

    return this;
  }

  public distinctOn(...values: QuerySelectScalarInput<T, S, W, any>): this 
  {
    const exprs = this._criteria.exprs.parse(values);
    
    for (const expr of exprs) {
      this._distinctOn.push(expr);
    }

    return this;
  }

  public select(selects: '*'): QuerySelect<T, SelectAllSelects<T, S>, W>
  public select<FS extends Tuple<Select<any, any>>>(selects: ExprProvider<T, S, W, FS>): QuerySelect<T, SelectGivenSelects<S, FS>, W>
  public select<FS extends Tuple<Select<any, any>>>(...selects: FS): QuerySelect<T, SelectGivenSelects<S, FS>, W>
  public select(...selectInput: any[]): never 
  {
    const selects: Select<any, any>[] = isFunction(selectInput[0])
      ? this._criteria.exprs.provide(selectInput[0])
      : isArray(selectInput[0])
        ? selectInput[0]
        : selectInput[0] === '*'
          ? this.selectAll()
          : selectInput;

    this._criteria.addSelects(selects);

    return this as never;
  }

  protected selectAll(): Selects 
  {
    const all: Selects = [];

    for (const source of this._criteria.sources) 
    {
      if (source.kind !== SourceKind.WITH)
      {
        all.push(...source.source.getSelects());
      }
    }

    return all;
  }

  public clearSelect(): QuerySelect<T, [], W> 
  {
    this._criteria.clearSelects();
    
    return this as any;
  }

  public where(...values: QuerySelectScalarInput<T, S, W, _Boolean>): this 
  {
    const exprs = this._criteria.exprs.parse(values);

    for (const expr of exprs)
    {
      this._criteria.where.push(expr);
    }

    return this;
  }

  public clearWhere(): this
  {
    this._criteria.where = [];

    return this;
  }

  public groupBy<K extends SelectsKey<S>>(...values: K[] | [K[]]): this
  {
    const exprs = isArray(values[0]) ? values[0] : values as K[];

    return this.group('BY', [exprs]);
  }

  public groupBySet<K extends SelectsKey<S>>(values: K[][]): this 
  {
    return this.group('GROUPING SET', values);
  }

  public groupByRollup<K extends SelectsKey<S>>(values: Array<K | K[]>): this 
  {
    const valuesGrouped = values.map( v => isArray(v) ? v : [v] );

    return this.group('ROLLUP', valuesGrouped);
  }

  public groupByCube<K extends SelectsKey<S>>(values: Array<K | K[]>): this 
  {
    const valuesGrouped = values.map( v => isArray(v) ? v : [v] );

    return this.group('CUBE', valuesGrouped);
  }

  public group<K extends SelectsKey<S>>(type: GroupingSetType, values: K[][]): this 
  {
    this._criteria.group.push(new QueryGroup<K>(type, values));

    return this;
  }

  public clearGroup(): this 
  {
    this._criteria.group = [];

    return this;
  }

  public having(condition: ExprProvider<T, S, W, ExprScalar<_Boolean>>): this 
  {
    this._criteria.having = this._criteria.exprs.provide(condition);

    return this;
  }

  public orderBy(values: QuerySelectScalarProvider<T, S, W, any>, order?: OrderDirection, nullsLast?: boolean): this 
  {
    const exprs = this._criteria.exprs.parse([values]);

    for (const expr of exprs) {
      this._criteria.orderBy.push(new OrderBy(expr, order, nullsLast));
    }

    return this;
  }

  public clearOrderBy(): this 
  {
    this._criteria.orderBy = [];

    return this;
  }

  public limit(limit?: number): this 
  {
    this._criteria.limit = limit;

    return this;
  }

  public offset(offset?: number): this 
  {
    this._criteria.offset = offset;

    return this;    
  }

  public lock(strength: LockStrength, sources: Array<keyof T> = [], rowLock?: LockRowLock): this 
  {
    const chosen = this._criteria.sources
      .map( (pair) => pair.source )
      .filter( (source) => source instanceof SourceTable )
      .filter( (source) => sources.indexOf( source.getName() ) !== -1 ) as SourceTable<any, any, any>[]
    ;

    if (chosen.length !== sources.length) {
      throw new Error('You can only lock table sources.');
    }

    this._locks.push(new Lock(strength, chosen, rowLock));

    return this;
  }

  public using<R>(context: (query: this, selects: SourcesFieldsFactory<T>, exprs: ExprFactory<T, S, W>, fns: FunctionProxy<Functions>) => R): R 
  {
    return context(this, this._criteria.sourcesFields, this._criteria.exprs, fns);
  }

  public maybe<MT extends Sources = {}, MS extends Selects = [], MW extends Name = never>(condition: any, maybeQuery: (query: this) => QuerySelect<MT, MS, MW>): QuerySelect<MaybeSources<T, MT>, MaybeSelects<S, MS>, MW | W> 
  {
    return (condition ? maybeQuery(this) : this) as any;
  }

  public aggregate<A extends keyof Aggs, V extends SelectsKey<S>, Aggs = AggregateFunctions, R = FunctionResult<A, Aggs>>(type: A, values: V | ExprProvider<T, S, W, FunctionArgumentInputs<A, Aggs>>, distinct?: boolean, filter?: ExprProvider<T, S, W, ExprScalar<_Boolean>>, orderBy?: OrderBy[]): ExprScalar<R> 
  {
    const valuesResolved = this._criteria.exprs.provide(values);
    const valuesTuple = isArray(valuesResolved) ? valuesResolved : [valuesResolved];
    const valuesFiltered = valuesTuple.filter( v => v !== undefined );
    const valuesExprs = valuesFiltered.map( v => isString(v) ? this._criteria.selectsExpr[v] : toExpr(v) );

    return new QueryFirstValue<T, S, W, R>(
      this._criteria.extend(), 
      new ExprAggregate<T, S, W, A, Aggs, R>(
        this._criteria.exprs,
        this._criteria.windows,
        type,
        valuesExprs as any,
        distinct,
        this._criteria.exprs.provide(filter),
        orderBy
      )
    );
  }

  public count(): ExprScalar<_BigInt>
  public count<V extends SelectsKey<S>>(distinct: boolean, select: V): ExprScalar<_BigInt>
  public count(distinct: boolean, value: ExprProvider<T, S, W, ExprScalar<any>>): ExprScalar<_BigInt>
  public count(distinct: boolean, value?: ExprProvider<T, S, W, ExprScalar<any>>): ExprScalar<_BigInt>
  public count(distinct: boolean = false, value?: ExprProvider<T, S, W, ExprScalar<any>>): ExprScalar<_BigInt> 
  {
    return this.aggregate('count', [value], distinct);
  }

  public countIf<V extends SelectsKeyWithType<S, _Boolean>>(select: V): ExprScalar<_BigInt>
  public countIf(value: ExprProvider<T, S, W, ExprScalar<_Boolean>>): ExprScalar<_BigInt>
  public countIf(condition: ExprScalar<_Boolean>): ExprScalar<_BigInt> 
  {
    return this.aggregate('countIf', [condition], false);
  }

  public sum<V extends SelectsKeyWithType<S, _Numbers>>(select: V): ExprScalar<_Floats>
  public sum(value: ExprProvider<T, S, W, ExprScalar<_Numbers>>): ExprScalar<_Floats>
  public sum(value: ExprScalar<number>): ExprScalar<_Floats> 
  {
    return this.aggregate('sum', [value]);
  }

  public avg<V extends SelectsKeyWithType<S, _Numbers>>(select: V): ExprScalar<_Floats>
  public avg(value: ExprProvider<T, S, W, ExprScalar<_Numbers>>): ExprScalar<_Floats>
  public avg(value: ExprScalar<_Numbers>): ExprScalar<_Floats> 
  {
    return this.aggregate('avg', [value]);
  }

  public min<V extends SelectsKey<S>>(select: V): ExprScalar<SelectValueWithKey<S, V>>
  public min<V>(value: ExprProvider<T, S, W, ExprScalar<V>>): ExprScalar<V>
  public min(value: ExprScalar<any>): ExprScalar<any> 
  {
    return this.aggregate('min', [value]);
  }

  public max<V extends SelectsKey<S>>(select: V): ExprScalar<SelectValueWithKey<S, V>>
  public max<V>(value: ExprProvider<T, S, W, ExprScalar<V>>): ExprScalar<V>
  public max(value: ExprScalar<any>): ExprScalar<any> 
  {
    return this.aggregate('max', [value]);
  }

  public first(): QueryFirst<T, S, W> 
  {
    return new QueryFirst<T, S, W>(this._criteria.extend());
  }

  public exists(): ExprScalar<1 | null> 
  {
    return new QueryExistential<T, S, W>(this._criteria.extend());
  }

  public list<V extends SelectsKey<S>>(select: V): QueryList<T, S, W, [SelectWithKey<S, V>]>
  public list<E>(value: ExprProvider<T, S, W, Expr<E>>): QueryList<T, S, W, ExprType<E>>
  public list<V extends SelectsKey<S>, E>(value: V | ExprProvider<T, S, W, Expr<E>>): Expr<any> 
  {
    return new QueryList(
      this._criteria.extend(),
      isString(value)
        ? this._criteria.selectsExpr[value as any]
        : this._criteria.exprs.provide(value)
    );
  }

  public value<V extends SelectsKey<S>, E = never>(select: V, defaultValue?: ExprProvider<T, S, W, ExprInput<E>>): ExprScalar<SelectValueWithKey<S, V> | E>
  public value<E = never>(value: ExprProvider<T, S, W, Expr<E>>, defaultValue?: ExprProvider<T, S, W, ExprInput<E>>): ExprScalar<ExprType<E>>
  public value<V extends SelectsKey<S>, E>(value: V | ExprProvider<T, S, W, ExprScalar<E>>, defaultValue?: ExprProvider<T, S, W, ExprInput<E>>): ExprScalar<any> 
  {
    return new QueryFirstValue<T, S, W, E>(
      this._criteria.extend(),
      isString(value)
        ? this._criteria.selectsExpr[value as any]
        : this._criteria.exprs.provide(value),
      defaultValue
        ? toExpr(this._criteria.exprs.provide(defaultValue))
        : undefined
    );
  }

  public generic(): SourceCompatible<S> 
  {
    return this as any;
  }

  public hasSelect(name: any): name is SelectsKey<S> 
  {
    return Boolean(this._criteria.selectsExpr[name as any]);
  }

  public hasSource(name: any): name is keyof T 
  {
    return Boolean(this._criteria.sources[name]);
  }

}
