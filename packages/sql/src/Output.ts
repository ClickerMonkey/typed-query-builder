import { DataTypeInputs, Expr, isNumber, NamedSource, SourceTable } from '@typed-query-builder/builder';
import { Dialect } from './Dialect';
import { DialectFeatures } from './Features';


export interface DialectOutputOptions
{
  throwError?: boolean;
  constantsAsParams?: boolean;
  raw?: boolean;
  excludeSource?: boolean;
  excludeSelectAlias?: boolean;
  simplifySelects?: boolean;
}

export class DialectOutput
{

  public dialect: Dialect;
  public options: DialectOutputOptions;
  public paramIndices: Record<string, number>;
  public paramCount: number;
  public params: any[];
  public paramTypes: Array<DataTypeInputs | undefined>;
  public query: string;
  public error?: Error;
  public sources: NamedSource<any, any>[];

  public constructor(dialect: Dialect, options: DialectOutputOptions)
  {
    this.dialect = dialect;
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

  public isUnique(column: string, exclude?: NamedSource<any, any>): boolean
  {
    for (const source of this.sources)
    {
      if (source === exclude)
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
    const saved = this.sources.slice();

    this.sources = saved.concat(sources);

    const result = adder();

    this.sources = saved;

    return result;
  }

}