import { faker } from '@faker-js/faker';
import { jest } from '@jest/globals';
import { InjectAtlasSdkDriver } from './inject-atlas-sdk.driver.js';

describe('injectAtlasSdk', () => {
  let driver: InjectAtlasSdkDriver;

  beforeEach(() => {
    driver = new InjectAtlasSdkDriver();
  });

  describe('when injected inside an app context', () => {
    beforeEach(() => {
      driver.when.injected();
    });

    it('should expose custom SDK functions when injected', () => {
      driver.get.atlas().greet();

      expect(driver.get.greetMock()).toHaveBeenCalledTimes(1);
    });

    it('should expose host data as a signal that follows host updates when the host renames the user', () => {
      const userName = faker.person.firstName();

      driver.when.userRenamed(userName);

      expect(driver.get.atlas().hostData().userName).toBe(userName);
    });

    it('should update the host sdk host data when a host component updates host data through the injected sdk', () => {
      const userName = faker.person.firstName();

      driver.when.hostDataUpdatedThroughInjectedSdk(userName);

      expect(driver.get.sdk().hostData.userName).toBe(userName);
    });

    it('should expose the new host data on the injected signal when a host component updates host data through the injected sdk', () => {
      const userName = faker.person.firstName();

      driver.when.hostDataUpdatedThroughInjectedSdk(userName);

      expect(driver.get.atlas().hostData().userName).toBe(userName);
    });

    it('should expose the new host data on another injected sdk when a host component updates host data through the first', () => {
      const userName = faker.person.firstName();

      driver.when.injectedAgain();
      driver.when.hostDataUpdatedThroughInjectedSdk(userName);

      expect(driver.get.otherAtlas().hostData().userName).toBe(userName);
    });

    it('should stop following host updates when the injector is destroyed', () => {
      const before = driver.get.atlas().hostData().userName;

      driver.when.injectorDestroyed();
      driver.when.userRenamed(faker.person.firstName());

      expect(driver.get.atlas().hostData().userName).toBe(before);
    });

    it('should resolve asset urls inside the app artifact when injected with an app context', () => {
      const artifactDirectory = new URL(
        '.',
        driver.get.context()?.manifest.remoteEntryUrl,
      ).href;

      expect(driver.get.atlas().assetUrl('logo.svg')).toBe(
        `${artifactDirectory}logo.svg`,
      );
    });
  });

  it('should throw ATLAS_APP_CONTEXT_MISSING when assetUrl is called after injecting without an app context', () => {
    driver.given.appContext(undefined).when.injected();

    expect(() => driver.get.atlas().assetUrl('logo.svg')).toThrow(
      expect.objectContaining({ code: 'ATLAS_APP_CONTEXT_MISSING' }),
    );
  });

  it('should call the overridden getWidget with widget id and options when getWidget is called', () => {
    const getWidget = jest.fn();
    const widgetId = faker.string.uuid();
    const options = { inputs: { count: faker.number.int() } };

    driver.given.facadeOverrides({ getWidget }).when.injected();

    driver.get.atlas().getWidget(widgetId, options);

    expect(getWidget).toHaveBeenCalledWith(widgetId, options);
  });

  it('should return a binding with widget id and inputs when getWidget is overridden', () => {
    const widgetId = faker.string.uuid();
    const inputs = { count: faker.number.int() };

    driver.given.facadeOverrides({ getWidget: jest.fn() }).when.injected();

    expect(driver.get.atlas().getWidget(widgetId, { inputs })).toEqual({
      widgetId,
      inputs,
    });
  });

  it('should return the overridden asset url when assetUrl is overridden', () => {
    const url = faker.internet.url();

    driver.given
      .facadeOverrides({ assetUrl: jest.fn(() => url) })
      .when.injected();

    expect(driver.get.atlas().assetUrl(faker.system.fileName())).toBe(url);
  });

  it('should return the overridden asset url when assetUrl is overridden without an app context', () => {
    const url = faker.internet.url();

    driver.given
      .appContext(undefined)
      .given.facadeOverrides({ assetUrl: jest.fn(() => url) })
      .when.injected();

    expect(driver.get.atlas().assetUrl(faker.system.fileName())).toBe(url);
  });

  it('should return the overridden asset base url when assetBaseUrl is overridden', () => {
    const url = faker.internet.url();

    driver.given
      .facadeOverrides({ assetBaseUrl: jest.fn(() => url) })
      .when.injected();

    expect(driver.get.atlas().assetBaseUrl()).toBe(url);
  });

  it('should expose custom SDK functions when facade overrides are connected', () => {
    driver.given.facadeOverrides({ getWidget: jest.fn() }).when.injected();

    driver.get.atlas().greet();

    expect(driver.get.greetMock()).toHaveBeenCalledTimes(1);
  });
});
