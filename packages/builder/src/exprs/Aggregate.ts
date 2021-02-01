import { 
  ExprFactory, isName, Name, QueryWindow, Sources, Selects, FunctionResult, ExprKind, FunctionArgumentValues, OrderBy, 
  Traverser, Expr, ExprScalar, AggregateFunctions, OrderDirection
} from '../internal';



export class ExprAggregate<T extends Sources, S extends Selects, W extends Name, A extends keyof Aggs, Aggs = AggregateFunctions, R = FunctionResult<A, Aggs>> extends ExprScalar<R>
{

  public static readonly id = ExprKind.AGGREGATE;

  public constructor(
    public _exprs: ExprFactory<T, S, W>,
    public _windows: { [K in W]: QueryWindow<K, T, S, W> },
    public _type: A,
    public _values: FunctionArgumentValues<A, Aggs>,
    public _distinct?: boolean,
    public _filter?: ExprScalar<boolean>,
    public _order: OrderBy[] = [],
    public _overWindow?: W,
    public _overWindowDefinition?: QueryWindow<never, T, S, W>
  ) {
    super();
  }

  public getKind(): ExprKind 
  {
    return ExprKind.AGGREGATE;
  }

  public distinct(distinct: boolean = true): this 
  {
    this._distinct = distinct;

    return this;
  }

  public filter(condition: ExprScalar<boolean>): this 
  {
    this._filter = condition;

    return this;
  }

  public order(expr: ExprScalar<any>, dir?: OrderDirection, nullsLast?: boolean): this 
  {
    this._order.push(new OrderBy(expr, dir, nullsLast));

    return this;
  }

  public over<WN extends W = never>(windowInput: WN | ((w: QueryWindow<never, T, S, W>) => QueryWindow<never, T, S, W>)): this 
  {
    if (isName(windowInput)) 
    {
      this._overWindow = windowInput;
    } 
    else 
    {
      this._overWindowDefinition = windowInput(new QueryWindow(this._exprs, '' as never));
    }

    return this;
  }

  public traverse<R>(traverse: Traverser<Expr<any>, R>): R 
  {
    return traverse.enter(this, () => 
    {
      traverse.step('values', () => 
      {
        for (let i = 0; this._values.length; i++) 
        {
          traverse.step(i, this._values[i], (replace) => this._values[i] = replace as any);
        }
      });
      traverse.step('orderBy', () => 
      {
        for (let i = 0; i < this._order.length; i++) 
        {
          traverse.step(i, this._order[i].value, (replace) => this._order[i].value = replace as any);
        }
      });
      if (this._filter) 
      {
        traverse.step('filter', this._filter, (replace) => this._filter = replace as any, () => this._filter = undefined);
      }
      if (this._overWindowDefinition) 
      {
        traverse.step('window', this._overWindowDefinition);
      }
    });
  }
  
  public isSimple(): boolean 
  {
    return !this._filter || !this._overWindow || !this._overWindowDefinition;
  }

}