import { 
  SourceKind, isArray, OrderDirection, Selects, SelectsKey, SetOperation, SourceCompatible, ExprField, 
  OrderBy, Source, ExprKind, QueryCriteria 
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

  public getKind(): ExprKind
  {
    return ExprKind.QUERY_SET_OPERATION;
  }
  
  public isStatement(): boolean
  {
    return true;
  }

  public getSelects(): S
  {
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

  public union(query: SourceCompatible<S>, all: boolean = false)
  {
    return this.addSet('UNION', query, all);
  }

  public unionAll(query: SourceCompatible<S>)
  {
    return this.addSet('UNION', query, true);
  }

  public intersect(query: SourceCompatible<S>, all: boolean = false)
  {
    return this.addSet('INTERSECT', query, all);
  }

  public intersectAll(query: SourceCompatible<S>)
  {
    return this.addSet('INTERSECT', query, true);
  }

  public except(query: SourceCompatible<S>, all: boolean = false)
  {
    return this.addSet('EXCEPT', query, all);
  }

  public exceptAll(query: SourceCompatible<S>)
  {
    return this.addSet('EXCEPT', query, true);
  }

  public orderBy<K extends SelectsKey<S>>(selects: K | K[], order?: OrderDirection, nullsLast?: boolean): this
  {
    const selectsTuple = isArray(selects)
      ? selects
      : [ selects ];
    const selectsExprs = selectsTuple.map( s => this._criteria.selectsExpr[String(s)] );
    
    this._criteria.orderBy.push(...selectsExprs.map((expr) => new OrderBy(expr, order, nullsLast)));

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

}