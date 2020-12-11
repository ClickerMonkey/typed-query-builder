import { Selects, SelectsExprs, Sources } from '../Types';
import { ExprFactory } from '../exprs/Factory';
import { Expr } from '../exprs/Expr';
import { OrderBy } from '../Order';
import { Select } from '../select/Select';
import { createFieldsFactory, Source, SourceForType, SourcesFieldsFactory } from '../sources/Source';



export class QuerySelectBase<T extends Sources, S extends Selects, R> extends Expr<R>
{

  public _exprs: ExprFactory<T, S>;
  public _sources: SourceForType<T>;
  public _sourcesFields: SourcesFieldsFactory<T>;
  public _selects: S;
  public _selectsExpr: SelectsExprs<S>;
  public _where: Expr<boolean>[];
  public _groupBy: Expr<any>[];
  public _having?: Expr<boolean>;
  public _orderBy: OrderBy[];
  public _limit?: number;
  public _offset?: number;


  public constructor(base?: QuerySelectBase<T, S, any>) 
  {
    super();
    
    this._sources = base ? { ...base._sources } : {} as any;
    this._sourcesFields = base ? { ...base._sourcesFields } : {} as any;
    this._selects = base ? base._selects.slice() : [] as any;
    this._selectsExpr = base ? { ...base._selectsExpr } : {} as any;
    this._where = base ? base._where.slice() : [];
    this._groupBy = base ? base._groupBy.slice() : [];
    this._having = base?._having;
    this._orderBy = base ? base._orderBy.slice() : [];
    this._limit = base?._limit;
    this._offset = base?._offset;
    this._exprs = new ExprFactory(this._sourcesFields, this._selectsExpr);
  }

  protected addSource(source: Source<any, any>): void {
    this._sources[source.alias as keyof T] = source;
    (this._sourcesFields as any)[source.alias] = createFieldsFactory(source.getFields());
  }

  protected addSelect(select: Select<any, any>): void {
    this._selects[select.alias] = select;
    this._selectsExpr[select.alias] = select.getExpr();
  }

}