import { faker } from '@faker-js/faker';
import { jest } from '@jest/globals';
import { ProvideMockAtlasEnvironmentDriver } from './provide-mock-atlas-environment.driver.js';

describe('provideMockAtlasEnvironment', () => {
  let driver: ProvideMockAtlasEnvironmentDriver;

  beforeEach(() => {
    driver = new ProvideMockAtlasEnvironmentDriver();
  });

  describe('when provided with an app', () => {
    beforeEach(() => {
      driver.when.provided();
    });

    it('should resolve asset urls inside the mocked app artifact when an asset url is requested', () => {
      const artifactDirectory = new URL(
        '.',
        driver.get.environment().context?.manifest.remoteEntryUrl,
      ).href;

      expect(driver.get.atlas().assetUrl('logo.svg')).toBe(
        `${artifactDirectory}logo.svg`,
      );
    });

    it('should report not ready when the app defers its loaded state', () => {
      driver.get.appLoaded();

      expect(driver.get.environment().isReady()).toBe(false);
    });
  });

  it('should expose the mocked host extension through injectAtlasSdk when the extension is mocked', () => {
    const greeting = faker.lorem.sentence();
    const greet = jest.fn(() => greeting);

    driver.given.overrides({ sdk: { greet } }).when.provided();

    expect(driver.get.atlas().greet()).toBe(greeting);
  });

  it('should expose updated host data through the host data signal when host data is updated', () => {
    const userName = faker.person.firstName();

    driver.given
      .overrides({ sdk: { hostData: { userName: faker.person.firstName() } } })
      .when.provided();
    const atlas = driver.get.atlas();

    driver.get.environment().updateHostData({ userName });

    expect(atlas.hostData().userName).toBe(userName);
  });

  it('should read the inner app url through the router location strategy when a url is mocked', () => {
    const path = `/${faker.lorem.slug()}`;
    const innerPath = `/${faker.lorem.slug()}`;

    driver.given
      .overrides({ app: { path, url: `${path}${innerPath}` } })
      .when.provided();

    expect(driver.get.locationStrategy().path()).toBe(innerPath);
  });

  it('should throw ATLAS_APP_CONTEXT_MISSING when an asset url is requested when the app is null', () => {
    driver.given.overrides({ app: null }).when.provided();

    expect(() => driver.get.atlas().assetUrl('logo.svg')).toThrow(
      expect.objectContaining({ code: 'ATLAS_APP_CONTEXT_MISSING' }),
    );
  });

  it('should call the mocked getWidget with widget id and options when a widget is requested through injectAtlasSdk', () => {
    const getWidget = jest.fn();
    const widgetId = faker.string.uuid();
    const options = { inputs: { count: faker.number.int() } };

    driver.given.overrides({ sdk: { getWidget } }).when.provided();

    driver.get.atlas().getWidget(widgetId, options);

    expect(getWidget).toHaveBeenCalledWith(widgetId, options);
  });

  it('should return the mocked asset url through injectAtlasSdk when assetUrl is mocked', () => {
    const url = faker.internet.url();

    driver.given
      .overrides({ sdk: { assetUrl: jest.fn(() => url) } })
      .when.provided();

    expect(driver.get.atlas().assetUrl(faker.system.fileName())).toBe(url);
  });

  it('should return the mocked asset base url through injectAtlasSdk when assetBaseUrl is mocked', () => {
    const url = faker.internet.url();

    driver.given
      .overrides({ sdk: { assetBaseUrl: jest.fn(() => url) } })
      .when.provided();

    expect(driver.get.atlas().assetBaseUrl()).toBe(url);
  });
});
