// eslint-disable-next-line import/prefer-default-export
export const getValueFromArr = (values, defaultVal = { more: ' ', default: '--' }) => {
  if (!Array.isArray(values)) {
    return defaultVal.default;
  }

  if (values.length > 1) {
    return defaultVal.more;
  }

  return values.length === 1 ? values[0] : defaultVal.default;
};

