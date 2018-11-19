const timestampToTime = val => {
  const date = new Date(val);
  const Y = `${date.getFullYear()}-`;
  const M = `${date.getMonth() + 1 < 10 ? `0${date.getMonth() + 1}` : date.getMonth() + 1}-`;
  const D = `${date.getDate()} `;
  return `${Y}${M}${D}`;
};

export { timestampToTime };
