import React from 'react';

export default ({ status }) => (
  <span
    data-creat-react-app-server-status={status}
    style={{ display: 'none' }}
  />
);
