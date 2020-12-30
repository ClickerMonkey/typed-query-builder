import { Expr, QueryGroup } from '@typed-query-builder/builder';
import { DialectTransformTransformer } from '../Dialect';
import { DialectOutput } from '../Output';


export function getGroup(group: QueryGroup<any>, selectsExprs: Record<string, Expr<any>>, transform: DialectTransformTransformer, out: DialectOutput): string
{
  if (group.type === 'BY')
  {
    return group.expressions[0].map( e => transform( selectsExprs[e], out ) ).join(', ')
  }
  
  let x = '';

  x += group.type;
  x += ' (';
  
  x += group.expressions.map( group => 
    '(' + group.map( e => transform(selectsExprs[e], out) ).join(', ') + ')'
  ).join(', ');
  
  x += ')';

  return x;
}