import getContentEncoding from './getContentEncoding';

export default acceptEncoding => {
  const contentEncoding = getContentEncoding(acceptEncoding);
  return {
    'Content-Encoding': contentEncoding.type,
    'Content-Type': 'text/html; charset=UTF-8'
  };
};
