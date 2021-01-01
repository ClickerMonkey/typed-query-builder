import { 
  Transformer, Expr, isString, isFunction, DataTypeTypes, DataTypeInputs, OperationUnaryType, GroupingSetType, InsertPriority, 
  JoinType, LockRowLock, LockStrength, OperationBinaryType, OrderDirection, PredicateBinaryListType, 
  PredicateBinaryType, PredicateRowType, PredicatesType, PredicateUnaryType, SetOperation, WindowFrameExclusion, WindowFrameMode, 
  isArray, isBoolean, compileFormat, isNumber, AggregateFunctions, getDataTypeFromValue, getDataTypeFromInput, Functions
} from '@typed-query-builder/builder';

import { DialectFeatures, DialectFeaturesDescription } from './Features';
import { DialectFormatter } from './Formatter';
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

export type DialectParamsOperationUnary = Record<'op' | 'value', string>;

export type DialectParamsOperationBinary = Record<'first' | 'op' | 'second', string>;

export type DialectParamsPredicateUnary = Record<'op' | 'value', string>;

export type DialectParamsPredicateBinary = Record<'first' | 'op' | 'second', string>;

export type DialectParamsPredicateBinaryList = Record<'first' | 'op' | 'pass' | 'second', string>;

export type DialectParamsPredicateRow = Record<'first' | 'op' | 'second' | number, string>;

export type DialectParamsAggregate = Record<'name' | 'args' | 'distinct' | 'order' | 'over' | 'filter' | number, string> & Record<'argCount', number> & Record<'argList', string[]>;

export type DialectParamsFunction = Record<'name' | 'args' | number, string> & Record<'argCount', number> & Record<'argList', string[]>;

export type DialectParamsNamed = Record<'name', string>;


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
  public selectOffsetOnly: (params: { offset: number }) => string;
  public selectLimitOnly: (params: { limit: number }) => string;
  public selectOffsetLimit: (params: { offset: number, limit: number }) => string;
  
  public functionsUpper: boolean;
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

  public addReservedWords(words: string[]): this
  {
    for (const word of words)
    {
      this.reservedWords[word] = true;
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
