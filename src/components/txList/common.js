export const getValueFromArr = (values, defaultVal = { more: ' ', default: '--' }) => {
  if (!Array.isArray(values)) {
    return defaultVal.default;
  }

  if (values.length > 1) {
    return defaultVal.more;
  }

  return values.length === 1 ? values[0] : defaultVal.default;
};

export const arrHandle = (arr) => {
  if (!Array.isArray(arr)) {
    return [];
  }

  const filters = [null, undefined, ''];
  const res = arr.filter((v) => !filters.includes(v));

  return [...new Set(res)];
};
