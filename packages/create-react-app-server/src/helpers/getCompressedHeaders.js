export default contentEncoding  => {
  return {
    'Content-Encoding': contentEncoding.type,
    'Content-Type': 'text/html; charset=UTF-8'
  };
};
