import * as Util from '../';

test('UUID generate test', () => {
  const uuid = Util.generageUUID();
  expect(uuid.length).toEqual(36);
});
