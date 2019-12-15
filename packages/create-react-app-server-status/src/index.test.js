import * as packageExports from '.';

describe('@foo-software/create-react-app-server-status', () => {
  it('should match snapshot', () => {
    expect(packageExports).toMatchSnapshot();
  });
});
