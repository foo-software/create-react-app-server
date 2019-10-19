import * as packageExports from '.';

describe('@foo-software/create-react-app-server-helmet', () => {
  it('should match snapshot', () => {
    expect(packageExports).toMatchSnapshot();
  });
});
