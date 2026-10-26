export interface AtlasSdkFacadeOverrides {
  getWidget?(widgetId: string, options?: object): unknown;
  assetUrl?(path: string): string;
  assetBaseUrl?(): string;
}

type FacadeGetWidgetOverride = (widgetId: string, options?: object) => unknown;

type WrapGetWidgetOverride<TGetWidget> = (
  getWidget: FacadeGetWidgetOverride,
) => TGetWidget;

const facadeOverrides = new WeakMap<object, AtlasSdkFacadeOverrides>();

export function connectAtlasSdkFacadeOverrides(
  sdk: object,
  overrides: AtlasSdkFacadeOverrides,
): void {
  facadeOverrides.set(sdk, overrides);
}

export function overrideAtlasSdkFacade<
  TFacade extends { readonly getWidget: TGetWidget },
  TGetWidget,
>(
  sdk: object,
  facade: TFacade,
  wrapGetWidgetOverride: WrapGetWidgetOverride<TGetWidget>,
): TFacade {
  const overrides = facadeOverrides.get(sdk);

  if (!overrides) return facade;

  const { getWidget, assetUrl, assetBaseUrl } = overrides;
  const overridden: TFacade = Object.create(facade);

  if (getWidget) {
    Object.defineProperty(overridden, 'getWidget', {
      value: wrapGetWidgetOverride(getWidget),
    });
  }

  if (assetUrl) {
    Object.defineProperty(overridden, 'assetUrl', { value: assetUrl });
  }

  if (assetBaseUrl) {
    Object.defineProperty(overridden, 'assetBaseUrl', { value: assetBaseUrl });
  }

  return overridden;
}
