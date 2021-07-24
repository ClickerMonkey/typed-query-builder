import { isArray, isString, isValue, QueryFirst, QueryFirstValue, QueryJson, QueryList, QuerySelect } from '@typed-query-builder/builder';
import { DialectPgsql } from '@typed-query-builder/sql-pgsql';


DialectPgsql.setResultParser(QueryJson, (result, q) => 
{
  if (isString(result)) 
  {
    result = JSON.parse(result);
  }

  if (isValue(result)) 
  {
    result = DialectPgsql.getResult(q.json, result);
  }

  return result;
});

DialectPgsql.setResultParser(QuerySelect, (records, q) => 
{
  for (const record of records) 
  {
    for (const select of q._criteria.selects)
    {
      if (isValue(record[select.alias]))
      {
        record[select.alias] = DialectPgsql.getResult(select.getExpr(), record[select.alias]);
      }
    }
  }

  return records;
});

DialectPgsql.setResultParser(QueryFirst, (record, q) => 
{
  if (record)
  {
    for (const select of q.criteria.selects)
    {
      if (isValue(record[select.alias]))
      {
        record[select.alias] = DialectPgsql.getResult(select.getExpr(), record[select.alias]);
      }
    }
  }

  return record;
});

DialectPgsql.setResultParser(QueryFirstValue, (result, q) => 
{
  if (isValue(result))
  {
    result = DialectPgsql.getResult(q.value, result);
  }

  return result;
});

DialectPgsql.setResultParser(QueryList, (result, q) => 
{
  if (isArray(result))
  {
    result = result.map((item) => DialectPgsql.getResult(q.item, item));
  }

  return result;
});