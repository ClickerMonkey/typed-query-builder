import { QueryWindow } from '@typed-query-builder/builder';
import { RunExpr } from './Compiler';



export interface RunStateOptions
{
   // All sources, given and virtual
   sources: RunInput;

   // Any parameters passed in
   params?: Record<string, any>;
 
   // Ignore string case?
   ignoreCase?: boolean;
}



export interface RunInput 
{
  [source: string]: any[];
}

export interface RunRow 
{
  [source: string]: {
    [field: string]: any;
  };
}

/**
 * A result is a group of rows that have been created by joining sources. 
 * If a group by clause was specified the group array will contain one or more rows that can be aggregated against.
 */
export interface RunResult
{

  /**
   * The main row in the result, if its a grouped result this is the first row of the group.
   */
  row: RunRow;

  /**
   * Rows grouped together that can have aggregate expressions, or a single row if no grouping occurred.
   */
  group: RunResult[];

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



export class RunState 
{

  // All sources, given and virtual
  public sources!: RunInput;

  // Any parameters passed in
  public params: Record<string, any> = {};

  // Ignore string case?
  public ignoreCase: boolean = false;

  // Built by sources
  public sourceOutput: RunRow[] = [];

  // Current row to evaluate when I'm applying where logic
  public row!: RunRow;

  // sourceOutput converted to results, if grouping exists this is updated
  public results: RunResult[] = [];

  // Current result to evaluate in grouping & having clauses.
  public result!: RunResult;

  // The index of result in the currently iterating results array.
  public resultIndex: number = 0;

  // The last window that was applied to the results
  public lastWindow?: QueryWindow<never, any, any, any>;

  // Number of affected (insert, updated, deleted) records.
  public affected: number = 0;


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

  public forEachResult(onResult: (result: RunResult) => void, results: RunResult[] = this.results): void 
  {
    this.newContext(() => 
    {
      for (let i = 0; i < results.length; i++) 
      {
        const result = results[i];

        this.result = result;
        this.resultIndex = i;
        this.row = result.row;

        onResult(result);
      }
    });
  }

  public getRowValue<T>(expr: RunExpr<T>, result?: RunResult): T 
  {
    if (result) 
    {
      this.result = result;
      this.resultIndex = -1;
      this.row = result.row;
    }

    const { cached, selects } = this.result;
    let cachedValue = cached[expr.id];

    if (!(expr.id in cached)) {
      cached[expr.id] = cachedValue = expr.get(this);

      if (expr.select) {
        selects[expr.select] = cachedValue;
      }
    }

    return cachedValue;
  }

  public setRowValue<T>(expr: RunExpr<T>, value: any, result?: RunResult): void 
  {
    if (result) 
    {
      this.result = result;
      this.resultIndex = -1;
      this.row = result.row;
    }

    const { cached, selects } = this.result;

    cached[expr.id] = value;

    if (expr.select) {
      selects[expr.select] = value;
    }
  }

  public newContext<R = void>(context: () => R): R 
  {
    const { result, resultIndex, row } = this;

    const contextResult = context();

    this.result = result;
    this.resultIndex = resultIndex;
    this.row = row;

    return contextResult;
  }

}
