import { 
  isArray, ExprInputTuple, ExprScalar, SelectsNameless, SelectsValues, PredicateRowType, Name, Expr, ExprKind, Selects, 
  Sources, QueryCriteria, ExprPredicateRow, toExpr, ObjectFromSelects, QueryJson
} from '../internal';


export class QueryFirst<T extends Sources, S extends Selects, W extends Name> extends Expr<S>
{
  
  public static readonly id = ExprKind.QUERY_FIRST;

  public constructor(
    public criteria: QueryCriteria<T, S, W>
  ) {
    super();
  }

  public getKind(): ExprKind 
  {
    return ExprKind.QUERY_FIRST;
  }

  public isStatement(): boolean 
  {
    return true;
  }

  public is(type: PredicateRowType, row: Expr<SelectsValues<S>> | Expr<SelectsNameless<S>> | ExprInputTuple<SelectsValues<S>>): ExprScalar<boolean> 
  {
    return new ExprPredicateRow<SelectsValues<S>>(type, this as any, isArray(row) ? row.map( toExpr ) : row as any);
  }

  public json(): ExprScalar<ObjectFromSelects<S>> 
  {
    return new QueryJson<S, ObjectFromSelects<S>>(this);
  }

}

