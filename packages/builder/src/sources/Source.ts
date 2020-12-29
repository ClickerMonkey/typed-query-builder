import { 
  QueryJson, ExprScalar, ObjectFromSelects, Selects, Name, Expr, QuerySet, NamedSourceBase, NamedSource, SourceCompatible 
} from "../internal";


export abstract class Source<S extends Selects> extends Expr<S[]>
{
   
  public abstract getSelects(): S;

  public getName(): Name | false
  {
    return false;
  }

  public hasAnonymousSelects(): boolean
  {
    return false;
  }

  public as<N extends Name>(name: N): NamedSource<N, S>
  {
    return new NamedSourceBase(name, this);
  }

  public union(query: SourceCompatible<S>, all: boolean = false): QuerySet<S>
  {
    return QuerySet.create('UNION', this, query, all);
  }

  public unionAll(query: SourceCompatible<S>): QuerySet<S>
  {
    return QuerySet.create('UNION', this, query, true);
  }

  public intersect(query: SourceCompatible<S>, all: boolean = false): QuerySet<S>
  {
    return QuerySet.create('INTERSECT', this, query, all);
  }

  public intersectAll(query: SourceCompatible<S>): QuerySet<S>
  {
    return QuerySet.create('INTERSECT', this, query, true);
  }

  public except(query: SourceCompatible<S>, all: boolean = false): QuerySet<S>
  {
    return QuerySet.create('EXCEPT', this, query, all);
  }

  public exceptAll(query: SourceCompatible<S>): QuerySet<S>
  {
    return QuerySet.create('EXCEPT', this, query, true);
  }

  public json(): ExprScalar<ObjectFromSelects<S>[]> 
  {
    return new QueryJson<S, ObjectFromSelects<S>[]>(this);
  }

}