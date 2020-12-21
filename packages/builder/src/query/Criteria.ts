import { SelectsKey } from 'types/Select';
import { 
  Name, createExprFactory, SourceKind, SourceKindPair, Selects, SelectsExprs, Sources, SourcesFieldsFactory, ExprFactory, 
  OrderBy, Select, NamedSource, ExprScalar, QueryWindow, fns, FunctionProxy, Functions, QueryGroup
} from '../internal';



export class QueryCriteria<T extends Sources, S extends Selects, W extends Name>
{

  public exprs: ExprFactory<T, S, W>;
  public sources: SourceKindPair<keyof T, any>[];
  public sourcesFields: SourcesFieldsFactory<T>;
  public selects: S;
  public selectsExpr: SelectsExprs<S>;
  public where: ExprScalar<boolean>[];
  public group: QueryGroup<SelectsKey<S>>[];
  public having?: ExprScalar<boolean>;
  public windows: { [K in W]: QueryWindow<K, T, S, W> };
  public groupingSets: SelectsKey<S>[][];
  public orderBy: OrderBy[];
  public limit?: number;
  public offset?: number;

  public constructor(base?: QueryCriteria<T, S, W>) 
  { 
    this.sources = base ? base.sources.slice() : [] as any;
    this.sourcesFields = base ? { ...base.sourcesFields } : {} as any;
    this.windows = base ? { ...base.windows } : {} as any;
    this.selects = base ? base.selects.slice() : [] as any;
    this.selectsExpr = base ? { ...base.selectsExpr } : {} as any;
    this.where = base ? base.where.slice() : [];
    this.group = base ? base.group.slice() : [];
    this.groupingSets = [];
    this.having = base?.having;
    this.orderBy = base ? base.orderBy.slice() : [];
    this.limit = base?.limit;
    this.offset = base?.offset;
    this.exprs = createExprFactory(this.sourcesFields, this.selectsExpr);
  }

  public addSource(source: NamedSource<any, any>, kind: SourceKind): void {
    this.sources.push(new SourceKindPair(kind, source));
    (this.sourcesFields as any)[source.getName()] = source.getFieldsFactory();
  }

  public replaceSource(source: NamedSource<any, any>, kind: SourceKind): void {
    this.sources.pop();
    this.addSource(source, kind);
  }

  public addSources(sources: NamedSource<any, any>[], kind: SourceKind): void {
    sources.forEach( source => this.addSource( source, kind ) );
  }

  public addSelect(select: Select<any, any>): void {
    this.selects.push(select);
    this.selectsExpr[select.alias] = select.getExpr();
  }

  public clearSelects(): void {
    this.selects = [] as any;
    this.selectsExpr = {} as any;
  }

  public addSelects(selects: Select<any, any>[]): void {
    selects.forEach( select => this.addSelect( select ) );
  }

  public addWindow<WA extends Name>(name: WA, defined: (window: QueryWindow<WA, T, S, W>, sources: SourcesFieldsFactory<T>, exprs: ExprFactory<T, S, W>, fns: FunctionProxy<Functions>, selects: SelectsExprs<S>) => QueryWindow<WA, T, S, W>): void {
    const { exprs, sourcesFields, selectsExpr } = this;

    this.windows[name as string] = defined(new QueryWindow(exprs, name), sourcesFields, exprs, fns, selectsExpr);
  }

  public clearWindows(): void {
    this.windows = {} as any;
  }

  public extend(): QueryCriteria<T, S, W> {
    return new QueryCriteria(this);
  }

}