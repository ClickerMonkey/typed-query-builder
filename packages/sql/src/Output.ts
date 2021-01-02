import { DataTypeInputs, Expr, isNumber, NamedSource, Source, SourceTable } from '@typed-query-builder/builder';
import { Dialect } from './Dialect';
import { DialectFeatures } from './Features';


export interface DialectOutputOptions
{
  throwError?: boolean;
  constantsAsParams?: boolean;
  raw?: boolean;
  excludeSource?: boolean;
  excludeSelectAlias?: boolean;
  includeSelectAlias?: boolean;
  simplifyReferences?: boolean;
  tableOverrides?: Record<string, string>;
}

export class DialectOutput
{

  public dialect: Dialect;
  public expr: Expr<any>;
  public options: DialectOutputOptions;
  public paramIndices: Record<string, number>;
  public paramCount: number;
  public params: any[];
  public paramTypes: Array<DataTypeInputs | undefined>;
  public query: string;
  public error?: Error;
  public sources: NamedSource<any, any>[];

  public constructor(dialect: Dialect, expr: Expr<any>, options: DialectOutputOptions)
  {
    this.dialect = dialect;
    this.expr = expr;
    this.options = options;
    this.paramIndices = {};
    this.paramCount = 0;
    this.params = [];
    this.paramTypes = [];
    this.query = '';
    this.error = undefined;
    this.sources = [];
  }

  public addParam(param: string): string
  {
    const paramIndex = param in this.paramIndices
      ? this.paramIndices[param]
      : this.paramIndices[param] = this.paramCount++;

    const paramKey = this.dialect.hasSupport(DialectFeatures.NAMED_PARAMETERS)
      ? param
      : paramIndex;

    return `${this.dialect.paramPrefix}${paramKey}${this.dialect.paramSuffix}`;
  }

  public getConstant(value: any, dataType?: DataTypeInputs): string
  {
    if (this.options.constantsAsParams)
    {
      this.params[this.paramCount] = value;
      this.paramTypes[this.paramCount] = dataType;

      return this.addParam(String(this.paramCount + this.dialect.paramOffset));
    }
    else
    {
      return this.dialect.getValueFormatted(value, dataType);
    }
  }

  public getParams(params: Record<string, any>): any[]
  {
    const copy = this.params.slice();

    for (const param in params)
    {
      const i = this.paramIndices[param];

      if (isNumber(i))
      {
        copy[i] = params[param];
      }
    }

    return copy;
  }

  public wrap(e: Expr<any>): string
  {
    const transformed = this.dialect.transformer.transform(e, this);

    return e.isSimple() ? transformed : `(${transformed})`;
  }

  public modify<R = void>(options: DialectOutputOptions, modifier: () => R): R
  {
    const saved = this.options;

    this.options = {
      ...saved,
      ...options,
    };

    const result = modifier();

    this.options = saved;

    return result;
  }

  public isUnique(column: string, exclude?: NamedSource<any, any> | Source<any>): boolean
  {
    for (const source of this.sources)
    {
      if (exclude && source.isSource(exclude))
      {
        continue;
      }

      const original = source.getSource();

      if (original instanceof SourceTable)
      {
        if (original.hasColumn(column))
        {
          return false;
        }
      }
      else if (source.getFields()[column])
      {
        return false;
      }
    }

    return true;
  }

  public addSources<R = void>(sources: NamedSource<any, any>[], adder: () => R): R
  {
    const saved = this.saveSources();

    this.sources = saved.concat(sources);

    const result = adder();

    this.restoreSources(saved);

    return result;
  }

  public saveSources(): NamedSource<any, any>[]
  {
    const saved = this.sources;

    this.sources = saved.slice();

    return saved;
  }

  public restoreSources(saved: NamedSource<any, any>[])
  {
    this.sources = saved;
  }

}