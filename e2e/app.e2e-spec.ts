import { IterAdminPage } from './app.po';

describe('iter-admin App', function() {
  let page: IterAdminPage;

  beforeEach(() => {
    page = new IterAdminPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
