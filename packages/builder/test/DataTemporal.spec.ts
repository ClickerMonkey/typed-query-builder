import { DataTypeTemporal, DataTemporal } from '../src';


type TemporalObject = Partial<Omit<DataTypeTemporal, 'toDate' | 'toUnixEpoch'>>;

describe('DataTemporal', () =>
{

  function expectObject(actual: TemporalObject, expected: TemporalObject)
  {
    for (const prop in expected)
    {
      expect(expected[prop]).toEqual(actual[prop]);
    }
  }

  it('date fromText', () => 
  { 
    const d = DataTemporal.fromText('2021-09-13');

    expectObject(d, {
      text: '2021-09-13',
      year: 2021,
      month: 9,
      date: 13,
      hasDate: true,
      hasTime: false,
      hasTimeZone: false,
    });

    expect(d.getType()).toStrictEqual('DATE');
  });

  it('time fromText', () => 
  { 
    const d = DataTemporal.fromText('18:23');

    expectObject(d, {
      text: '18:23',
      hour: 18,
      minute: 23,
      hasDate: false,
      hasTime: true,
      hasTimeZone: false,
    });

    expect(d.getType()).toStrictEqual('TIME');
  });

  it('timestamp minimal fromText', () => 
  { 
    const d = DataTemporal.fromText('2021-09-13 18:23');

    expectObject(d, {
      text: '2021-09-13 18:23',
      year: 2021,
      month: 9,
      date: 13,
      hour: 18,
      minute: 23,
      hasDate: true,
      hasTime: true,
      hasTimeZone: false,
    });

    expect(d.getType()).toStrictEqual('TIMESTAMP');
  });

  it('timestamp minimal fromText', () => 
  { 
    const d = DataTemporal.fromText('2021-09-13 18:23:12.432');

    expectObject(d, {
      text: '2021-09-13 18:23:12.432',
      year: 2021,
      month: 9,
      date: 13,
      hour: 18,
      minute: 23,
      second: 12,
      millisecond: 432,
      hasDate: true,
      hasTime: true,
      hasTimeZone: false,
    });

    expect(d.getType()).toStrictEqual('TIMESTAMP');
  });

  it('timestamp zoned fromText', () => 
  { 
    const d = DataTemporal.fromText('2021-09-13 18:23:12.432+08');

    expectObject(d, {
      text: '2021-09-13 18:23:12.432+08',
      year: 2021,
      month: 9,
      date: 13,
      hour: 18,
      minute: 23,
      second: 12,
      millisecond: 432,
      zoneOffsetMinutes: 8 * 60,
      hasDate: true,
      hasTime: true,
      hasTimeZone: true,
    });

    expect(d.getType()).toStrictEqual({ timezoned: 'TIMESTAMP' });
  });

  it('timestamp -zoned fromText', () => 
  { 
    const d = DataTemporal.fromText('2021-09-13 18:23:12.432-08');

    expectObject(d, {
      text: '2021-09-13 18:23:12.432-08',
      year: 2021,
      month: 9,
      date: 13,
      hour: 18,
      minute: 23,
      second: 12,
      millisecond: 432,
      zoneOffsetMinutes: -8 * 60,
      hasDate: true,
      hasTime: true,
      hasTimeZone: true,
    });

    expect(d.getType()).toStrictEqual({ timezoned: 'TIMESTAMP' });
  });

  it('time zoned fromText', () => 
  { 
    const d = DataTemporal.fromText('18:23+08');

    expectObject(d, {
      text: '18:23+08',
      hour: 18,
      minute: 23,
      zoneOffsetMinutes: 8 * 60,
      hasDate: false,
      hasTime: true,
      hasTimeZone: true,
    });

    expect(d.getType()).toStrictEqual({ timezoned: 'TIME' });
  });

  it('startOf minute', () => {
    const d = DataTemporal.fromText('12:34:56');

    d.startOf('minute');

    expect(d.text).toEqual('12:34:00');
  });

  it('startOf hour', () => {
    const d = DataTemporal.fromText('12:34');

    d.startOf('hour');

    expect(d.text).toEqual('12:00:00');
  });

  it('startOf day', () => {
    const d = DataTemporal.fromText('12:34');

    d.startOf('day');

    expect(d.text).toEqual('00:00:00');
  });

  it('startOf week', () => {
    const d = DataTemporal.fromText('2021-08-19');

    d.startOf('week');

    expect(d.text).toEqual('2021-08-15');
  });

  it('startOf month', () => {
    const d = DataTemporal.fromText('2021-08-19');

    d.startOf('month');

    expect(d.text).toEqual('2021-08-01');
  });

  it('startOf quarter', () => {
    const d = DataTemporal.fromText('2021-08-19');

    d.startOf('quarter');

    expect(d.text).toEqual('2021-07-01');
  });

  it('startOf year', () => {
    const d = DataTemporal.fromText('2021-08-19');

    d.startOf('year');

    expect(d.text).toEqual('2021-01-01');
  });

  it('startOf no affect', () => {
    const d = DataTemporal.fromText('2021-08-19');

    d.startOf('day');

    expect(d.text).toEqual('2021-08-19');

    d.startOf('hour');

    expect(d.text).toEqual('2021-08-19');

    d.startOf('minute');

    expect(d.text).toEqual('2021-08-19');

    d.startOf('second');

    expect(d.text).toEqual('2021-08-19');

    d.startOf('millisecond');

    expect(d.text).toEqual('2021-08-19');
  });

  it('endOf week', () => {
    const d = DataTemporal.fromText('2021-08-19');

    d.endOf('week');

    expect(d.text).toEqual('2021-08-21');
  });

  it('endOf month', () => {
    const d = DataTemporal.fromText('2021-08-19');

    d.endOf('month');

    expect(d.text).toEqual('2021-08-31');
  });

  it('endOf quarter', () => {
    const d = DataTemporal.fromText('2021-08-19');

    d.endOf('quarter');

    expect(d.text).toEqual('2021-09-30');
  });

  it('endOf year', () => {
    const d = DataTemporal.fromText('2021-08-19');

    d.endOf('year');

    expect(d.text).toEqual('2021-12-31');
  });

});