import { 
  SourceKind, isArray, isString, OrderDirection, Selects, SelectsKeys, SetOperation, SourceCompatible, Expr, ExprField, 
  ExprProvider, OrderBy, Source, ExprKind, QueryCriteria 
} from '../internal';


export class QuerySet<S extends Selects> extends Source<S>
{
  
  public static readonly id = ExprKind.QUERY_SET_OPERATION;
  
  public static create<S extends Selects>(
    op: SetOperation,
    first: Source<S>,
    second: SourceCompatible<S>,
    all: boolean = false
  ) {
    return new QuerySet<S>(op, first, second, all);
  } 


  public _criteria: QueryCriteria<{ set: S }, S, any>;
  public _sources: SourceCompatible<S>[];
  public _all: boolean[];

  public constructor(
    public _op: SetOperation,
    public _first: Source<S>,
    second: SourceCompatible<S>,
    all: boolean = false
  ) {
    super();

    const set = _first.as('set');

    this._sources = [_first as any, second];
    this._all = [all];
    this._criteria = new QueryCriteria();
    this._criteria.addSelects(_first.getSelects().map( s => new ExprField(set as any, s.alias )));
    this._criteria.addSource(set as any, SourceKind.TARGET);
  }

  public getKind(): ExprKind {
    return ExprKind.QUERY_SET_OPERATION;
  }

  public getSelects(): S {
    return this._first.getSelects();
  }

  public addSet(op: SetOperation, source: SourceCompatible<S>, all: boolean = false): QuerySet<S>
  {
    if (op === this._op) {
      this._sources.push(source);
      this._all.push(all);

      return this;
    } else {
      return QuerySet.create<S>(op, this, source, all);
    }
  }

  public union<Q extends SourceCompatible<S>>(query: Q, all: boolean = false) {
    return this.addSet('UNION', query, all);
  }

  public unionAll(query: SourceCompatible<S>) {
    return this.addSet('UNION', query, true);
  }

  public intersect(query: SourceCompatible<S>, all: boolean = false) {
    return this.addSet('INTERSECT', query, all);
  }

  public intersectAll(query: SourceCompatible<S>) {
    return this.addSet('INTERSECT', query, true);
  }

  public except(query: SourceCompatible<S>, all: boolean = false) {
    return this.addSet('EXCEPT', query, all);
  }

  public exceptAll(query: SourceCompatible<S>) {
    return this.addSet('EXCEPT', query, true);
  }

  public orderBy<K extends SelectsKeys<S>>(select: K, order?: OrderDirection, nullsLast?: boolean): this
  public orderBy(values: ExprProvider<{ set: S }, S, never, Expr<any> | Expr<any>[]>, order?: OrderDirection, nullsLast?: boolean): this
  public orderBy<K extends SelectsKeys<S>>(values: K | ExprProvider<{ set: S }, S, never, Expr<any> | Expr<any>[]>, order?: OrderDirection, nullsLast?: boolean): this {
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

}