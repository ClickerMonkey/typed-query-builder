
export * from './overrides';
export * from './util';
export * from './Transformers';
export * from './Functions';
export * from './Criteria';

import './exprs/Aggregate';
import './exprs/Between';
import './exprs/Case';
import './exprs/Cast';
import './exprs/Constant';
import './exprs/Deep';
import './exprs/Default';
import './exprs/Exists';
import './exprs/Field';
import './exprs/Function';
import './exprs/In';
import './exprs/Not';
import './exprs/Null';
import './exprs/OperationBinary';
import './exprs/OperationUnary';
import './exprs/Param';
import './exprs/PredicateBinary';
import './exprs/PredicateBinaryList';
import './exprs/PredicateUnary';
import './exprs/Predicates';
import './exprs/Raw';
import './exprs/Row';
import './exprs/Select';



/*
RunTransformers.setTransformer(
  QuerySelect, 
  (v, transform) => {
    const handler = handleQuery(v, transform);
    const selects = {};
    for (const selectAlias in v._criteria.selects) {
      selects[selectAlias] = transform(v._criteria.selects[selectAlias]);
    }

    return (sources, params) => {
      const state = handler(sources, params);
      let page = state.groups;

      // https://www.postgresql.org/docs/13/sql-select.html#id-1.9.3.171.7
      // TODO DISTINCT or DISTINCT ON

      if (isNumber(v._offset)) {
        page = page.slice(v._offset);
      }
      if (isNumber(v._limit)) {
        page = page.slice(0, v._limit);
      }

      return page.map((group) => {
        state.group = v._groupBy.length > 0 ? group : state.rows;
        state.row = group[0];

        return buildSelection(sources, params, state, selects);
      });
    };
  }
);

RunTransformers.setTransformer(
  QueryFirst, 
  (v, transform) => {
    const handler = handleQuery(v, transform);
    const selects = {};
    for (const selectAlias in v._selects) {
      selects[selectAlias] = transform(v._selects[selectAlias]);
    }

    return (sources, params) => {
      const state = handler(sources, params);

      state.group = v._groupBy.length > 0 ? state.groups[0] : state.rows;
      state.row = v._groupBy.length > 0 ? state.group[0] : state.rows[0];

      return buildSelection(sources, params, state, selects);
    };
  }
);

RunTransformers.setTransformer(
  QueryExistential, 
  (v, transform) => {
    const handler = handleQuery(v, transform);

    return (sources, params) => {
      const state = handler(sources, params);

      return state.groups.length > 0;
    };
  }
);

RunTransformers.setTransformer(
  QueryList, 
  (v, transform) => {
    const item = transform(v.item);
    const handler = handleQuery(v, transform);

    return (sources, params) => {
      const state = handler(sources, params);
      let page = state.groups;

      if (isNumber(v._offset)) {
        page = page.slice(v._offset);
      }
      if (isNumber(v._limit)) {
        page = page.slice(0, v._limit);
      }

      return page.map((group) => {
        state.group = group;
        state.row = group[0];

        return item(sources, params, state);
      });
    };
  }
);

RunTransformers.setTransformer(
  QueryFirstValue, 
  (v, transform) => {
    const item = transform(v.value);
    const handler = handleQuery(v, transform);

    return (sources, params) => {
      const state = handler(sources, params);

      state.group = v._groupBy.length > 0 ? state.groups[0] : state.rows;
      state.row = v._groupBy.length > 0 ? state.group[0] : state.rows[0];

      return item(sources, params, state);
    };
  }
);
*/

//
// PERFORMANCE IMPROVEMENTS
//
// 1. if no distinct: order, paging, selects
// 2. if distinct on: order, calculate distinct on and ignore duplicates, paging, selects
// 3. if distinct: selects, order, paging
// 4. if select has aggregate selects (without windows) it produces a single result, so we can't use shortcuts above.
// 5. cache reused expression values


//
// NOTES
//
// 1. for window functions, we create RunTransformerResult[][] where each element is a partition or ordered rows

//
// ORDER OF OPERATIONS
//
// withs
  // DO: run each expression, save as temporary source
// froms
  // DO: initial from defines sources, each subsequent one is like a full join
// joins
  // DO: each one is a join of the defined type
// where
  // DO: remove rows that don't pass condition
// group by & having
  // DO: generate groups
  // DO: remove groups that don't pass condition
// calculate selects
  // apply windows, for each aggregate with a custom window and each defined window - calculate those selects
    // when order by is specified, window frame is by default from start to last row that has same value as current row based on orderBy
    // when order is not specified, window frame is complete partition
  // terms
    // partition = rows with same partition by value
    // window frame = window defines start and end of frame (default start=1, end=last peer of current)
    // peers = rows with same order by value in partition, without order by no peers
  // window functions
    // rowNumber = number of current row within partition, starting at 1
    // rank = rowNumber of first row in peer group (peer group is rows with same orderby value)
    // denseRank = counts peer groups in partition (how many unique orderby values) (1=group with same order by, 2=next, 3...)
    // percentRank = (rank - 1) / (total partition rows - 1)
    // cumeDist = (number of partition rows preceding or peers with current row) / (total partition rows)
    // ntile(buckets) = floor((rowNumber - 1) / ceil(group.length / buckets)) + 1
    // lag(value, offset=1, default=NULL) = value of row offset rows before in partition
    // lead(value, offset=1, default=NULL) = value of row offset rows after in partition
    // firstValue(value) = value of first row in window frame
    // lastValue(value) = value of last row in window frame
    // nthValue(value, n) = value of row that is the nth row of the window frame (start at 1), NULL if no row
  // window without partition is full results (ie: count(*) over ())
// distinct & distinct on
// order by
  // take order by exprs that are aggregates over windows, order by window name, compute results
// limit & offset

