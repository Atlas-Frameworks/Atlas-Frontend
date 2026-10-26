/** @jest-environment jsdom */
import { faker } from '@faker-js/faker';
import { jest } from '@jest/globals';
import { MockAtlasEnvironmentProviderDriver } from './mock-atlas-environment-provider.driver.js';

describe('MockAtlasEnvironmentProvider', () => {
  let driver: MockAtlasEnvironmentProviderDriver;

  beforeEach(() => {
    driver = new MockAtlasEnvironmentProviderDriver();
  });

  describe('when rendered with an app', () => {
    beforeEach(() => {
      driver.when.rendered();
    });

    it('should provide the document head as style target when rendered', () => {
      expect(driver.get.result().styleTarget).toBe(document.head);
    });

    it('should resolve asset urls inside the mocked app artifact when an asset url is requested', () => {
      const artifactDirectory = new URL(
        '.',
        driver.get.environment().context?.manifest.remoteEntryUrl,
      ).href;

      expect(driver.get.result().atlas.assetUrl('logo.svg')).toBe(
        `${artifactDirectory}logo.svg`,
      );
    });
  });

  it('should report not ready when the app defers its loaded state', () => {
    driver.when.appLoadedRendered();

    expect(driver.get.environment().isReady()).toBe(false);
  });

  it('should expose the mocked host extension through useAtlasSdk when the extension is mocked', () => {
    const greeting = faker.lorem.sentence();
    const greet = jest.fn(() => greeting);

    driver.given.overrides({ sdk: { greet } }).when.rendered();

    expect(driver.get.result().atlas.greet()).toBe(greeting);
  });

  it('should re-render with updated host data when host data is updated', () => {
    const userName = faker.person.firstName();

    driver.given
      .overrides({ sdk: { hostData: { userName: faker.person.firstName() } } })
      .when.rendered();

    driver.when.hostDataUpdated(userName);

    expect(driver.get.result().atlas.hostData.userName).toBe(userName);
  });

  it('should throw ATLAS_APP_CONTEXT_MISSING when an asset url is requested when the app is null', () => {
    driver.given.overrides({ app: null }).when.rendered();

    expect(() => driver.get.result().atlas.assetUrl('logo.svg')).toThrow(
      expect.objectContaining({ code: 'ATLAS_APP_CONTEXT_MISSING' }),
    );
  });

  it('should call the mocked getWidget with widget id and options when a widget is requested through useAtlasSdk', () => {
    const getWidget = jest.fn();
    const widgetId = faker.string.uuid();
    const options = { loadingComponent: () => null };

    driver.given.overrides({ sdk: { getWidget } }).when.rendered();

    driver.get.result().atlas.getWidget(widgetId, options);

    expect(getWidget).toHaveBeenCalledWith(widgetId, options);
  });

  it('should return the mocked widget component through useAtlasSdk when getWidget returns a component', () => {
    const Widget = () => null;

    driver.given
      .overrides({ sdk: { getWidget: jest.fn(() => Widget) } })
      .when.rendered();

    expect(driver.get.result().atlas.getWidget(faker.string.uuid())).toBe(
      Widget,
    );
  });

  it('should return the mocked asset url through useAtlasSdk when assetUrl is mocked', () => {
    const url = faker.internet.url();

    driver.given
      .overrides({ sdk: { assetUrl: jest.fn(() => url) } })
      .when.rendered();

    expect(driver.get.result().atlas.assetUrl(faker.system.fileName())).toBe(
      url,
    );
  });

  it('should return the mocked asset base url through useAtlasSdk when assetBaseUrl is mocked', () => {
    const url = faker.internet.url();

    driver.given
      .overrides({ sdk: { assetBaseUrl: jest.fn(() => url) } })
      .when.rendered();

    expect(driver.get.result().atlas.assetBaseUrl()).toBe(url);
  });
});
