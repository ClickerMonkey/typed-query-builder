import { QueryWindow, WindowFrameExclusion } from '@typed-query-builder/builder';
import { DialectOutput } from '../Output';
import { getOrder } from './Order';


export function getWindow(win: QueryWindow<string, {}, [], string>, out: DialectOutput): string
{
  const { _partitionBy, _orderBy, _mode, _exclusion, _endOffset, _endUnbounded, _startOffset, _startUnbounded } = win;

  let x = '';

  if (_partitionBy && _partitionBy.length > 0)
  {
    x += 'PARTITION BY ' + _partitionBy.map( p => out.wrap(p) ).join(', ');
  }

  if (_orderBy && _orderBy.length > 0)
  {
    x += ' ORDER BY ' + _orderBy.map( (o) => getOrder(o, out) ).join(', ');
  }

  if (_mode !== QueryWindow.DEFAULT_MODE || 
      _exclusion !== QueryWindow.DEFAULT_EXCLUSION || 
      _endOffset !== QueryWindow.DEFAULT_END_OFFSET ||
      _endUnbounded !== QueryWindow.DEFAULT_END_UNBOUNDED ||
      _startOffset !== QueryWindow.DEFAULT_START_OFFSET ||
      _startUnbounded !== QueryWindow.DEFAULT_START_UNBOUNDED)
  {
    x += ` ${_mode} `;

    if (_endOffset !== QueryWindow.DEFAULT_END_OFFSET || _endUnbounded !== QueryWindow.DEFAULT_END_UNBOUNDED)
    {
      x += 'BETWEEN ';
    }

    x += getFramePoint(_startUnbounded, _startOffset);

    if (_endOffset !== QueryWindow.DEFAULT_END_OFFSET || _endUnbounded !== QueryWindow.DEFAULT_END_UNBOUNDED)
    {
      x += ' AND ';
      x += getFramePoint(_endUnbounded, _endOffset);
    }

    if (_exclusion !== QueryWindow.DEFAULT_EXCLUSION)
    {
      x += getFrameExclusion(_exclusion);
    }
  }

  return x;
}

export function getFramePoint(unbounded: boolean, offset: number): string
{
  return unbounded
    ? offset < 0
      ? 'UNBOUNDED PRECEDING'
      : offset > 0
        ? 'UNBOUNDED FOLLOWING'
        : 'CURRENT ROW'
    : offset < 0
      ? `${-offset} PRECEDING`
      : offset > 0
        ? `${offset} FOLLOWING`
        : 'CURRENT ROW';
}

export function getFrameExclusion(exclusion: WindowFrameExclusion): string
{
  return `EXCLUDE ${exclusion}`;
}
