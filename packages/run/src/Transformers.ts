import { Expr, Transformer } from '@typed-query-builder/builder';
import { ExprNull } from '@typed-query-builder/builder/src/internal';



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
   * Cached order by values. These are cached by order by or window clauses.
   */
  order: any[];

  /**
   * The relative order value to the row before. This is -1 for the first row. 0 if the row before has the same order values. 1 if the row before is not the same order value.
   */
  relativeOrder: number;
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

  // All partitions based on current window function
  public partitions: RunTransformerResult[][] = [];

  // Current partition based on window functions
  public partition: RunTransformerResult[] = [];

  // The start of the window frame in the current window function partition
  public frameStart: number = 0;

  // The end of the window frame in the current window function partition
  public frameEnd: number = 0;


  public getRowValue<T>(expr: RunTransformerExpr<T>): T
  {
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

  public setRowValue<T>(expr: RunTransformerExpr<T>, value: any): void
  {
    const { cached, selects } = this.result;

    cached[expr.id] = value;

    if (expr.select)
    {
      selects[expr.select] = value;
    }
  }

}