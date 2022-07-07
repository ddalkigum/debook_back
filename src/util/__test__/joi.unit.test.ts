import Joi from 'joi';
import { validateContext } from '../validate';

describe('Optional test', () => {
  test('Should be Success', () => {
    const user = { name: 'asdf' };
    const schema = Joi.object({
      name: Joi.string().required(),
      age: Joi.string().optional(),
    });

    validateContext(user, schema);
  });
});
