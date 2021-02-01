import { Expr, QueryWindow, Transformer, ExprNull } from '@typed-query-builder/builder';



export interface RunTransformerInput 
{
  [source: string]: any[];
}

export interface RunTransformerRow 
{
  [source: string]: {
    [field: string]: any;
  };
}

/**
 * A result is a group of rows that have been created by joining sources. 
 * If a group by clause was specified the group array will contain one or more rows that can be aggregated against.
 */
export interface RunTransformerResult
{

  /**
   * The main row in the result, if its a grouped result this is the first row of the group.
   */
  row: RunTransformerRow;

  /**
   * Rows grouped together that can have aggregate expressions, or a single row if no grouping occurred.
   */
  group: RunTransformerRow[];

  /**
   * Cached expression values. Complex expressions can be referenced multiple times since selects are defined, then
   * order by and group by and where conditions reference those select expressions.
   */
  cached: Record<number, any>;

  /**
   * The calculated select aliases and values.
   */
  selects: Record<string, any>;

  /**
   * Cached group/partition by values.
   */
  partitionValues: any[];

  /**
   * The zero-based partition this result is in.
   */
  partition: number;

  /**
   * The zero-based index this result is in it's partition.
   */
  partitionIndex: number;

  /**
   * The number of rows in the partition.
   */
  partitionSize: number;

  /**
   * Cached peer order by values.
   */
  peerValues: any[];

  /**
   * The zero-based peer group this result is in.
   */
  peer: number;

  /**
   * The zero-based index this result is in it's peer group.
   */
  peerIndex: number;

  /**
   * The number of peers in the peer group.
   */
  peerSize: number;
}

/**
 * A expression thats been compiled (given an id and transform function).
 */
export interface RunTransformerExpr<T>
{
  expr: Expr<T>;
  id: number;
  get: RunTransformerFunction<T>;
  select?: string;
}

export const RunTransformerExprNoop: RunTransformerExpr<any> = {
  expr: new ExprNull(),
  id: -1,
  get: () => undefined,
};

export interface RunTransformerFunction<T> 
{
  (state: RunState): T;
}

export interface RunTransformerTransformer
{
  <T>(value: Expr<T>, compiling: RunCompiled): RunTransformerFunction<T>;
}


export const RunTransformers = new Transformer<RunTransformerTransformer, [RunCompiled]>();


export class RunCompiled
{

  public exprs: RunTransformerExpr<any>[] = [];

  public transform: RunTransformerTransformer;

  public constructor(
    transform: RunTransformerTransformer,
  ) {
    this.transform = transform;
  }

  public eval<T>(expr: Expr<T>, select?: string): RunTransformerExpr<T>
  {
    const { exprs, transform } = this;
    let found = exprs.find( e => e.expr === expr );

    if (!found)
    {
      found = { 
        expr, 
        id: exprs.length,
        get: transform(expr, this),
        select,
      };

      exprs.push( found );
    }

    return found;
  }

}

export interface RunStateOptions
{
   // All sources, given and virtual
   sources: RunTransformerInput;

   // Any parameters passed in
   params?: Record<string, any>;
 
   // Ignore string case?
   ignoreCase?: boolean;
}

export class RunState
{

  // All sources, given and virtual
  public sources!: RunTransformerInput;

  // Any parameters passed in
  public params: Record<string, any> = {};

  // Ignore string case?
  public ignoreCase: boolean = false;

  // Built by sources
  public sourceOutput: RunTransformerRow[] = [];

  // Current row to evaluate when I'm applying where logic
  public row!: RunTransformerRow;

  // sourceOutput converted to results, if grouping exists this is updated
  public results: RunTransformerResult[] = [];

  // Current result to evaluate in grouping & having clauses.
  public result!: RunTransformerResult;

  // The last window that was applied to the results
  public lastWindow?: QueryWindow<never, any, any, any>;


  public constructor(options: RunStateOptions)
  {
    this.sources = { ...options.sources };
    this.params = options.params || {};
    this.ignoreCase = !!options.ignoreCase;
  }

  public extend()
  {
    return new RunState(this);
  }

  public forEachResult(onResult: (result: RunTransformerResult) => void): void
  {
    for (const result of this.results)
    {
      this.result = result;
      this.row = result.row;

      onResult(result);
    }
  }

  public getRowValue<T>(expr: RunTransformerExpr<T>, result?: RunTransformerResult): T
  {
    if (result)
    {
      this.result = result;
      this.row = result.row;
    }

    const { cached, selects } = this.result;
    let cachedValue = cached[expr.id];
  
    if (!(expr.id in cached))
    {
      cached[expr.id] = cachedValue = expr.get(this);

      if (expr.select)
      {
        selects[expr.select] = cachedValue;
      }
    }

    return cachedValue;
  }

  public setRowValue<T>(expr: RunTransformerExpr<T>, value: any, result?: RunTransformerResult): void
  {
    if (result)
    {
      this.result = result;
      this.row = result.row;
    }

    const { cached, selects } = this.result;

    cached[expr.id] = value;

    if (expr.select)
    {
      selects[expr.select] = value;
    }
  }

}