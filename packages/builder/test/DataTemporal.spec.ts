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

  it('from and to UnixEpoch', () => {
    const TIMESTAMP = 1629577808523;

    const d = DataTemporal.fromUnixEpoch(TIMESTAMP);

    expect(d.toUnixEpoch()).toEqual(TIMESTAMP);
  });

  it('from and to Date', () => {
    const DATE = new Date(1629577808523);

    const d = DataTemporal.fromDate(DATE);

    expect(d.toDate().getTime()).toEqual(DATE.getTime());
  });

  it('from and to text', () => {
    const TEXT = '2021-08-21 16:47:56';

    const d0 = DataTemporal.fromText(TEXT);

    expect(d0.text).toEqual(TEXT);

    const d1 = DataTemporal.fromDate(d0.toDate());

    expect(d1.text).toEqual(TEXT);

    const d2 = DataTemporal.fromUnixEpoch(d0.toUnixEpoch());

    expect(d2.text).toEqual(TEXT);
  });

  it('compare', () => {
    expect(DataTemporal.fromText('2020-01-01').compare(DataTemporal.fromText('2020-01-01 00:00:00')) === 0).toBeTruthy();
    expect(DataTemporal.fromText('2020-01-01').compare(DataTemporal.fromText('2020-01-01 00:00:01')) < 0).toBeTruthy();
    expect(DataTemporal.fromText('2020-01-01').compare(DataTemporal.fromText('2019-12-31 23:59:59')) > 0).toBeTruthy();
  });

  it('compare', () => {
    const t0 = DataTemporal.fromText('2020-01-01');
    const t1 = DataTemporal.fromText('2020-01-01 00:00:00.000');
    const t2 = DataTemporal.fromText('2020-01-01 00:00:00.001');
    const t3 = DataTemporal.fromText('2020-01-01 00:00:01');
    const t4 = DataTemporal.fromText('2020-01-01 00:01:00');
    const t5 = DataTemporal.fromText('2020-01-01 01:00:00');
    const t6 = DataTemporal.fromText('2020-01-02 0:00:00');
    const t7 = DataTemporal.fromText('2020-02-01 0:00:00');
    const t8 = DataTemporal.fromText('2021-01-01 0:00:00');

    expect(t0.isSame(t1, 'millisecond')).toBeTruthy();
    expect(t0.isSame(t1, 'second')).toBeTruthy();
    
    expect(t0.isSame(t2, 'millisecond')).toBeFalsy();
    expect(t0.isSame(t2, 'second')).toBeTruthy();

    expect(t0.isSame(t3, 'second')).toBeFalsy();
    expect(t0.isSame(t3, 'minute')).toBeTruthy();

    expect(t0.isSame(t4, 'minute')).toBeFalsy();
    expect(t0.isSame(t4, 'hour')).toBeTruthy();

    expect(t0.isSame(t5, 'hour')).toBeFalsy();
    expect(t0.isSame(t5, 'day')).toBeTruthy();

    expect(t0.isSame(t6, 'day')).toBeFalsy();
    expect(t0.isSame(t6, 'month')).toBeTruthy();

    expect(t0.isSame(t7, 'month')).toBeFalsy();
    expect(t0.isSame(t7, 'year')).toBeTruthy();

    expect(t0.isSame(t8, 'year')).toBeFalsy();
  });

});