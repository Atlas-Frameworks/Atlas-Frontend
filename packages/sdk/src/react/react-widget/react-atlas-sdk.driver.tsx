import { faker } from '@faker-js/faker';
import { anAppManifest } from '@atlas/testkit';
import type { AtlasAppContext } from '../../lifecycle.js';
import {
  connectAtlasSdkFacadeOverrides,
  type AtlasSdkFacadeOverrides,
} from '../../core/sdk-facade-overrides/sdk-facade-overrides.js';
import {
  connectAtlasWidgetResolver,
  createAtlasSdk,
} from '../../core/sdk-factory/index.js';
import { anAppContext } from '../../testkit/app-context.testkit.js';
import { aMemoryNavigation } from '../../testkit/navigation.testkit.js';
import { createReactAtlasSdk } from './react-atlas-sdk.js';
import type { ReactGetWidgetOptions } from './react-widget.types.js';

export class ReactAtlasSdkDriver {
  private readonly sdk = createAtlasSdk({
    hostId: faker.string.uuid(),
    navigation: aMemoryNavigation(),
  });
  private context: AtlasAppContext | undefined;

  constructor() {
    connectAtlasWidgetResolver(this.sdk, (widgetId) => ({
      id: widgetId,
      name: faker.commerce.productName(),
      mount: async () => ({ unmount: async () => undefined }),
    }));
  }

  readonly given = {
    remoteEntryUrl: (remoteEntryUrl: string) => {
      this.context = anAppContext({
        manifest: anAppManifest({ remoteEntryUrl }),
      });

      return this;
    },
    facadeOverrides: (overrides: AtlasSdkFacadeOverrides) => {
      connectAtlasSdkFacadeOverrides(this.sdk, overrides);

      return this;
    },
  };

  readonly get = {
    widget: (widgetId: string, options?: ReactGetWidgetOptions) =>
      this.get.reactSdk().getWidget<object>(widgetId, options),
    reactSdk: () => createReactAtlasSdk(this.sdk, this.context),
  };
}
