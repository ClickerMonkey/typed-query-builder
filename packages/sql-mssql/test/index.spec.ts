import { exprs, table, from, DataTypePoint, insert, deletes, update } from '@typed-query-builder/builder';
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


  it('param', () => 
  {
    const x = exprs().param('userId').run(sql);

    expectText({ ignoreCase: true, condenseSpace: true }, x, `
      SELECT @userId
    `);
  });

  it('true', () => 
  {
    const x = exprs().constant(true).run(sql);

    expectText({ ignoreCase: true, condenseSpace: true }, x, `
      SELECT 1
    `);
  });

  it('false', () => 
  {
    const x = exprs().constant(false).run(sql);

    expectText({ ignoreCase: true, condenseSpace: true }, x, `
      SELECT 0
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
      SELECT CAST(CAST(1 * POWER(CAST(2 AS BIGINT), 2 & 0x1F) AS BINARY(4)) AS INT)
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
      SELECT 0 = 1
    `);
  });

  it('predicate unary false', () => 
  {
    const x = exprs().isFalse(false).run(sql);

    expectText({ ignoreCase: true, condenseSpace: true }, x, `
      SELECT 0 = 0
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
        STRING_AGG(name, ',') WITHIN GROUP (ORDER BY name ASC) AS names
      FROM task
    `);
  });

  it('cast boolean', () =>
  {
    const x = exprs().cast('BOOLEAN', 1).run(sql);

    expectText({ ignoreCase: true, condenseSpace: true }, x, `
      SELECT CAST(1 AS BIT)
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
      SELECT CAST(1 AS INT(2))
    `);
  });

  it('constant boolean', () =>
  {
    const x = exprs().constant(true, 'BOOLEAN').run(sql);

    expectText({ ignoreCase: true, condenseSpace: true }, x, `
      SELECT 1
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
    const x = exprs().constant(new Date('2020-01-03T18:43:00Z'), 'TIMESTAMP').run(sql);

    expectText({ ignoreCase: true, condenseSpace: true }, x, `
      SELECT '2020-01-03 18:43:00.000'
    `);
  });

  it('constant date', () =>
  {
    const x = exprs().constant(new Date('2020-01-03T18:43:00Z'), 'DATE').run(sql);

    expectText({ ignoreCase: true, condenseSpace: true }, x, `
      SELECT '2020-01-03'
    `);
  });

  it('constant time', () =>
  {
    const x = exprs().constant(new Date('2020-01-03T18:43:00Z'), 'TIME').run(sql);

    expectText({ ignoreCase: true, condenseSpace: true }, x, `
      SELECT '18:43:00'
    `);
  });

  it('constant point explicit', () =>
  {
    const x = exprs().constant({x: 1, y: 2}, 'POINT').run(sql);

    expectText({ ignoreCase: true, condenseSpace: true }, x, `
      SELECT geometry::Point(1, 2, 0)
    `);
  });

  it('constant point implicit', () =>
  {
    const x = exprs().constant({x: 1, y: 2}).run(sql);

    expectText({ ignoreCase: true, condenseSpace: true }, x, `
      SELECT geometry::Point(1, 2, 0)
    `);
  });

  it('constant point deep', () =>
  {
    const { deep, param } = exprs();

    const x = deep({x: param('x'), y: 2}).run(sql);

    expectText({ ignoreCase: true, condenseSpace: true }, x, `
      SELECT geometry::Point(@x, 2, 0)
    `);
  });

  it('constant segment explicit', () =>
  {
    const x = exprs().constant({x1: 1, y1: 2, x2: 3, y2: 4}, 'SEGMENT').run(sql);

    expectText({ ignoreCase: true, condenseSpace: true }, x, `
      SELECT geometry::STGeomFromText('LINESTRING (1 2, 3 4)', 0)
    `);
  });

  it('constant segment implicit', () =>
  {
    const x = exprs().constant({x1: 1, y1: 2, x2: 3, y2: 4}).run(sql);

    expectText({ ignoreCase: true, condenseSpace: true }, x, `
      SELECT geometry::STGeomFromText('LINESTRING (1 2, 3 4)', 0)
    `);
  });

  it('constant circle explicit', () =>
  {
    const x = exprs().constant({x: 1, y: 2, r: 3}, 'CIRCLE').run(sql);

    expectText({ ignoreCase: true, condenseSpace: true }, x, `
      SELECT geometry::STGeomFromText('CIRCULARSTRING (4 2, 1 5, -2 2, 1 -1, 4 2)', 0)
    `);
  });

  it('constant circle implicit', () =>
  {
    const x = exprs().constant({x: 1, y: 2, r: 3}).run(sql);

    expectText({ ignoreCase: true, condenseSpace: true }, x, `
      SELECT geometry::STGeomFromText('CIRCULARSTRING (4 2, 1 5, -2 2, 1 -1, 4 2)', 0)
    `);
  });

  it('constant path explicit', () =>
  {
    const x = exprs().constant({points: [{x: 1, y: 2}, {x: 3, y: 4}]}, 'PATH').run(sql);

    expectText({ ignoreCase: true, condenseSpace: true }, x, `
      SELECT geometry::STGeomFromText('LINESTRING (1 2, 3 4)', 0)
    `);
  });

  it('constant path explicit empty', () =>
  {
    const x = exprs().constant({points: []}, 'PATH').run(sql);

    expectText({ ignoreCase: true, condenseSpace: true }, x, `
      SELECT geometry::STGeomFromText('LINESTRING EMPTY', 0)
    `);
  });

  it('constant path implicit', () =>
  {
    const x = exprs().constant({points: [{x: 1, y: 2}, {x: 3, y: 4}]}).run(sql);

    expectText({ ignoreCase: true, condenseSpace: true }, x, `
      SELECT geometry::STGeomFromText('LINESTRING (1 2, 3 4)', 0)
    `);
  });

  it('constant path implicit empty', () =>
  {
    const x = exprs().constant({points: []}).run(sql);

    expectText({ ignoreCase: true, condenseSpace: true }, x, `
      SELECT geometry::STGeomFromText('LINESTRING EMPTY', 0)
    `);
  });

  it('constant polygon explicit', () =>
  {
    const x = exprs().constant({corners: [{x: 1, y: 2}, {x: 3, y: 4}]}, 'POLYGON').run(sql);

    expectText({ ignoreCase: true, condenseSpace: true }, x, `
      SELECT geometry::STGeomFromText('POLYGON ((1 2, 3 4))', 0)
    `);
  });

  it('constant polygon explicit empty', () =>
  {
    const x = exprs().constant({corners: []}, 'POLYGON').run(sql);

    expectText({ ignoreCase: true, condenseSpace: true }, x, `
      SELECT geometry::STGeomFromText('POLYGON EMPTY', 0)
    `);
  });

  it('constant polygon implicit', () =>
  {
    const x = exprs().constant({corners: [{x: 1, y: 2}, {x: 3, y: 4}]}).run(sql);

    expectText({ ignoreCase: true, condenseSpace: true }, x, `
      SELECT geometry::STGeomFromText('POLYGON ((1 2, 3 4))', 0)
    `);
  });

  it('constant polygon implicit empty', () =>
  {
    const x = exprs().constant({corners: []}).run(sql);

    expectText({ ignoreCase: true, condenseSpace: true }, x, `
      SELECT geometry::STGeomFromText('POLYGON EMPTY', 0)
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
        CEILING(id) AS ceil,
        LTRIM(name) AS trimmedName
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
        (geometry::Point(0, 2, 0)).STDistance(geometry::Point(3, 2, 0)) AS distance
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
        MIN(name) AS firstName
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
        ROUND(id * 1.3, 0, 1) AS truncated,
        CURRENT_TIMESTAMP AS now,
        DATEDIFF(SECOND, '1970-01-01 00:00:00', doneAt) AS doneAtSeconds
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
        (1 - MIN(done)) AS boolAnd,
        MAX(done) AS boolOr,
        COUNT(CASE WHEN (done) = 1 THEN 1 ELSE NULL END) AS countIf
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
        name
      FROM task
      ORDER BY name
      OFFSET 0 ROWS FETCH FIRST 10 ROWS ONLY
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
        name
      FROM task
      ORDER BY name
      OFFSET 5 ROWS FETCH NEXT 10 ROWS ONLY
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
        name
      FROM task
      ORDER BY name
      OFFSET 5 ROWS
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
        ROUND(id, 0) AS roundToNearestWhole,
        ROUND(id, 2) AS roundTo2
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
        CONCAT(REPLICATE(' ', LEN(name) - (10)), name) AS padLeftSpaces,
        CONCAT(REPLICATE('_', LEN(name) - (8)), name) AS padLeftScores
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
        CONCAT(name, REPLICATE(' ', LEN(name) - (10))) AS padRightSpaces,
        CONCAT(name, REPLICATE('_', LEN(name) - (8))) AS padRightScores
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
        RAND() AS defaultSpan,
        (RAND() * (5)) AS zeroToFivish,
        (RAND() * ((6) - (3)) + (3)) AS threeToSixish
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
      INSERT INTO task (name)
      OUTPUT 
        INSERTED.id AS id, 
        INSERTED.done AS done
      VALUES 
        ('Task 1'),
        ('Task 2')
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
      OUTPUT 
        DELETED.id AS id, 
        DELETED.doneAt AS doneAt
      WHERE 
        done = 1
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
        done = 0
      OUTPUT 
        INSERTED.id AS id, 
        INSERTED.doneAt AS doneAt
      WHERE 
        done = 1
    `);
  });

  it('delete top', () =>
  {
    const x = deletes(Task)
      .setClause('top', 'TOP (2)')
      .where(({ task }) => task.done)
      .run(sqlWithOptions({ simplifyReferences: true }))
    ;
    
    expectText({ ignoreCase: true, condenseSpace: true }, x, `
      DELETE TOP (2) 
      FROM task
      WHERE 
        done = 1
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
              .then(party.boostAmount)
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
        neighbor.relatedId AS relatedId, 
        interestCount, 
        primaryCount, 
        scoreRaw, 
        distance, 
        (scoreRaw * (SELECT MAX(i) FROM (VALUES (1), ((CASE WHEN boostExpires > CURRENT_TIMESTAMP THEN boost_amount ELSE 1 END) * @searchBoost)) AS T(i))) AS score 
      FROM (SELECT 
          party_id AS relatedId, 
          COUNT(*) AS interestCount, 
          COUNT(CASE WHEN ((status = @interestPrimary)) = 1 THEN 1 ELSE NULL END) AS primaryCount, 
          SUM((status + 1)) AS scoreRaw, 
          (MIN(search_location)).STDistance(geometry::Point(@lng, @lat, 0)) AS distance 
        FROM party_interest 
        WHERE geomWithinDistance(search_location, geometry::Point(@lng, @lat, 0), @radius) = 1 
          AND interest_id IN (1, 2, 3, 4) 
          AND party_id <> @partyId GROUP BY party_id) AS neighbor 
      INNER JOIN party 
        ON id = relatedId 
      LEFT JOIN party_relation 
        ON party_relation.relatedId = neighbor.relatedId 
      WHERE partyId = @partyId 
        AND (party_relation.status IS NULL OR (party_relation.status & @visibleStatuses) <> 0) 
        AND visibility > @visibleHidden 
        AND (visibility <> @visiblePrimary OR primaryCount > 0) 
        AND party.status <= @statusValid 
      ORDER BY (scoreRaw * (SELECT MAX(i) FROM (VALUES (1), ((CASE WHEN boostExpires > CURRENT_TIMESTAMP THEN boost_amount ELSE 1 END) * @searchBoost)) AS T(i)))
    `);
  });


});