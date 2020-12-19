import { Transformer, Expr, isString, isFunction } from '@typed-query-builder/builder';


interface DialectTransformFunction<T> {
  (params?: Record<string, any>, dialect: Dialect): T;
}
interface DialectTransformTransformer{
  <T>(value: Expr<T>): DialectTransformFunction<T>;
}

type DialectQuoteFormatter = (value: string, dialect: Dialect) => string;

type DialectQuoteInput = string | [string, string] | DialectQuoteFormatter;

type DialectValueFormatter = (value: any, dialect: Dialect) => string | undefined;

export class Dialect
{

  public transformer: Transformer<DialectTransformTransformer>;
  public valueQuoter: DialectQuoteFormatter;
  public aliasQuoter: DialectQuoteFormatter;
  public aliasQuoteAlways: boolean;
  public nameQuoter: DialectQuoteFormatter;
  public nameQuoteAlways: boolean;
  public reservedWords: Record<string, boolean>;
  public valueFormatter: DialectValueFormatter[];


  public constructor(){ 
    this.transformer = new Transformer();
    this.valueQuoter = Dialect.quoter(["'", "''"]);
    this.aliasQuoter = Dialect.quoter(['"', '""']);
    this.aliasQuoteAlways = false;
    this.nameQuoter = Dialect.quoter(['"', '""']);
    this.nameQuoteAlways = false;
    this.reservedWords = {};
    this.valueFormatter = [
      Dialect.FormatString,
      Dialect.FormatDate,
    ];
  }

  public setValueQuote(input: DialectQuoteInput): void
  {
    this.valueQuoter = Dialect.quoter(input);
  }

  public quoteValue(value: string): string
  {
    return this.valueQuoter(value, this);
  }
  
  public setAliasQuote(input: DialectQuoteInput): void
  {
    this.aliasQuoter = Dialect.quoter(input);
  }

  public quoteAlias(alias: string): string
  {
    return this.aliasQuoteAlways || this.reservedWords[alias]
      ? this.aliasQuoter(alias, this)
      : alias;
  }

  public setNameQuote(input: DialectQuoteInput): void
  {
    this.nameQuoter = Dialect.quoter(input);
  }

  public quoteName(alias: string): string
  {
    return this.nameQuoteAlways || this.reservedWords[alias]
      ? this.nameQuoter(alias, this)
      : alias;
  }

  public static quoter(input: DialectQuoteInput): DialectQuoteFormatter
  {
    if (isFunction(input)) {
      return input;
    }

    if (isString(input)) {
      input = [input, input + input];
    }

    const [quote, escape] = input;

    return (value) => quote + value.replace(new RegExp(escape, 'g'), quote) + quote;
  }


  public static FormatString: DialectValueFormatter = (value, dialect) => {
    return isString(value) ? dialect.quoteValue(value) : undefined;
  };

  public static FormatDate: DialectValueFormatter = (value, dialect) => {
    if (value instanceof Date) {
      const iso = value.toISOString();
      if (value.getHours() === 0 && value.getMinutes() === 0) {
        return iso.substring(0, 10);
      } else {
        return iso.substring(0, 10) + ' ' + iso.substring(11, 19);
      }
    }
  };

}


 