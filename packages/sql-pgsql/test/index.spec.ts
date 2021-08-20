import { exprs, table, from, DataTypePoint, insert, deletes, update, DataTemporal as Temporal, DataInterval, DataTemporal } from '@typed-query-builder/builder';
import { DialectPgsql } from '../src';
import { expectText, sql, sqlWithOptions } from './helper';


describe('index', () =>
{

  const Task = table({
    name: 'task',
    fields: {
      id: 'INT',
      name: 'TEXT',
      done: 'BOOLEAN',
      doneAt: ['NULL', 'DATE'],
    },
  });

  const SubTask = table({
    name: 'subtask',
    fields: {
      id: 'INT',
      name: 'TEXT',
      parentId: 'INT'
    },
  });

  it('param', () => 
  {
    const x = exprs().param('userId').run(sql);

    expectText({ ignoreCase: true, condenseSpace: true }, x, `
      SELECT $1
    `);
  });

  it('true', () => 
  {
    const x = exprs().constant(true).run(sql);

    expectText({ ignoreCase: true, condenseSpace: true }, x, `
      SELECT true
    `);
  });

  it('false', () => 
  {
    const x = exprs().constant(false).run(sql);

    expectText({ ignoreCase: true, condenseSpace: true }, x, `
      SELECT false
    `);
  });

  it('predicate binary !=', () => 
  {
    const x = exprs().is(1, '!=', 2).run(sql);

    expectText({ ignoreCase: true, condenseSpace: true }, x, `
      SELECT 1 <> 2
    `);
  });

  it('operation binary bitwise', () => 
  {
    const x = exprs().op(1, 'BITAND', 2).run(sql);

    expectText({ ignoreCase: true, condenseSpace: true }, x, `
      SELECT 1 & 2
    `);
  });

  it('operation binary bitleft', () => 
  {
    const x = exprs().op(1, 'BITLEFT', 2).run(sql);

    expectText({ ignoreCase: true, condenseSpace: true }, x, `
      SELECT 1 << 2
    `);
  });

  it('operation unary bitnot', () => 
  {
    const x = exprs().op(1, 'BITNOT').run(sql);

    expectText({ ignoreCase: true, condenseSpace: true }, x, `
      SELECT ~1
    `);
  });

  it('predicate unary true', () => 
  {
    const x = exprs().isTrue(false).run(sql);

    expectText({ ignoreCase: true, condenseSpace: true }, x, `
      SELECT false
    `);
  });

  it('predicate unary false', () => 
  {
    const x = exprs().isFalse(false).run(sql);

    expectText({ ignoreCase: true, condenseSpace: true }, x, `
      SELECT false is false
    `);
  });

  it('select string aggregation', () => 
  {
    const x = from(Task)
      .select(({ task }, { aggregate }) => [
        aggregate('string', task.name, ',').order(task.name, 'ASC').as('names')
      ])
      .run(sqlWithOptions({ simplifyReferences: true }))
    ;

    expectText({ ignoreCase: true, condenseSpace: true }, x, `
      SELECT 
        STRING_AGG("name", ',' ORDER BY "name" ASC) AS "names"
      FROM task
    `);
  });

  it('cast boolean', () =>
  {
    const x = exprs().cast('BOOLEAN', 1).run(sql);

    expectText({ ignoreCase: true, condenseSpace: true }, x, `
      SELECT CAST(1 AS boolean)
    `);
  });

  it('cast mediumint default', () =>
  {
    const x = exprs().cast('MEDIUMINT', 1).run(sql);

    expectText({ ignoreCase: true, condenseSpace: true }, x, `
      SELECT CAST(1 AS INT)
    `);
  });

  it('cast mediumint length', () =>
  {
    const x = exprs().cast(['MEDIUMINT', 2], 1).run(sql);

    expectText({ ignoreCase: true, condenseSpace: true }, x, `
      SELECT CAST(1 AS INT)
    `);
  });

  it('constant boolean', () =>
  {
    const x = exprs().constant(true, 'BOOLEAN').run(sql);

    expectText({ ignoreCase: true, condenseSpace: true }, x, `
      SELECT true
    `);
  });

  it('constant int', () =>
  {
    const x = exprs().constant(14.34, 'INT').run(sql);

    expectText({ ignoreCase: true, condenseSpace: true }, x, `
      SELECT 14
    `);
  });

  it('constant float', () =>
  {
    const x = exprs().constant(14.34, 'FLOAT').run(sql);

    expectText({ ignoreCase: true, condenseSpace: true }, x, `
      SELECT 14.34
    `);
  });

  it('constant decimal with fraction digits', () =>
  {
    const x = exprs().constant(14.34, ['DECIMAL', 10, 1]).run(sql);

    expectText({ ignoreCase: true, condenseSpace: true }, x, `
      SELECT 14.3
    `);
  });

  /*
  it('constant nvarchar', () =>
  {
    const x = exprs().constant('Hello World!', ['NVARCHAR', 10]).run(sql);

    expectText({ ignoreCase: true, condenseSpace: true }, x, `
      SELECT N'Hello World!'
    `);
  });
  */

  it('constant timestamp', () =>
  {
    const x = Temporal.fromText('2020-01-03 18:43:00').run(sql);

    expectText({ ignoreCase: true, condenseSpace: true }, x, `
      SELECT '2020-01-03 18:43:00'::timestamp
    `);
  });

  it('constant date', () =>
  {
    const x = Temporal.fromText('2020-01-03').run(sql);

    expectText({ ignoreCase: true, condenseSpace: true }, x, `
      SELECT '2020-01-03'::date
    `);
  });

  it('constant time', () =>
  {
    const x = Temporal.fromText('18:43:00').run(sql);

    expectText({ ignoreCase: true, condenseSpace: true }, x, `
      SELECT '18:43:00'::time
    `);
  });

  it('constant point explicit', () =>
  {
    const x = exprs().constant({x: 1, y: 2}, 'POINT').run(sql);

    expectText({ ignoreCase: true, condenseSpace: true }, x, `
      SELECT point(1, 2)
    `);
  });

  it('constant point implicit', () =>
  {
    const x = exprs().constant({x: 1, y: 2}).run(sql);

    expectText({ ignoreCase: true, condenseSpace: true }, x, `
      SELECT point(1, 2)
    `);
  });

  it('constant point deep', () =>
  {
    const { deep, param } = exprs();

    const x = deep({x: param('x'), y: 2}).run(sql);

    expectText({ ignoreCase: true, condenseSpace: true }, x, `
      SELECT point($1, 2)
    `);
  });

  it('constant segment explicit', () =>
  {
    const x = exprs().constant({x1: 1, y1: 2, x2: 3, y2: 4}, 'SEGMENT').run(sql);

    expectText({ ignoreCase: true, condenseSpace: true }, x, `
      SELECT lseg('[(1, 2), (3, 4)]')
    `);
  });

  it('constant segment implicit', () =>
  {
    const x = exprs().constant({x1: 1, y1: 2, x2: 3, y2: 4}).run(sql);

    expectText({ ignoreCase: true, condenseSpace: true }, x, `
      SELECT lseg('[(1, 2), (3, 4)]')
    `);
  });

  it('constant circle explicit', () =>
  {
    const x = exprs().constant({x: 1, y: 2, r: 3}, 'CIRCLE').run(sql);

    expectText({ ignoreCase: true, condenseSpace: true }, x, `
      SELECT circle('<(1, 2), 3>')
    `);
  });

  it('constant circle implicit', () =>
  {
    const x = exprs().constant({x: 1, y: 2, r: 3}).run(sql);

    expectText({ ignoreCase: true, condenseSpace: true }, x, `
      SELECT circle('<(1, 2), 3>')
    `);
  });

  it('constant path explicit', () =>
  {
    const x = exprs().constant({points: [{x: 1, y: 2}, {x: 3, y: 4}]}, 'PATH').run(sql);

    expectText({ ignoreCase: true, condenseSpace: true }, x, `
      SELECT  path('[(1, 2), (3, 4)]')
    `);
  });

  it('constant path explicit empty', () =>
  {
    const x = exprs().constant({points: []}, 'PATH').run(sql);

    expectText({ ignoreCase: true, condenseSpace: true }, x, `
      SELECT path('[]')
    `);
  });

  it('constant path implicit', () =>
  {
    const x = exprs().constant({points: [{x: 1, y: 2}, {x: 3, y: 4}]}).run(sql);

    expectText({ ignoreCase: true, condenseSpace: true }, x, `
      SELECT path('[(1, 2), (3, 4)]')
    `);
  });

  it('constant path implicit empty', () =>
  {
    const x = exprs().constant({points: []}).run(sql);

    expectText({ ignoreCase: true, condenseSpace: true }, x, `
      SELECT path('[]')
    `);
  });

  it('constant polygon explicit', () =>
  {
    const x = exprs().constant({corners: [{x: 1, y: 2}, {x: 3, y: 4}]}, 'POLYGON').run(sql);

    expectText({ ignoreCase: true, condenseSpace: true }, x, `
      SELECT polygon('((1, 2), (3, 4))')
    `);
  });

  it('constant polygon explicit empty', () =>
  {
    const x = exprs().constant({corners: []}, 'POLYGON').run(sql);

    expectText({ ignoreCase: true, condenseSpace: true }, x, `
      SELECT polygon('()')
    `);
  });

  it('constant polygon implicit', () =>
  {
    const x = exprs().constant({corners: [{x: 1, y: 2}, {x: 3, y: 4}]}).run(sql);

    expectText({ ignoreCase: true, condenseSpace: true }, x, `
      SELECT polygon('((1, 2), (3, 4))')
    `);
  });

  it('constant polygon implicit empty', () =>
  {
    const x = exprs().constant({corners: []}).run(sql);

    expectText({ ignoreCase: true, condenseSpace: true }, x, `
      SELECT polygon('()')
    `);
  });

  it('constant interval', () =>
  {
    const x = DataInterval.from({ hours: 1, minutes: 30 }).run(sql);

    expectText({ ignoreCase: true, condenseSpace: true }, x, `
      SELECT interval '1 hour 30 minutes'
    `);
  });

  it('constant date', () =>
  {
    const x = DataTemporal.fromText('1989-01-03').run(sql);

    expectText({ ignoreCase: true, condenseSpace: true }, x, `
      SELECT '1989-01-03'::date
    `);
  });

  it('function aliases', () =>
  {
    const x = from(Task)
      .select(({ task }, exprs, fns) => [
        fns.ceil(task.id).as('ceil'),
        fns.trimLeft(task.name).as('trimmedName'),
      ])
      .run(sqlWithOptions({ simplifyReferences: true }))
    ;
    
    expectText({ ignoreCase: true, condenseSpace: true }, x, `
      SELECT
        CEIL(id) AS "ceil",
        LTRIM("name") AS "trimmedName"
      FROM task
    `);
  });

  it('dateAdd', () =>
  {
    const x = from(Task)
      .select(({ task }, exprs, fns) => [
        fns.dateAdd('year', 1, fns.currentDate()).as('yearFromNow')
      ])
      .run(sqlWithOptions({ simplifyReferences: true }))
    ;
    
    expectText({ ignoreCase: true, condenseSpace: true }, x, `
      SELECT
        (CURRENT_DATE + interval '1 year') AS "yearFromNow"
      FROM task
    `);
  });

  it('function geometry', () =>
  {
    const x = from(Task)
      .select(({ task }, exprs, fns) => [
        fns.geomDistance({ x: 0, y: 2}, { x: 3, y: 2 }).as('distance'),
      ])
      .run(sqlWithOptions({ simplifyReferences: true }))
    ;
    
    expectText({ ignoreCase: true, condenseSpace: true }, x, `
      SELECT
        ((point(0, 2))<->(point(3, 2))) AS distance
      FROM task
    `);
  });

  it('aggregate aliases', () =>
  {
    const x = from(Task)
      .select(({ task }, exprs, fns) => [
        exprs.min(task.name).as('firstName'),
      ])
      .run(sqlWithOptions({ simplifyReferences: true }))
    ;
    
    expectText({ ignoreCase: true, condenseSpace: true }, x, `
      SELECT
        MIN("name") AS "firstName"
      FROM task
    `);
  });

  it('functions reformated', () =>
  {
    const x = from(Task)
      .select(({ task }, exprs, fns) => [
        fns.truncate(task.id.mul(1.3)).as('truncated'),
        fns.currentTimestamp().as('now'),
        fns.timestampToSeconds(task.doneAt.defined()).as('doneAtSeconds'),
      ])
      .run(sqlWithOptions({ simplifyReferences: true }))
    ;
    
    expectText({ ignoreCase: true, condenseSpace: true }, x, `
      SELECT
        TRUNC(id * 1.3) AS truncated,
        CURRENT_TIMESTAMP AS now, 
        EXTRACT(EPOCH FROM doneAt) AS "doneAtSeconds"
      FROM task
    `);
  });

  it('aggregates reformated', () =>
  {
    const x = from(Task)
      .select(({ task }, { aggregate }) => [
        aggregate('boolAnd', task.done).as('boolAnd'),
        aggregate('boolOr', task.done).as('boolOr'),
        aggregate('countIf', task.done).as('countIf')
      ])
      .run(sqlWithOptions({ simplifyReferences: true }))
    ;
    
    expectText({ ignoreCase: true, condenseSpace: true }, x, `
      SELECT
        BOOL_AND(done) AS "boolAnd",
        BOOL_OR(done) AS "boolOr",
        COUNT(CASE WHEN (done) = 1 THEN 1 ELSE NULL END) AS "countIf"
      FROM task
    `);
  });

  it('limit', () =>
  {
    const x = from(Task)
      .select(({ task }) => [task.id, task.name])
      .orderBy('name')
      .limit(10)
      .run(sqlWithOptions({ simplifyReferences: true }))
    ;
    
    expectText({ ignoreCase: true, condenseSpace: true }, x, `
      SELECT
        id,
        "name"
      FROM task
      ORDER BY "name"
      LIMIT 10
    `);
  });

  it('limit offset', () =>
  {
    const x = from(Task)
      .select(({ task }) => [task.id, task.name])
      .orderBy('name')
      .limit(10)
      .offset(5)
      .run(sqlWithOptions({ simplifyReferences: true }))
    ;
    
    expectText({ ignoreCase: true, condenseSpace: true }, x, `
      SELECT
        id,
        "name"
      FROM task
      ORDER BY "name"
      LIMIT 10 OFFSET 5
    `);
  });

  it('offset', () =>
  {
    const x = from(Task)
      .select(({ task }) => [task.id, task.name])
      .orderBy('name')
      .offset(5)
      .run(sqlWithOptions({ simplifyReferences: true }))
    ;
    
    expectText({ ignoreCase: true, condenseSpace: true }, x, `
      SELECT
        id,
        "name"
      FROM task
      ORDER BY "name"
      LIMIT ALL OFFSET 5
    `);
  });

  it('round', () =>
  {
    const x = from(Task)
      .select(({ task }, {}, { round }) => [
        round(task.id).as('roundToNearestWhole'),
        round(task.id, 2).as('roundTo2')
      ])
      .run(sqlWithOptions({ simplifyReferences: true }))
    ;
    
    expectText({ ignoreCase: true, condenseSpace: true }, x, `
      SELECT
        ROUND(id) AS "roundToNearestWhole",
        ROUND(id, 2) AS "roundTo2"
      FROM task
    `);
  });

  it('padLeft', () =>
  {
    const x = from(Task)
      .select(({ task }, {}, { padLeft }) => [
        padLeft(task.name, 10).as('padLeftSpaces'),
        padLeft(task.name, 8, '_').as('padLeftScores')
      ])
      .run(sqlWithOptions({ simplifyReferences: true }))
    ;
    
    expectText({ ignoreCase: true, condenseSpace: true }, x, `
      SELECT
        LPAD(\"name\", 10) AS "padLeftSpaces",
        LPAD(\"name\", 8, '_') AS "padLeftScores"
      FROM task
    `);
  });

  it('padRight', () =>
  {
    const x = from(Task)
      .select(({ task }, {}, { padRight }) => [
        padRight(task.name, 10).as('padRightSpaces'),
        padRight(task.name, 8, '_').as('padRightScores')
      ])
      .run(sqlWithOptions({ simplifyReferences: true }))
    ;
    
    expectText({ ignoreCase: true, condenseSpace: true }, x, `
      SELECT
        RPAD(\"name\", 10) AS "padRightSpaces",
        RPAD(\"name\", 8, '_') AS "padRightScores"
      FROM task
    `);
  });

  it('random', () =>
  {
    const x = from(Task)
      .select(({}, {}, { random }) => [
        random().as('defaultSpan'),
        random(5).as('zeroToFivish'),
        random(6, 3).as('threeToSixish')
      ])
      .run(sqlWithOptions({ simplifyReferences: true }))
    ;
    
    expectText({ ignoreCase: true, condenseSpace: true }, x, `
      SELECT
        RANDOM() AS "defaultSpan",
        (RANDOM() * (5)) AS "zeroToFivish",
        (RANDOM() * ((6) - (3)) + (3)) AS "threeToSixish"
      FROM task
    `);
  });

  it('insert output', () =>
  {
    const x = insert(Task, ['name'])
      .returning(({ task }) => [task.id, task.done])
      .values([{ name: 'Task 1' }, { name: 'Task 2' }])
      .run(sqlWithOptions({ simplifyReferences: true }))
    ;
    
    expectText({ ignoreCase: true, condenseSpace: true }, x, `
      INSERT INTO task ("name")
      VALUES 
        ('Task 1'),
        ('Task 2')
      RETURNING id, done
    `);
  });

  it('delete output', () =>
  {
    const x = deletes(Task)
      .returning(({ task }) => [task.id, task.doneAt])
      .where(({ task }) => task.done)
      .run(sqlWithOptions({ simplifyReferences: true }))
    ;
    
    expectText({ ignoreCase: true, condenseSpace: true }, x, `
      DELETE FROM task
      WHERE 
        done
      RETURNING id, doneAt as "doneAt"
    `);
  });

  it('update output', () =>
  {
    const x = update(Task)
      .returning(({ task }) => [task.id, task.doneAt])
      .set('done', false)
      .where(({ task }) => task.done)
      .run(sqlWithOptions({ simplifyReferences: true }))
    ;
    
    expectText({ ignoreCase: true, condenseSpace: true }, x, `
      UPDATE task
      SET
        done = false
      WHERE 
        done
      RETURNING id, doneAt AS "doneAt"
    `);
  });

  it('nested json list', () =>
  {
    const x = from(Task)
      .select(({ task }, { count }) => [
        task.id,
        task.name,
        task.done,
        from(SubTask)
          .select('*')
          .where(({ subtask }) => subtask.parentId.eq(task.id))
          .list('name')
          .json()
          .as('subtasks'),
      ])
      .run(sqlWithOptions({ simplifyReferences: true }))
    ;

    expectText({ condenseSpace: true }, x, `
      SELECT 
        id, 
        "name", 
        done, 
        (SELECT json_agg(t.item) FROM (SELECT subtask."name" AS item FROM subtask WHERE parentId = task.id) as t) AS subtasks 
      FROM task
    `);
  });

  it('nested json rows', () =>
  {
    const x = from(Task)
      .select(({ task }, { count }) => [
        task.id,
        task.name,
        task.done,
        from(SubTask)
          .select('*')
          .where(({ subtask }) => subtask.parentId.eq(task.id))
          .json()
          .as('subtasks'),
      ])
      .run(sqlWithOptions({ simplifyReferences: true }))
    ;

    expectText({ condenseSpace: true }, x, `
      SELECT 
        id, 
        "name", 
        done, 
        (SELECT json_agg(row_to_json(t)) FROM (SELECT subtask.id AS id, subtask."name" AS "name", parentId AS "parentId" FROM subtask WHERE parentId = task.id) as t) AS subtasks 
      FROM task
    `);
  });

  it('nested json object', () =>
  {
    const x = from(SubTask)
      .select(({ subtask }, { count }) => [
        subtask.id,
        subtask.name,
        from(Task)
          .select(({ task }) => task.only(['id', 'name', 'done', 'doneAt']))
          .where(({ task }) => task.id.eq(subtask.parentId))
          .first()
          .json()
          .as('parent'),
      ])
      .run(sqlWithOptions({ simplifyReferences: true }))
    ;

    expectText({ condenseSpace: true }, x, `
      SELECT 
        id, 
        "name", 
        (SELECT row_to_json(t) FROM (SELECT task.id AS id, task."name" AS "name", done, doneAt AS "doneAt" FROM task WHERE task.id = parentId LIMIT 1) as t) AS parent
      FROM subtask
    `);
  });

  it('complex geom', () =>
  {
    const Party = table({
      name: 'party',
      primary: ['id'],
      fields: {
        id: 'INT',
        visibility: 'INT',
        status: 'INT',
        boostAmount: 'FLOAT',
        boostExpires: ['NULL', 'TIMESTAMP'],
      },
      fieldColumn: {
        boostAmount: 'boost_amount',
        boostExpires: 'boostExpires',
      },
    });

    const PartyInterest = table({
      name: 'party_interest',
      primary: ['partyId', 'interestId'],
      fields: {
        partyId: 'INT',
        interestId: 'INT',
        status: 'INT',
        searchLocation: { world: 'POINT' },
      },
      fieldColumn: {
        partyId: 'party_id',
        interestId: 'interest_id',
        searchLocation: 'search_location'
      },
    });

    const PartyRelation = table({
      name: 'party_relation',
      primary: ['partyId', 'relatedId'],
      fields: {
        partyId: 'INT',
        relatedId: 'INT',
        status: 'INT',
      },
    });

    const { deep, param } = exprs();

    const SearchParams = {
      interestPrimary: param<number>('interestPrimary'),
      location: deep<DataTypePoint>({ x: param('lng'), y: param('lat') }),
      interests: [ 1, 2, 3, 4 ],
      partyId: param<number>('partyId'),
      radius: param<number>('radius'),
      searchBoost: param<number>('searchBoost'),
      visibleHidden: param<number>('visibleHidden'),
      visiblePrimary: param<number>('visiblePrimary'),
      visibleStatuses: param<number>('visibleStatuses'),
      statusValid: param<number>('statusValid'),
    };

    const Neighbors = from(PartyInterest)
      .select(({ party_interest }, { count, countIf, sum, min, deep }, { geomDistance }) => [
        party_interest.partyId.as('relatedId'),
        count().as('interestCount'),
        countIf(party_interest.status.eq(SearchParams.interestPrimary)).as('primaryCount'),
        sum(party_interest.status.add(1)).as('scoreRaw'),
        // @ts-ignore
        geomDistance(min(party_interest.searchLocation), SearchParams.location).as('distance'),
      ])
      .where(({ party_interest }, {}, { geomWithinDistance }) => [
        geomWithinDistance(party_interest.searchLocation, SearchParams.location, SearchParams.radius),
        party_interest.interestId.in(SearchParams.interests),
        party_interest.partyId.notEq(SearchParams.partyId)
      ])
      .groupBy('relatedId')
    ;

    const Search = from(Neighbors.as('neighbor'))
      .joinInner(Party, ({ party, neighbor }) => 
        party.id.eq(neighbor.relatedId)
      )
      .joinLeft(PartyRelation, ({ party_relation, neighbor }) => 
        party_relation.relatedId.eq(neighbor.relatedId)
      )
      .select(({ neighbor }) => 
        neighbor.all()
      )
      .select(({ neighbor, party }, {}, { greatest, currentTimestamp }) => [
        neighbor.scoreRaw.mul(
          greatest(
            1, 
            party.boostExpires
              .gt(currentTimestamp())
              .thenResult(party.boostAmount)
              .else(1)
              .mul(SearchParams.searchBoost)
          )
        ).as('score')
      ])
      .where(({ neighbor, party, party_relation }) => [
        party_relation.partyId.eq(SearchParams.partyId),
        party_relation.status.isNull().or(party_relation.status.op('BITAND', SearchParams.visibleStatuses).notEq(0)),
        party.visibility.gt(SearchParams.visibleHidden),
        party.visibility.notEq(SearchParams.visiblePrimary).or(neighbor.primaryCount.gt(0)),
        party.status.lte(SearchParams.statusValid),
      ])
      .orderBy('score')
    ;

    const SearchSql = Search.run(sqlWithOptions({ simplifyReferences: true }));

    expectText({ condenseSpace: true }, SearchSql, `
      SELECT 
        neighbor.relatedId AS "relatedId", 
        interestCount AS "interestCount", 
        primaryCount AS "primaryCount", 
        scoreRaw AS "scoreRaw", 
        distance, 
        (scoreRaw * greatest(1, (CASE WHEN boostExpires > CURRENT_TIMESTAMP THEN boost_amount ELSE 1 END) * $1)) AS score 
      FROM (SELECT 
          party_id AS "relatedId", 
          COUNT(*) AS "interestCount", 
          COUNT(CASE WHEN (("status" = $2)) = 1 THEN 1 ELSE NULL END) AS "primaryCount", 
          SUM(("status" + 1)) AS "scoreRaw",
          ((MIN(search_location))<->(point($3, $4))) AS distance 
        FROM party_interest 
        WHERE ((search_location)<->(point($3, $4))) <= $5
          AND interest_id IN (1, 2, 3, 4) 
          AND party_id <> $6 
        GROUP BY party_id) AS neighbor 
      INNER JOIN party 
        ON id = relatedId 
      LEFT JOIN party_relation 
        ON party_relation.relatedId = neighbor.relatedId 
      WHERE partyId = $6 
        AND (party_relation."status" IS NULL OR (party_relation."status" & $7) <> 0) 
        AND visibility > $8 
        AND (visibility <> $9 OR primaryCount > 0) 
        AND party."status" <= $10 
      ORDER BY (scoreRaw * greatest(1, (CASE WHEN boostExpires > CURRENT_TIMESTAMP THEN boost_amount ELSE 1 END) * $1))
    `);

    DialectPgsql.gis = true;

    const SearchSqlGis = Search.run(sqlWithOptions({ simplifyReferences: true }));

    expectText({ condenseSpace: true }, SearchSqlGis, `
      SELECT 
        neighbor.relatedId AS "relatedId", 
        interestCount AS "interestCount", 
        primaryCount AS "primaryCount", 
        scoreRaw AS "scoreRaw", 
        distance, 
        (scoreRaw * greatest(1, (CASE WHEN boostExpires > CURRENT_TIMESTAMP THEN boost_amount ELSE 1 END) * $1)) AS score 
      FROM (SELECT 
          party_id AS "relatedId", 
          COUNT(*) AS "interestCount", 
          COUNT(CASE WHEN (("status" = $2)) = 1 THEN 1 ELSE NULL END) AS "primaryCount", 
          SUM(("status" + 1)) AS "scoreRaw",
          ST_Distance(MIN(search_location), ST_Point($3, $4)) AS distance 
        FROM party_interest 
        WHERE ST_DWithin(search_location, ST_Point($3, $4), $5)
          AND interest_id IN (1, 2, 3, 4) 
          AND party_id <> $6 
        GROUP BY party_id) AS neighbor 
      INNER JOIN party 
        ON id = relatedId 
      LEFT JOIN party_relation 
        ON party_relation.relatedId = neighbor.relatedId 
      WHERE partyId = $6 
        AND (party_relation."status" IS NULL OR (party_relation."status" & $7) <> 0) 
        AND visibility > $8 
        AND (visibility <> $9 OR primaryCount > 0) 
        AND party."status" <= $10 
      ORDER BY (scoreRaw * greatest(1, (CASE WHEN boostExpires > CURRENT_TIMESTAMP THEN boost_amount ELSE 1 END) * $1))
    `);

    DialectPgsql.gis = false;
  });


});