exports.paginate = ({ pageIndex, pageSize }) => {
  const offset = pageIndex * pageSize;
  const limit = pageSize;

  return {
    offset,
    limit
  };
};
