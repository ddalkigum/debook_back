import * as util from '../';

describe('Check required test', () => {
  test('Should return check parameter error', () => {
    const params = {
      email: undefined,
    };
    try {
      util.checkRequired([params.email]);
    } catch (error) {
      expect(error.name).toEqual('CheckRequired');
    }
  });
});
