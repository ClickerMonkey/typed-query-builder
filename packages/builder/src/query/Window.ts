import { 
  ExprFactory, WindowFrameMode, ExprScalar, OrderBy, WindowFrameExclusion, QuerySelectScalarProvider, OrderDirection, Name, 
  Sources, Selects, QuerySelectScalarInput 
} from '../internal';


export class QueryWindow<N extends Name, T extends Sources, S extends Selects, W extends Name>
{

  public static readonly DEFAULT_MODE = 'RANGE';
  public static readonly DEFAULT_START_OFFSET = -1; 
  public static readonly DEFAULT_START_UNBOUNDED = true;
  public static readonly DEFAULT_END_OFFSET = 0; 
  public static readonly DEFAULT_END_UNBOUNDED = false; 
  public static readonly DEFAULT_EXCLUSION = 'NO OTHERS';

  public constructor(
    public _exprs: ExprFactory<T, S, W>,
    public _name: N,
    public _partitionBy: ExprScalar<any>[] = [],
    public _orderBy: OrderBy[] = [],
    public _mode: WindowFrameMode = QueryWindow.DEFAULT_MODE,
    public _startOffset: number = QueryWindow.DEFAULT_START_OFFSET,
    public _startUnbounded: boolean = QueryWindow.DEFAULT_START_UNBOUNDED,
    public _endOffset: number = QueryWindow.DEFAULT_END_OFFSET,
    public _endUnbounded: boolean = QueryWindow.DEFAULT_END_UNBOUNDED,
    public _exclusion: WindowFrameExclusion = QueryWindow.DEFAULT_EXCLUSION
  ) {

  }

  public partition(...values: QuerySelectScalarInput<T, S, any>): this {
    const exprs = this._exprs.parse(values);

    for (const expr of exprs) {
      this._partitionBy.push(expr);
    }

    return this;
  }

  public clearPartition(): this {
    this._partitionBy = [];

    return this;
  }

  public order(values: QuerySelectScalarProvider<T, S, W, any>, order?: OrderDirection, nullsLast?: boolean): this {
    const exprs = this._exprs.parse([values]);

    for (const expr of exprs) {
      this._orderBy.push(new OrderBy(expr, order, nullsLast));
    }

    return this;
  }

  public clearOrder(): this {
    this._orderBy = [];

    return this;
  }

  public mode(mode: WindowFrameMode): this {
    this._mode = mode;

    return this;
  }

  public start(type: 'UNBOUNDED PRECEDING'): this 
  public start(type: 'PRECEDING', offset: number): this 
  public start(type: 'CURRENT ROW'): this 
  public start(type: 'FOLLOWING', offset: number): this 
  public start(type: 'UNBOUNDED FOLLOWING'): this 
  public start(type: string, offset?: number): this {
    switch(type) {
      case 'UNBOUNDED PRECEDING':
        this._startUnbounded = true;
        this._startOffset = -1;
        break;
      case 'PRECEDING':
        this._startUnbounded = false;
        this._startOffset = -(offset as number);
        break;
      case 'CURRENT ROW':
        this._startUnbounded = false;
        this._startOffset = 0;
        break;
      case 'FOLLOWING':
        this._startUnbounded = false;
        this._startOffset = +(offset as number);
        break;
      case 'UNBOUNDED FOLLOWING':
        this._startUnbounded = true;
        this._startOffset = 1;
        break;
    }

    return this;
  }

  public end(type: 'UNBOUNDED PRECEDING'): this 
  public end(type: 'PRECEDING', offset: number): this 
  public end(type: 'CURRENT ROW'): this 
  public end(type: 'FOLLOWING', offset: number): this 
  public end(type: 'UNBOUNDED FOLLOWING'): this 
  public end(type: string, offset?: number): this {
    switch(type) {
      case 'UNBOUNDED PRECEDING':
        this._endUnbounded = true;
        this._endOffset = -1;
        break;
      case 'PRECEDING':
        this._endUnbounded = false;
        this._endOffset = -(offset as number);
        break;
      case 'CURRENT ROW':
        this._endUnbounded = false;
        this._endOffset = 0;
        break;
      case 'FOLLOWING':
        this._endUnbounded = false;
        this._endOffset = +(offset as number);
        break;
      case 'UNBOUNDED FOLLOWING':
        this._endUnbounded = true;
        this._endOffset = 1;
        break;
    }

    return this;
  }

  public exclude(exclusion: WindowFrameExclusion): this {
    this._exclusion = exclusion;

    return this;
  }
  
  public extend<A extends Name>(alias: A): QueryWindow<A, T, S, W> {
    return new QueryWindow(
      this._exprs, 
      alias, 
      this._partitionBy.slice(), 
      this._orderBy.slice(),
      this._mode,
      this._startOffset,
      this._startUnbounded,
      this._endOffset,
      this._endUnbounded,
      this._exclusion
    );
  }

}