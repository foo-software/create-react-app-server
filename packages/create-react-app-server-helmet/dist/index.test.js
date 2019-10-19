import * as packageExports from '.';
describe('@foo-software/create-react-app-server-helmet', function () {
  it('should match snapshot', function () {
    expect(packageExports).toMatchSnapshot();
  });
});