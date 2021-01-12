import { Expr, ExprField, tableFromType } from '../src';
import { expectType } from './helper';


// tslint:disable: no-magic-numbers

describe('Expr', () => 
{

  it('required & nullable', () =>
  {
    interface Point { x?: number | null, y: number, srid: string };

    const PointTable = tableFromType<Point>()({
      name: 'point',
      fields: ['x', 'y']
    });

    const x = PointTable.fields.x.required();
    const y = PointTable.fields.y.nullable();

    expectType<ExprField<'x', number | undefined | null>>(PointTable.fields.x);
    expectType<Expr<number>>(x);
    expectType<Expr<number | null>>(y);
  });

});