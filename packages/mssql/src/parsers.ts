import { isArray, isString, isValue, QueryFirst, QueryFirstValue, QueryJson, QueryList, QuerySelect } from '@typed-query-builder/builder';
import { DialectMssql } from '@typed-query-builder/sql-mssql';


DialectMssql.setResultParser(QueryJson, (result, q) => 
{
  if (isString(result)) 
  {
    result = JSON.parse(result);
  }

  if (isValue(result)) 
  {
    result = DialectMssql.getResult(q.json, result);
  }

  return result;
});

DialectMssql.setResultParser(QuerySelect, (records, q) => 
{
  for (const record of records) 
  {
    for (const select of q._criteria.selects)
    {
      if (isValue(record[select.alias]))
      {
        record[select.alias] = DialectMssql.getResult(select.getExpr(), record[select.alias]);
      }
    }
  }

  return records;
});

DialectMssql.setResultParser(QueryFirst, (record, q) => 
{
  if (record)
  {
    for (const select of q.criteria.selects)
    {
      if (isValue(record[select.alias]))
      {
        record[select.alias] = DialectMssql.getResult(select.getExpr(), record[select.alias]);
      }
    }
  }

  return record;
});

DialectMssql.setResultParser(QueryFirstValue, (result, q) => 
{
  if (isValue(result))
  {
    result = DialectMssql.getResult(q.value, result);
  }

  return result;
});

DialectMssql.setResultParser(QueryList, (result, q) => 
{
  if (isArray(result))
  {
    result = result.map((item) => DialectMssql.getResult(q.item, item));
  }

  return result;
});