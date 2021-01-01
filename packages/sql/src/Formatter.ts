import { compileFormat, isValue } from '@typed-query-builder/builder';


export type DialectFormatterParams = Record<string, any>;

export type DialectFormatterFunction<P extends DialectFormatterParams> = (params: Partial<P>) => string;

export class DialectFormatter<K extends string, P extends DialectFormatterParams>
{

  public defaultFormat: string;
  public paramDefaults: P;
  public paramKey: keyof P;
  public defaultFormatter: DialectFormatterFunction<P>;
  public formats: Partial<Record<K, DialectFormatterFunction<P>>>;
  public unsupported: Partial<Record<K, boolean>>;

  public constructor(
    defaultFormat: string,
    paramNames: Array<keyof P>,
    paramKey: keyof P,
  ) {
    this.defaultFormat = defaultFormat;
    this.paramDefaults = paramNames.reduce((out, param) => (out[param] = '{' + param + '}', out), Object.create(null));
    this.paramKey = paramKey;
    this.defaultFormatter = compileFormat(defaultFormat);
    this.formats = {};
    this.unsupported = {};
  }

  public setUnsupported<Keys extends K>(keys: Keys[]): this
  {
    for (const key of keys)
    {
      this.unsupported[key] = true;
    }

    return this;
  }

  public setDefaultFormat(format: string): this
  {
    this.defaultFormat = format;
    this.defaultFormatter = compileFormat(format);

    return this;
  }

  public alias<Key extends K>(key: Key, alias: string): this
  {
    this.formats[key] = compileFormat(this.defaultFormatter({
      ...this.paramDefaults,
      [this.paramKey]: alias
    }));

    return this;
  }

  public aliases<Keys extends K>(aliases: Record<Keys, string>): this
  {
    for (const key in aliases)
    {
      this.alias(key, aliases[key]);
    }

    return this;
  }

  public setFormat<Key extends K>(key: Key, format: string): this
  {
    this.formats[key] = compileFormat(format);

    return this;
  }

  public setFormats<Keys extends K>(formats: Record<Keys, string>): this
  {
    for (const key in formats)
    {
      this.setFormat(key, formats[key]);
    }

    return this;
  }

  public setCascading<Key extends K>(key: Key, formats: [keyof P | '*', string][]): this
  {
    const compiled: [keyof P | '*', (params: Partial<P>) => string][] = formats.map(([param, format]) => [param, compileFormat(format)]);

    this.formats[key] = (params) =>
    {
      for (const [param, paramCompiled] of compiled)
      {
        if (isValue(params[param]) || param === '*')
        {
          return paramCompiled(params);
        }
      }

      return this.get(key, params);
    };

    return this;
  }

  public setCascadings<Keys extends K>(formats: Record<Keys, [keyof P | '*', string][]>): this
  {
    for (const key in formats)
    {
      this.setCascading(key, formats[key]);
    }

    return this;
  }

  public set<Key extends K>(key: Key, formatter: DialectFormatterFunction<P>): this
  {
    this.formats[key] = formatter;

    return this;
  }

  public sets<Keys extends K>(formatters: Record<Keys, DialectFormatterFunction<P>>): this
  {
    for (const key in formatters)
    {
      this.set(key, formatters[key]);
    }

    return this;
  }

  public get<Key extends K>(key: Key, params?: Partial<P>): string
  {
    if (this.unsupported[key])
    {
      throw new Error(`The following feature is not supported in the current dialect: ${key}`);
    }

    const formatter = (this.formats[key] || this.defaultFormatter) as DialectFormatterFunction<P>;
    const formatParams: Partial<P> = {};

    if (params)
    {
      Object.assign(formatParams, params);
    }

    if (!(this.paramKey in formatParams))
    {
      formatParams[this.paramKey] = key as any;
    }

    return formatter(formatParams);
  }

}