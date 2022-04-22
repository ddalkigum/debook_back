const checkRequired = (parameterList: any[]) => {
  if (!Array.isArray(parameterList)) {
    const error = new Error('Input parameter not matched defined parameter type');
    error.name = 'CheckRequied';
    throw error;
  }

  parameterList.forEach((parameter) => {
    if (typeof parameter === undefined) {
      const error = new Error('Check required parameter');
      error.name = 'CheckRequired';
      throw error;
    }
  });
};

export default checkRequired;
