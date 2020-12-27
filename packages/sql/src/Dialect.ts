import { 
  Transformer, Expr, isString, isFunction, DataTypeTypes, DataTypeInputs, OperationUnaryType, GroupingSetType, InsertPriority, 
  JoinType, LockRowLock, LockStrength, OperationBinaryType, OrderDirection, PredicateBinaryListPass, PredicateBinaryListType, 
  PredicateBinaryType, PredicateRowType, PredicatesType, PredicateUnaryType, SetOperation, WindowFrameExclusion, WindowFrameMode, 
  mapRecord, isArray, isBoolean 
} from '@typed-query-builder/builder';

import { DialectFeatures, DialectFeaturesDescription } from './Features';
import { compileFormat } from './fns';
import { DialectOutput, DialectOutputOptions } from './Output';


export interface DialectTransformTransformer {
  <T>(value: Expr<T>, out: DialectOutput): string;
}

export type DialectQuoteFormatter = (value: string, dialect: Dialect) => string;

export type DialectQuoteInput = string | [string, string] | DialectQuoteFormatter;

export type DialectValueFormatter = (value: any, dialect: Dialect, dataType?: DataTypeInputs) => string | undefined;

export type DialectDataTypeFormatter = (type: DataTypeInputs) => string;

export type DialectFunctionFormatter = (args: string[]) => string;

export type DialectMap<T extends string, V = string> = Partial<Record<T, V>>;

export type DialectFeatureFormatter = (value: any, transform: DialectTransformTransformer, out: DialectOutput) => string


export class Dialect
{

  public transformer: Transformer<DialectTransformTransformer, [DialectOutput]>;
  public valueQuoter: DialectQuoteFormatter;
  public aliasQuoter: DialectQuoteFormatter;
  public aliasQuoteAlways: boolean;
  public nameQuoter: DialectQuoteFormatter;
  public nameQuoteAlways: boolean;
  public reservedWords: Record<string, boolean>;
  public valueFormatter: DialectValueFormatter[];
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
  public operationUnaryAlias: DialectMap<OperationUnaryType>;
  public operationBinaryAlias: DialectMap<OperationBinaryType>;
  public predicateUnaryAlias: DialectMap<PredicateUnaryType>;
  public predicateBinaryAlias: DialectMap<PredicateBinaryType>;
  public predicateTypesAlias: DialectMap<PredicatesType>;
  public joinTypeAlias: DialectMap<JoinType>;
  public orderDirectionAlias: DialectMap<OrderDirection>;
  public setOperationAlias: DialectMap<SetOperation>;
  public predicateBinaryListAlias: DialectMap<PredicateBinaryListType>;
  public predicateBinaryListPassAlias: DialectMap<PredicateBinaryListPass>;
  public predicateRowAlias: DialectMap<PredicateRowType>;
  public windowFrameModeAlias: DialectMap<WindowFrameMode>;
  public windowFrameExclusionAlias: DialectMap<WindowFrameExclusion>;
  public groupingSetAlias: DialectMap<GroupingSetType>;
  public insertPriorityAlias: DialectMap<InsertPriority>;
  public lockStrengthAlias: DialectMap<LockStrength>;
  public lockRowAlias: DialectMap<LockRowLock>;
  public functionsFormatter: DialectMap<string, DialectFunctionFormatter>;
  public featureFormatter: Record<DialectFeatures, DialectFeatureFormatter>;
  public supports: number;

  public constructor()
  {
    this.transformer = new Transformer();
    this.valueQuoter = Dialect.quoter(["'", "''"]);
    this.aliasQuoter = Dialect.quoter(['"', '""']);
    this.nameQuoter = Dialect.quoter(['"', '""']);
    this.dataTypeUnsignedIdentifier = 'UNSIGNED';
    this.dataTypeNullIdentifier = 'NULL';
    this.dataTypeArrayFormatter = (element, length) => `${element} ARRAY[${length || ''}]`;
    this.aliasQuoteAlways = false;
    this.nameQuoteAlways = false;
    this.dataTypeFormatter = {};
    this.reservedWords = {};
    this.operationUnaryAlias = {};
    this.operationBinaryAlias = {};
    this.predicateUnaryAlias = {};
    this.predicateBinaryAlias = {};
    this.predicateTypesAlias = {};
    this.joinTypeAlias = {};
    this.orderDirectionAlias = {};
    this.setOperationAlias = {};
    this.predicateBinaryListAlias = {};
    this.predicateBinaryListPassAlias = {};
    this.predicateRowAlias = {};
    this.windowFrameModeAlias = {};
    this.windowFrameExclusionAlias = {};
    this.groupingSetAlias = {};
    this.insertPriorityAlias = {};
    this.lockStrengthAlias = {};
    this.lockRowAlias = {};
    this.functionsFormatter = {};
    this.valueFormatter = [];
    this.featureFormatter = {};
    this.paramOffset = 1;
    this.paramPrefix = '$';
    this.paramSuffix = '';
    this.trueIdentifier = 'TRUE';
    this.falseIdentifier = 'FALSE';
    this.nullIdentifier = 'NULL';
    this.supports = DialectFeatures.ALL;
  }

  public output(options: DialectOutputOptions = {})
  {
    return (e: Expr<any>): DialectOutput => 
    {
      const out = new DialectOutput(this, options);

      try
      {
        out.query = this.transformer.transform(e, out);
      }
      catch (e)
      {
        if (options.throwError)
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

  public getAlias<K extends string>(map: DialectMap<K>, key: K): string 
  {
    if (map[key] === '') 
    {
      throw new Error(`The ${key} identifier is not supported by this dialect.`);
    }

    return map[key] as string || key;
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
    const tupleCompiled = formats.tuple ? compileFormat(formats.tuple) : () => '';
    const objectCompiled = formats.object ? compileFormat(formats.object) : () => '';

    this.dataTypeFormatter[type] = (dataType) => 
    {
      let result = '';

      if (isString(dataType))
      {
        result = formats.constant || dataType;
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
    else if (isString(value))
    {
      return this.quoteValue(value);
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
    const key = isString(type)
      ? type
      : isArray(type)
        ? type[0]
        : 'unsigned' in type
          ? type.unsigned
          : type.timezoned;

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

  public setFunctionUnsupported(func: string): this
  {
    this.functionsFormatter[func] = undefined;

    return this;
  }

  public setFunctionAlias(func: string, alias: string): this
  {
    this.functionsFormatter[func] = (args) => `${alias}(${args.join(', ')})`;

    return this;
  }

  public setFunctionFormat(func: string, format: string): this
  {
    const compiled = compileFormat(format);

    this.functionsFormatter[func] = (args) => compiled(args);

    return this;
  }

  public setFunctionFormatByArgCount(func: string, formats: Record<number | '*', string>): this
  {
    const compiled = mapRecord(formats, (value) => compileFormat(value));

    this.functionsFormatter[func] = (args) => 
    {
      const byArgCount = compiled[args.length];

      if (byArgCount) 
      {
        return byArgCount(args);
      }

      const all = compiled['*'];

      if (all) 
      {
        return all(args);
      }

      throw new Error(`Function ${func} with the given number of arguments is not supported.`);
    };

    return this;
  }

  public setFunctionFormatter(func: string, formatter: DialectFunctionFormatter): this
  {
    this.functionsFormatter[func] = formatter;

    return this;
  }

  public getFunctionString(func: string, args: string[], prefix: string = '', suffix: string = ''): string
  {
    const format = this.functionsFormatter[func];

    return format ? format(args) : `${func}(${prefix}${args.join(', ')}${suffix})`;
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
    return this.aliasQuoteAlways || this.reservedWords[alias.toLowerCase()]
      ? this.aliasQuoter(alias, this)
      : alias;
  }

  public setNameQuote(input: DialectQuoteInput): void
  {
    this.nameQuoter = Dialect.quoter(input);
  }

  public quoteName(alias: string): string
  {
    return this.nameQuoteAlways || this.reservedWords[alias.toLowerCase()]
      ? this.nameQuoter(alias, this)
      : alias;
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

}
