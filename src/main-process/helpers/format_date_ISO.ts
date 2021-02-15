exports.formatDateISO = (day, month, year) => {
  let month_str = '' + month;
  let day_str = '' + day;
  let year_str = year;

  if (month_str.length < 2) month_str = '0' + month_str;
  if (day_str.length < 2) day_str = '0' + day_str;

  return [year_str, month_str, day_str].join('-');
};
