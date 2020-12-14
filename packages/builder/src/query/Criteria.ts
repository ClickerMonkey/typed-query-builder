import { Selects, SelectsExprs, Sources } from '../Types';
import { ExprFactory } from '../exprs/Factory';
import { OrderBy } from '../Order';
import { Select } from '../select/Select';
import { NamedSource } from '../sources';
import { SourceForType, SourcesFieldsFactory } from '..';
import { ExprScalar } from '../exprs';



export class QueryCriteria<T extends Sources, S extends Selects>
{

  public exprs: ExprFactory<T, S>;
  public sources: SourceForType<T>;
  public sourcesFields: SourcesFieldsFactory<T>;
  public selects: S;
  public selectsExpr: SelectsExprs<S>;
  public where: ExprScalar<boolean>[];
  public groupBy: ExprScalar<any>[];
  public having?: ExprScalar<boolean>;
  public orderBy: OrderBy[];
  public limit?: number;
  public offset?: number;

  public constructor(base?: QueryCriteria<T, S>) 
  { 
    this.sources = base ? { ...base.sources } : {} as any;
    this.sourcesFields = base ? { ...base.sourcesFields } : {} as any;
    this.selects = base ? base.selects.slice() : [] as any;
    this.selectsExpr = base ? { ...base.selectsExpr } : {} as any;
    this.where = base ? base.where.slice() : [];
    this.groupBy = base ? base.groupBy.slice() : [];
    this.having = base?.having;
    this.orderBy = base ? base.orderBy.slice() : [];
    this.limit = base?.limit;
    this.offset = base?.offset;
    this.exprs = new ExprFactory(this.sourcesFields, this.selectsExpr);
  }

  public addSource(source: NamedSource<any, any>): void {
    (this.sources as any)[source.getName()] = source;
    (this.sourcesFields as any)[source.getName()] = source.getFieldsFactory();
  }

  public addSources(sources: NamedSource<any, any>[]): void {
    sources.forEach( source => this.addSource( source ) );
  }

  public addSelect(select: Select<any, any>): void {
    this.selects[select.alias] = select;
    this.selectsExpr[select.alias] = select.getExpr();
  }

  public clearSelects(): void {
    this.selects = [] as any;
    this.selectsExpr = {} as any;
  }

  public addSelects(selects: Select<any, any>[]): void {
    selects.forEach( select => this.addSelect( select ) );
  }

  public extend(): QueryCriteria<T, S> {
    return new QueryCriteria(this);
  }

}