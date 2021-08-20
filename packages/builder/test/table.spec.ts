import { DataTypeBox, DataTypeCircle, DataTypeLine, DataTypePath, DataTypePoint, DataTypePolygon, DataTypeSegment, Json, table, tableFromType, _Date } from '../src';
import { expectExprType } from "./helper";


describe('table', () =>
{

  it('types 0', () =>
  {
    const all = table({
      name: 'all',
      fields: {
        a: 'BOOLEAN', 
        b: 'BIT', 
        c: [ 'BITS', 1],
        d: 'TINYINT',
        e: [ 'TINYINT', 1],
        f: { unsigned: 'TINYINT', length: 1 },
        g: 'SMALLINT',
        h: [ 'SMALLINT', 1],
        i: { unsigned: 'SMALLINT', length: 1 },
        j: 'MEDIUMINT',
        k: [ 'MEDIUMINT', 1],
        l: { unsigned: 'MEDIUMINT', length: 1 },
        m: 'INT',
        n: [ 'INT', 1],
        o: { unsigned: 'INT', length: 1 },
        p: 'BIGINT',
        q: [ 'BIGINT', 1],
        r: { unsigned: 'BIGINT', length: 1 },
        s: 'DECIMAL',
        t: [ 'DECIMAL', 1, 1],
        u: { unsigned: 'DECIMAL', totalDigits: 1, fractionDigits: 1 },
      }
    });

    expectExprType<boolean>(all.fields.a);
    expectExprType<boolean>(all.fields.b);
    expectExprType<number>(all.fields.c);
    expectExprType<number>(all.fields.d);
    expectExprType<number>(all.fields.e);
    expectExprType<number>(all.fields.f);
    expectExprType<number>(all.fields.g);
    expectExprType<number>(all.fields.h);
    expectExprType<number>(all.fields.i);
    expectExprType<number>(all.fields.j);
    expectExprType<number>(all.fields.k);
    expectExprType<number>(all.fields.l);
    expectExprType<number>(all.fields.m);
    expectExprType<number>(all.fields.n);
    expectExprType<number>(all.fields.o);
    expectExprType<number>(all.fields.p);
    expectExprType<number>(all.fields.q);
    expectExprType<number>(all.fields.r);
    expectExprType<number>(all.fields.s);
    expectExprType<number>(all.fields.t);
    expectExprType<number>(all.fields.u);
  });

  it('types 1', () =>
  {
    const all = table({
      name: 'all',
      fields: {
        v: 'NUMERIC',
        w: [ 'NUMERIC', 1, 1],
        x: { unsigned: 'NUMERIC', totalDigits: 1, fractionDigits: 1 },
        y: 'FLOAT',
        z: [ 'FLOAT', 1],
        aa: [ 'FLOAT', 1, 1],
        ab: { unsigned: 'FLOAT', totalDigits: 1, fractionDigits: 1 },
        ac: 'DOUBLE',
        ad: [ 'DOUBLE', 1, 1],
        ae: { unsigned: 'DOUBLE', totalDigits: 1, fractionDigits: 1 },
        af: [ 'CHAR', 1],
        ag: [ 'VARCHAR', 1], 
        ah: 'TEXT',
        ai: 'TIMESTAMP',
        aj: [ 'TIMESTAMP', 1 ],
        ak: { timezoned: 'TIMESTAMP', secondFractionDigits: 1 },
        al: 'DATE',
        am: 'TIME',
        an: [ 'TIME', 1 ],
        ao: { timezoned: 'TIME', secondFractionDigits: 1 }, 
        ap: 'UUID',
      }
    });

    expectExprType<number>(all.fields.v);
    expectExprType<number>(all.fields.w);
    expectExprType<number>(all.fields.x);
    expectExprType<number>(all.fields.y);
    expectExprType<number>(all.fields.z);
    expectExprType<number>(all.fields.aa);
    expectExprType<number>(all.fields.ab);
    expectExprType<number>(all.fields.ac);
    expectExprType<number>(all.fields.ad);
    expectExprType<number>(all.fields.ae);
    expectExprType<string>(all.fields.af);
    expectExprType<string>(all.fields.ag);
    expectExprType<string>(all.fields.ah);
    expectExprType<_Date>(all.fields.ai);
    expectExprType<_Date>(all.fields.aj);
    expectExprType<_Date>(all.fields.ak);
    expectExprType<_Date>(all.fields.al);
    expectExprType<_Date>(all.fields.am);
    expectExprType<_Date>(all.fields.an);
    expectExprType<_Date>(all.fields.ao);
    expectExprType<string>(all.fields.ap);
  });

  it('types 2', () =>
  {
    const all = table({
      name: 'all',
      fields: {
        aq: 'CIDR',
        ar: 'INET',
        as: 'MACADDR',
        at: [ 'BINARY', 1 ], 
        au: [ 'VARBINARY', 1 ],
        av: 'BLOB', 
        aw: 'JSON',
        ax: 'POINT', 
        ay: 'SEGMENT',
        az: 'LINE', 
        ba: 'BOX', 
        bb: 'PATH', 
        bc: 'POLYGON', 
        bd: 'CIRCLE', 
        be: [ 'ARRAY', 'INT', 3 ],
        bf: 'ANY'
      }
    });

    expectExprType<string>(all.fields.aq);
    expectExprType<string>(all.fields.ar);
    expectExprType<string>(all.fields.as);
    expectExprType<Buffer>(all.fields.at);
    expectExprType<Buffer>(all.fields.au);
    expectExprType<Buffer>(all.fields.av);
    expectExprType<Json>(all.fields.aw);
    expectExprType<DataTypePoint>(all.fields.ax);
    expectExprType<DataTypeSegment>(all.fields.ay);
    expectExprType<DataTypeLine>(all.fields.az);
    expectExprType<DataTypeBox>(all.fields.ba);
    expectExprType<DataTypePath>(all.fields.bb);
    expectExprType<DataTypePolygon>(all.fields.bc);
    expectExprType<DataTypeCircle>(all.fields.bd);
    expectExprType<number[]>(all.fields.be);
    expectExprType<any>(all.fields.bf);
  });

  it('optional', () =>
  {
    const opt = table({
      name: 'opt', 
      fields: {
        id: 'INT',
        name: ['NULL', 'TEXT']
      },
    });

    expectExprType<number>(opt.fields.id);
    expectExprType<string | undefined>(opt.fields.name);
  });

  it('tableFromType', () =>
  {
    interface Point { x: number, y: number, srid: string };

    const PointTable = tableFromType<Point>()({
      name: 'point',
      fields: ['x', 'y']
    });

    expect(PointTable.table).toBe('point');
    expect(PointTable.name).toBe('point');
    expect(PointTable.fieldType.x).toBe('ANY');
    expect(PointTable.fieldType.y).toBe('ANY');
  });

  it('tableFromType aliased', () =>
  {
    interface Point { x: number, y: number, srid: string };

    const PointTable = tableFromType<Point>()({
      name: 'point',
      table: 'ThePoint',
      fields: ['x', 'y', 'srid'],
      fieldColumn: {
        x: 'TheX',
        y: 'TheY',
      },
    });

    expect(PointTable.table).toBe('ThePoint');
    expect(PointTable.name).toBe('point');
    expect(PointTable.fieldType.x).toBe('ANY');
    expect(PointTable.fieldType.y).toBe('ANY');
  });

});