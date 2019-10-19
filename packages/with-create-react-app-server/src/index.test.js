import * as packageExports from '.';

describe('@foo-software/with-create-react-app-server', () => {
  it('should match snapshot', () => {
    expect(packageExports).toMatchSnapshot();
  });
});
