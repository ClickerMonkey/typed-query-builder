

export function compileFormat(format: string)
{
  const SECTION_TYPES = 2;
  const SECTION_INDEX_CONSTANT = 0;

  const sections = format.split(/[\{\}]/).map((section, index) => {
    return index % SECTION_TYPES === SECTION_INDEX_CONSTANT
      ? (_source: any) => section
      : (source: any) => source && section in source ? source[section] : '';
  });

  return (params: any) =>
  {
    return params
        ? sections.reduce((out, section) => out + section(params), '')
        : '';
  };
}