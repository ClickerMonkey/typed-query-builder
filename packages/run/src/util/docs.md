

//
// PERFORMANCE IMPROVEMENTS
//
// 1. if no distinct: order, paging, selects
// 2. if distinct on: order, calculate distinct on and ignore duplicates, paging, selects
// 3. if distinct: selects, order, paging
// 4. if select has aggregate selects (without windows) it produces a single result, so we can't use shortcuts above.
// 5. cache reused expression values


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



