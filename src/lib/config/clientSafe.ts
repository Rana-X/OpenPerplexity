import {
  ConfigModelProvider,
  ModelProviderUISection,
  UIConfigField,
} from './types';

const getProviderFields = (
  type: string,
  modelProviders: ModelProviderUISection[],
): UIConfigField[] => {
  return modelProviders.find((provider) => provider.key === type)?.fields ?? [];
};

export const sanitizeModelProviderForClient = (
  provider: ConfigModelProvider,
  modelProviders: ModelProviderUISection[],
): ConfigModelProvider => {
  const hiddenConfigFields: string[] = [];
  const config = { ...provider.config };

  getProviderFields(provider.type, modelProviders).forEach((field) => {
    if (field.type !== 'password') return;

    if (config[field.key]) {
      hiddenConfigFields.push(field.key);
    }

    delete config[field.key];
  });

  return {
    ...provider,
    config,
    hiddenConfigFields,
  };
};

export const sanitizeModelProvidersForClient = (
  providers: ConfigModelProvider[],
  modelProviders: ModelProviderUISection[],
): ConfigModelProvider[] => {
  return providers.map((provider) =>
    sanitizeModelProviderForClient(provider, modelProviders),
  );
};

export const mergeProviderSecretsForUpdate = (
  currentProvider: ConfigModelProvider,
  nextConfig: Record<string, any>,
  modelProviders: ModelProviderUISection[],
): Record<string, any> => {
  const mergedConfig = { ...nextConfig };

  getProviderFields(currentProvider.type, modelProviders).forEach((field) => {
    if (field.type !== 'password') return;

    const nextValue = mergedConfig[field.key];

    if (nextValue === '' || nextValue == null) {
      if (currentProvider.config[field.key]) {
        mergedConfig[field.key] = currentProvider.config[field.key];
      } else {
        delete mergedConfig[field.key];
      }
    }
  });

  return mergedConfig;
};
