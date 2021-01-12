import { 
  Transformer, Expr, isString, isFunction, DataTypeTypes, DataTypeInputs, OperationUnaryType, GroupingSetType, InsertPriority, 
  JoinType, LockRowLock, LockStrength, OperationBinaryType, OrderDirection, PredicateBinaryListType, 
  PredicateBinaryType, PredicateRowType, PredicatesType, PredicateUnaryType, SetOperation, WindowFrameExclusion, WindowFrameMode, 
  isArray, isBoolean, compileFormat, isNumber, AggregateFunctions, getDataTypeFromValue, getDataTypeFromInput, Functions, isValue, ExprKind, ExprClass
} from '@typed-query-builder/builder';

import { DialectFeatures, DialectFeaturesDescription } from './Features';
import { DialectFormatter, DialectFormatterFunction } from './Formatter';
import { DialectOutput, DialectOutputOptions } from './Output';


export interface DialectTransformTransformer {
  <T>(value: Expr<T>, out: DialectOutput): string;
}


export type DialectQuoteFormatter = (value: string, dialect: Dialect) => string;

export type DialectQuoteInput = string | [string, string] | DialectQuoteFormatter;

export type DialectValueFormatter = (value: any, dialect: Dialect, dataType?: DataTypeInputs) => string | undefined;

export type DialectDataTypeFormatter = (type: DataTypeInputs) => string;

export type DialectMap<T extends string, V = string> = Partial<Record<T, V>>;

export type DialectFeatureFormatter = (value: any, transform: DialectTransformTransformer, out: DialectOutput) => string

export interface DialectParamsOperationUnary
{
  op: string;
  value: string;
}

export interface DialectParamsOperationBinary
{
  first: string;
  op: string;
  second: string;
}

export interface DialectParamsPredicateUnary
{
  op: string;
  value: string;
}

export interface DialectParamsPredicateBinary
{
  first: string;
  op: string;
  second: string;
}

export interface DialectParamsPredicateBinaryList
{
  first: string;
  op: string;
  pass: string;
  second: string;
}

export interface DialectParamsPredicateRow
{
  first: string;
  op: string;
  second: string;
  [index: number]: string;
}

export interface DialectParamsAggregate
{
  name: string;
  args: string;
  distinct: string;
  order: string;
  over: string;
  filter: string;
  [argIndex: number]: string;
  argCount: number;
  argList: string[];
}

export interface DialectParamsFunction
{
  name: string;
  args: string;
  [argIndex: number]: string;
  argCount: number;
  argList: string[];
}

export interface DialectParamsNamed
{
  name: string;
}

export interface DialectParamsPaging
{
  limit: number;
  offset: number;
}

export interface DialectParamsInsert
{
  with: string;
  INSERT: string;
  priority: string;
  INTO: string;
  table: string;
  columns: string;
  values: string;
  duplicate: string;
  returning: string;
}

export interface DialectParamsDelete
{
  with: string;
  DELETE: string;
  FROM: string;
  table: string;
  using: string;
  where: string;
  returning: string;
}

export interface DialectParamsUpdate
{
  with: string;
  UPDATE: string;
  ONLY: string;
  table: string;
  set: string;
  from: string;
  where: string;
  returning: string;
}

export interface DialectParamsSelect
{
  with: string;
  SELECT: string;
  distinct: string;
  selects: string;
  from: string;
  joins: string;
  where: string;
  group: string;
  having: string;
  windows: string;
  order: string;
  paging: string;
  locks: string;
}

export type DialectOrderedFormatter<P> = Partial<Record<keyof P, () => string>>;

export type DialectOrderedOrder<P> = Array<keyof P>;


export class Dialect
{

  public transformer: Transformer<DialectTransformTransformer, [DialectOutput]>;
  public valueQuoter: DialectQuoteFormatter;
  public aliasQuoter: DialectQuoteFormatter;
  public aliasQuotesOptional: RegExp;
  public nameQuoter: DialectQuoteFormatter;
  public nameQuotesOptional: RegExp;
  public reservedWords: Record<string, boolean>;
  public valueFormatter: DialectValueFormatter[];
  public valueFormatterMap: DialectMap<keyof DataTypeTypes, DialectValueFormatter>;
  public dataTypeFormatter: DialectMap<keyof DataTypeTypes, DialectDataTypeFormatter>;
  public dataTypeUnsignedIdentifier: string;
  public dataTypeNullIdentifier: string;
  public dataTypeArrayFormatter: (element: string, length?: number) => string;
  public paramOffset: number;
  public paramPrefix: string;
  public paramSuffix: string;
  public trueIdentifier: string;
  public falseIdentifier: string;
  public nullIdentifier: string;
  public featureFormatter: Record<DialectFeatures, DialectFeatureFormatter>;
  public selectExpression: (expr: string) => string;
  public supports: number;
  public defaultOptions: DialectOutputOptions;
  public aggregateRequiresArgument: DialectMap<keyof AggregateFunctions, string>;
  public implicitPredicates: boolean;
  public recursiveKeyword: boolean;
  public selectOffsetOnly: DialectFormatterFunction<DialectParamsPaging>;
  public selectLimitOnly: DialectFormatterFunction<DialectParamsPaging>;
  public selectOffsetLimit: DialectFormatterFunction<DialectParamsPaging>;
  public insertOrder: DialectOrderedOrder<DialectParamsInsert>;
  public deleteOrder: DialectOrderedOrder<DialectParamsDelete>;
  public updateOrder: DialectOrderedOrder<DialectParamsUpdate>;
  public selectOrder: DialectOrderedOrder<DialectParamsSelect>;
  public resultParser: DialectMap<ExprKind, (value: any, expr: Expr<any>) => any>;

  public functionsUpper: boolean;
  public functionsRawArguments: Partial<Record<keyof Functions, Record<number, true>>>;
  public functions: DialectFormatter<keyof Functions, DialectParamsFunction>;  
  public aggregates: DialectFormatter<keyof AggregateFunctions, DialectParamsAggregate>;
  public operationUnary: DialectFormatter<OperationUnaryType, DialectParamsOperationUnary>;
  public operationBinary: DialectFormatter<OperationBinaryType, DialectParamsOperationBinary>;
  public predicateUnary: DialectFormatter<PredicateUnaryType, DialectParamsPredicateUnary>;
  public predicateBinary: DialectFormatter<PredicateBinaryType, DialectParamsPredicateBinary>;
  public predicateBinaryList: DialectFormatter<PredicateBinaryListType, DialectParamsPredicateBinaryList>;
  public predicateRow: DialectFormatter<PredicateRowType, DialectParamsPredicateRow>;
  public predicateTypes: DialectFormatter<PredicatesType, DialectParamsNamed>;
  public joinType: DialectFormatter<JoinType, DialectParamsNamed>;
  public orderDirection: DialectFormatter<OrderDirection, DialectParamsNamed>;
  public setOperation: DialectFormatter<SetOperation, DialectParamsNamed>;
  public windowFrameMode: DialectFormatter<WindowFrameMode, DialectParamsNamed>;
  public windowFrameExclusion: DialectFormatter<WindowFrameExclusion, DialectParamsNamed>;
  public groupingSet: DialectFormatter<GroupingSetType, DialectParamsNamed>;
  public insertPriority: DialectFormatter<InsertPriority, DialectParamsNamed>;
  public lockStrength: DialectFormatter<LockStrength, DialectParamsNamed>;
  public lockRow: DialectFormatter<LockRowLock, DialectParamsNamed>;

  public constructor()
  {
    this.transformer = new Transformer();
    this.valueQuoter = Dialect.quoter(["'", "''"]);
    this.aliasQuoter = Dialect.quoter(['"', '""']);
    this.aliasQuotesOptional = /^\w+$/;
    this.nameQuoter = Dialect.quoter(['"', '""']);
    this.nameQuotesOptional = /^\w+$/;
    this.dataTypeUnsignedIdentifier = 'UNSIGNED';
    this.dataTypeNullIdentifier = 'NULL';
    this.dataTypeArrayFormatter = (element, length) => `${element} ARRAY[${length || ''}]`;
    this.dataTypeFormatter = {};
    this.reservedWords = {};
    this.recursiveKeyword = true;
    this.resultParser = {};
    this.functionsRawArguments = {};

    this.functionsUpper = true;
    this.functions = new DialectFormatter('{name}({args})', ['name', 'args'], 'name');
    this.aggregates = new DialectFormatter('{name}({distinct}{args}{order}){filter}{over}', ['name', 'distinct', 'args', 'order', 'filter', 'over'], 'name');
    this.operationUnary = new DialectFormatter('{op}{value}', ['op', 'value'], 'op');
    this.operationBinary = new DialectFormatter('{first} {op} {second}', ['op', 'first', 'second'], 'op');
    this.predicateUnary = new DialectFormatter('{value} IS {op}', ['op', 'value'], 'op');
    this.predicateBinary = new DialectFormatter('{first} {op} {second}', ['op', 'first', 'second'], 'op');
    this.predicateBinaryList = new DialectFormatter('{first} {op} {pass} ({second})', ['op', 'first', 'pass', 'second'], 'op');
    this.predicateRow = new DialectFormatter('({first}) {op} ({second})', ['op', 'first', 'second'], 'op');
    this.predicateTypes = new DialectFormatter('{name}', ['name'], 'name');
    this.joinType = new DialectFormatter('{name}', ['name'], 'name');
    this.orderDirection = new DialectFormatter('{name}', ['name'], 'name');
    this.setOperation = new DialectFormatter('{name}', ['name'], 'name');
    this.windowFrameMode = new DialectFormatter('{name}', ['name'], 'name');
    this.windowFrameExclusion = new DialectFormatter('{name}', ['name'], 'name');
    this.groupingSet = new DialectFormatter('{name}', ['name'], 'name');
    this.insertPriority = new DialectFormatter('{name}', ['name'], 'name');
    this.lockStrength = new DialectFormatter('{name}', ['name'], 'name');
    this.lockRow = new DialectFormatter('{name}', ['name'], 'name');
    
    this.valueFormatter = [];
    this.valueFormatterMap = {};
    this.featureFormatter = {};
    this.paramOffset = 1;
    this.paramPrefix = '$';
    this.paramSuffix = '';
    this.trueIdentifier = 'TRUE';
    this.falseIdentifier = 'FALSE';
    this.nullIdentifier = 'NULL';
    this.defaultOptions = {};
    this.aggregateRequiresArgument = { count: '*' };
    this.implicitPredicates = false;

    this.selectExpression = (expr) => `SELECT ${expr}`;
    this.selectOffsetLimit = compileFormat('LIMIT {limit} OFFSET {offset}');
    this.selectOffsetOnly = compileFormat('LIMIT ALL OFFSET {offset}');
    this.selectLimitOnly = compileFormat('LIMIT {limit}');

    this.insertOrder = ['with', 'INSERT', 'priority', 'INTO', 'table', 'columns', 'values', 'duplicate', 'returning'];
    this.deleteOrder = ['with', 'DELETE', 'FROM', 'table', 'using', 'where', 'returning'];
    this.updateOrder = ['with', 'UPDATE', 'ONLY', 'table', 'set', 'from', 'where', 'returning'];
    this.selectOrder = ['with', 'SELECT', 'distinct', 'selects', 'from', 'joins', 'where', 'group', 'having', 'windows', 'order', 'paging', 'locks'];

    this.supports = DialectFeatures.ALL;
  }

  public output(options: DialectOutputOptions = {})
  {
    return (e: Expr<any>): DialectOutput => 
    {
      const derivedOptions = {
        ...this.defaultOptions,
        ...options,
      };

      const out = new DialectOutput(this, e, derivedOptions);

      try
      {
        out.query = this.transformer.transform(e, out);

        if (!e.isStatement() && !derivedOptions.raw)
        {
          out.query = this.selectExpression(out.query);
        }
      }
      catch (e)
      {
        if (derivedOptions.throwError)
        {
          throw e;
        }

        out.error = e;
      }

      return out;
    };
  }

  public formatOrdered<P>(order: DialectOrderedOrder<P>, formatters: DialectOrderedFormatter<P>): string
  {
    let sections: string[] = [];

    for (const param of order)
    {
      let formatter = formatters[param];

      if (formatter)
      {
        sections.push(formatter());
      }
    }

    return sections.filter( s => isValue(s) ).join(' ');
  }

  public getFeatureOutput(feature: DialectFeatures, value: any, out: DialectOutput): string
  {
    this.requireSupport(feature);

    const formatter = this.featureFormatter[feature];

    return formatter(value, this.transformer.transform, out);
  }

  public getFeaturesDescription(features: number): string[]
  {
    const out: string[] = [];
    let i = 0;

    while (features > 0)
    {
      if (features & 1)
      {
        out.push(DialectFeaturesDescription[i]);
      }

      i++;
      features >>= 1;
    }

    return out;
  }

  public requireSupport(features: number): void
  {
    if ((features & this.supports) !== features)
    {
      throw new Error(`The following features are all not supported by this dialect: ${this.getFeaturesDescription(features).join(', ')}`);
    }
  }

  public setSupports(supports: number): this
  {
    this.supports = supports;

    return this;
  }

  public addSupport(supports: number): this
  {
    this.supports = this.supports | supports;

    return this;
  }

  public removeSupport(supports: number): this
  {
    this.supports = this.supports & (~supports);

    return this;
  }

  public hasSupport(features: number): boolean
  {
    return (this.supports & features) === features;
  }

  public setResultParser<E extends Expr<any>>(type: ExprClass<E>, parser: (value: any, expr: E) => any): this
  {
    this.resultParser[type.id] = parser as any;

    return this;
  }

  public getResultParser<E extends Expr<any>>(expr: E): ((value: any) => any)
  {
    const parser = this.resultParser[expr.getKind()];

    if (!parser)
    {
      return (v) => v;
    }

    return (v) => parser(v, expr);
  }

  public getResult<E extends Expr<any>>(expr: E, result: any): any
  {
    return this.getResultParser(expr)(result);
  }

  public addReservedWords(words: string[]): this
  {
    for (const word of words)
    {
      this.reservedWords[word.toLowerCase()] = true;
    }

    return this;
  }

  public setDataTypeUnsupported(type: keyof DataTypeTypes): this
  {
    this.dataTypeFormatter[type] = () => 
    {
      throw new Error(`The type ${type} is not supported by this dialect.`);
    };

    return this;
  }

  public setDataTypeFormat(type: keyof DataTypeTypes, formats: Partial<Record<'tuple' | 'constant' | 'object', string>>): this
  {
    const constantType = formats.constant || type;
    const tupleCompiled = formats.tuple ? compileFormat(formats.tuple) : () => constantType;
    const objectCompiled = formats.object ? compileFormat(formats.object) : () => constantType;

    this.dataTypeFormatter[type] = (dataType) => 
    {
      let result = '';

      if (isString(dataType))
      {
        result = constantType;
      }
      else if (isArray(dataType))
      {
        result = tupleCompiled(dataType);
      }
      else
      {
        result = objectCompiled(dataType);
      }

      if (!result)
      {
        throw new Error(`The type ${JSON.stringify(dataType)} is not supported by this dialect.`)
      }

      return result;
    };

    return this;
  }

  public getValueFormatted(value: any, dataType?: DataTypeInputs): string
  {
    if (value === true)
    {
      return this.trueIdentifier;
    }
    else if (value === false)
    {
      return this.falseIdentifier;
    }
    else if (value === null || value === undefined)
    {
      return this.nullIdentifier;
    }

    const type = dataType || getDataTypeFromValue(value);
    const typeName = getDataTypeFromInput(type);
    const formatter = this.valueFormatterMap[typeName];
    const formatted = formatter ? formatter(value, this, type) : undefined;

    if (formatted !== undefined)
    {
      return formatted;
    }

    for (const formatter of this.valueFormatter)
    {
      const formatted = formatter(value, this, dataType);

      if (formatted !== undefined)
      {
        return formatted;
      }
    }

    throw new Error(`A value formatted does not exist for the value ${JSON.stringify(value)}`);
  }

  public getDataTypeString(type: DataTypeInputs): string
  {
    const key = getDataTypeFromInput(type);

    const formatter = this.dataTypeFormatter[key];

    if (formatter)
    {
      return formatter(type);
    }

    if (isString(type))
    {
      return type;
    }
    else if (isArray(type))
    {
      const typeName = type[0];

      if (typeName === 'NULL')
      {
        const nullableType = type[1] as DataTypeInputs;

        return `${this.getDataTypeString(nullableType)} ${this.dataTypeNullIdentifier}`;
      }
      else if (typeName === 'ARRAY')
      {
        this.requireSupport(DialectFeatures.ARRAYS);

        const element = type[1] as DataTypeInputs;
        const length = type[2] as number | undefined;

        return this.dataTypeArrayFormatter(this.getDataTypeString(element), length);
      }

      const args = type.slice(1);

      return `${typeName}(${args.join(', ')})`;
    }
    else if ('unsigned' in type)
    {
      this.requireSupport(DialectFeatures.UNSIGNED);
      
      const typeName = type.unsigned;
      const arg0 = (type as any).length || (type as any).totalDigits;
      const arg1 = (type as any).fractionDigits;
      
      if (arg0 !== undefined && arg1 !== undefined)
      {
        return `${typeName}(${arg0}, ${arg1}) ${this.dataTypeUnsignedIdentifier}`;
      }
      else if (arg0 !== undefined)
      {
        return `${typeName}(${arg0}) ${this.dataTypeUnsignedIdentifier}`;
      }
      else
      {
        return `${typeName} ${this.dataTypeUnsignedIdentifier}`;
      }
    }

    throw new Error(`The type ${JSON.stringify(type)} is not supported by this dialect.`)
  }

  public addReserved(reserved: string[]): this
  {
    for (const id of reserved)
    {
      this.reservedWords[id.toLowerCase()] = true;
    }

    return this;
  }

  public setValueQuote(input: DialectQuoteInput): this
  {
    this.valueQuoter = Dialect.quoter(input);

    return this;
  }

  public quoteValue(value: string): string
  {
    return this.valueQuoter(value, this);
  }
  
  public setAliasQuote(input: DialectQuoteInput): this
  {
    this.aliasQuoter = Dialect.quoter(input);

    return this;
  }

  public quoteAlias(alias: string): string
  {
    return !this.aliasQuotesOptional.test(alias) || this.reservedWords[alias.toLowerCase()]
      ? this.aliasQuoter(alias, this)
      : alias;
  }

  public setNameQuote(input: DialectQuoteInput): void
  {
    this.nameQuoter = Dialect.quoter(input);
  }

  public quoteName(name: string): string
  {
    return !this.nameQuotesOptional.test(name) || this.reservedWords[name.toLowerCase()]
      ? this.nameQuoter(name, this)
      : name;
  }

  public static quoter(input: DialectQuoteInput): DialectQuoteFormatter
  {
    if (isFunction(input)) 
    {
      return input;
    }

    if (isString(input))
    {
      input = [input, input + input];
    }

    const [quote, escape] = input;

    return (value) => quote + value.replace(new RegExp(escape, 'g'), quote) + quote;
  }

  public static FormatString: DialectValueFormatter = (value, dialect) => 
  {
    return isString(value) ? dialect.quoteValue(value) : undefined;
  };

  public static FormatNull: DialectValueFormatter = (value, dialect) => 
  {
    return value === null ? dialect.nullIdentifier : undefined;
  };

  public static FormatBoolean: DialectValueFormatter = (value, dialect) => 
  {
    return isBoolean(value) ? value ? dialect.trueIdentifier : dialect.falseIdentifier : undefined;
  };

  public static FormatDate: DialectValueFormatter = (value, dialect) => 
  {
    if (value instanceof Date) 
    {
      const iso = value.toISOString();

      if (value.getHours() === 0 && value.getMinutes() === 0) 
      {
        return iso.substring(0, 10);
      } 
      else 
      {
        return iso.substring(0, 10) + ' ' + iso.substring(11, 19);
      }
    }
  };
  
  public static FormatNumber: DialectValueFormatter = (value, dialect) => 
  {
    return isNumber(value) ? value.toString() : undefined;
  };

}
