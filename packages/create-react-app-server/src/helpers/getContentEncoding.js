// get the valid content coding to send in the response
export default acceptEncoding => {
  // if Accept-Encoding header is not found
  if (typeof acceptEncoding !== 'string') {
    return {
      extension: '',
      type: null
    };
  }
  
  // an array of valid encodings supported by the client
  const validEncodings = acceptEncoding
    .split(',')
    .map(item => item.trim().toLowerCase());
  
  // 1. if brotli is supported
  if (validEncodings.includes('br')) {
    return {
      extension: '.br',
      type: 'br'
    };
  }

  // 2. if gzip is supported
  if (validEncodings.includes('gzip')) {
    return {
      extension: '.gz',
      type: 'gzip'
    };
  }
};
