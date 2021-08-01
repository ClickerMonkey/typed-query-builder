import { 
  ExprFactory, isName, Name, QueryWindow, Sources, Selects, FunctionResult, ExprKind, FunctionArgumentValues, OrderBy, 
  Traverser, Expr, ExprScalar, AggregateFunctions, OrderDirection, _Boolean
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
    public _filter?: ExprScalar<_Boolean>,
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
  
  public isSimple(): boolean 
  {
    return !this._filter || !this._overWindow || !this._overWindowDefinition;
  }

  public traverse<R>(traverse: Traverser<Expr<any>, R>): R 
  {
    return traverse.enter(this, () => 
    {
      const { _values, _order, _filter } = this;

      traverse.step('values', () => 
      {
        for (let i = 0; _values.length; i++) 
        {
          traverse.step(i, _values[i], (replace) => _values[i] = replace as any);
        }
      });
      
      traverse.step('orderBy', () => 
      {
        for (let i = 0; i < _order.length; i++) 
        {
          traverse.step(i, _order[i].value, (replace) => _order[i].value = replace as any);
        }
      });

      if (_filter) 
      {
        traverse.step('filter', _filter, (replace) => this._filter = replace as any, () => this._filter = undefined);
      }

      if (this._overWindowDefinition) 
      {
        traverse.step('window', this._overWindowDefinition);
      }
    });
  }

  /**
   * Sets whether the aggregate function should only run on the distinct values of the expression.
   * By default aggregation occurs on all values.
   * 
   * ```ts
   * agg.distinct(); // when called
   * agg.distinct(true); // same as above
   * agg.distinct(false); // explicitly sets it to false if previously defined as true
   * ```
   * 
   * @param distinct Whether distinct or all values should be aggregated.
   * @returns This aggregate expression.
   */
  public distinct(distinct: boolean = true): this 
  {
    this._distinct = distinct;

    return this;
  }

  /**
   * Sets the condition that evaluates whether a record's value should be aggregated.
   * 
   * @param condition The condition that evaluates each record.
   * @returns This aggregate expression.
   */
  public filter(condition?: ExprScalar<_Boolean>): this 
  {
    this._filter = condition;

    return this;
  }

  /**
   * Adds ordering logic to the records which will be aggregated. The order doesn't matter in most aggregate functions 
   * but some functions build strings and arrays where order may matter.
   * 
   * @param expr The expression that returns a value to order by.
   * @param dir If ordering should be done in ascending or descending order.
   * @param nullsLast If the expression results in a null value, should they be ordered last?
   * @returns This aggregate expression.
   */
  public order(expr: ExprScalar<any>, dir?: OrderDirection, nullsLast?: boolean): this 
  {
    this._order.push(new OrderBy(expr, dir, nullsLast));

    return this;
  }

  /**
   * Sets the aggregate as a window aggregate function by giving the window name or by defining the window.
   * 
   * @param windowInput The name of the predefined window or a function which defines a window.
   * @returns This aggregate expression.
   */
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

}