/** @jest-environment jsdom */

import { faker } from '@faker-js/faker';
import { jest } from '@jest/globals';
import { ReactAtlasSdkDriver } from './react-atlas-sdk.driver.js';

describe('createReactAtlasSdk', () => {
  let driver: ReactAtlasSdkDriver;

  beforeEach(() => {
    driver = new ReactAtlasSdkDriver();
  });

  it('should return the same component when getWidget is called twice with the same id', () => {
    const widgetId = faker.string.uuid();

    expect(driver.get.widget(widgetId)).toBe(driver.get.widget(widgetId));
  });

  it('should throw ATLAS_APP_CONTEXT_MISSING when assetUrl is called without an app context', () => {
    expect(() => driver.get.reactSdk().assetUrl('logo.svg')).toThrow(
      expect.objectContaining({ code: 'ATLAS_APP_CONTEXT_MISSING' }),
    );
  });

  it('should resolve the asset inside the app artifact directory when created with an app context', () => {
    const artifactDirectory = `${faker.internet.url()}/${faker.system.semver()}/`;

    driver.given.remoteEntryUrl(`${artifactDirectory}remoteEntry.json`);

    expect(driver.get.reactSdk().assetUrl('logo.svg')).toBe(
      `${artifactDirectory}logo.svg`,
    );
  });

  it('should call the overridden getWidget with widget id and options when getWidget is called', () => {
    const getWidget = jest.fn();
    const widgetId = faker.string.uuid();
    const options = { loadingComponent: () => null };

    driver.given.facadeOverrides({ getWidget });

    driver.get.widget(widgetId, options);

    expect(getWidget).toHaveBeenCalledWith(widgetId, options);
  });

  it('should return the component of the overridden getWidget when getWidget is overridden', () => {
    const Widget = () => null;

    driver.given.facadeOverrides({ getWidget: jest.fn(() => Widget) });

    expect(driver.get.widget(faker.string.uuid())).toBe(Widget);
  });

  it('should return a widget component when the overridden getWidget returns undefined', () => {
    driver.given.facadeOverrides({ getWidget: jest.fn() });

    expect(driver.get.widget(faker.string.uuid())).toEqual(
      expect.any(Function),
    );
  });

  it('should return the overridden asset url when assetUrl is overridden without an app context', () => {
    const url = faker.internet.url();

    driver.given.facadeOverrides({ assetUrl: jest.fn(() => url) });

    expect(driver.get.reactSdk().assetUrl(faker.system.fileName())).toBe(url);
  });

  it('should return the overridden asset base url when assetBaseUrl is overridden', () => {
    const url = faker.internet.url();

    driver.given.facadeOverrides({ assetBaseUrl: jest.fn(() => url) });

    expect(driver.get.reactSdk().assetBaseUrl()).toBe(url);
  });
});
