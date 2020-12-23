import { DataTypeInputs, Expr } from '@typed-query-builder/builder';
import { Dialect } from './Dialect';
import { DialectFeatures } from './Features';


export interface DialectOutputOptions
{
  throwError?: boolean;
  constantsAsParams?: boolean;
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

      return this.addParam(String(this.paramCount));
    }
    else
    {
      return this.dialect.getValueFormatted(value, dataType);
    }
  }

  public wrap(e: Expr<any>): string
  {
    const transformed = this.dialect.transformer.transform(e, this);

    return e.isSimple() ? transformed : `(${transformed})`;
  }

}