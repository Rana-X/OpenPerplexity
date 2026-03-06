import configManager from '@/lib/config';
import { sanitizeModelProvidersForClient } from '@/lib/config/clientSafe';
import ModelRegistry from '@/lib/models/registry';
import { NextRequest, NextResponse } from 'next/server';
import { ConfigModelProvider } from '@/lib/config/types';
import { isDemoModeEnabled } from '@/lib/demo';

type SaveConfigBody = {
  key: string;
  value: string;
};

const getDemoConfigResponse = () => {
  const fields = configManager.getUIConfigSections();

  return {
    values: {
      preferences: {},
      personalization: {},
      modelProviders: [],
      search: {},
    },
    fields: {
      preferences: fields.preferences.filter((field) => field.scope === 'client'),
      personalization: fields.personalization.filter(
        (field) => field.scope === 'client',
      ),
      modelProviders: [],
      search: [],
    },
  };
};

export const GET = async (req: NextRequest) => {
  try {
    if (isDemoModeEnabled()) {
      return NextResponse.json(getDemoConfigResponse());
    }

    const values = configManager.getCurrentConfig();
    const fields = configManager.getUIConfigSections();

    const modelRegistry = new ModelRegistry();
    const activeProviders = await modelRegistry.getActiveProviders();

    const modelProviders = values.modelProviders.map(
      (mp: ConfigModelProvider) => {
        const activeProvider = activeProviders.find((p) => p.id === mp.id);

        return {
          ...mp,
          chatModels: activeProvider?.chatModels ?? mp.chatModels,
          embeddingModels:
            activeProvider?.embeddingModels ?? mp.embeddingModels,
        };
      },
    );

    return NextResponse.json({
      values: {
        ...values,
        modelProviders: sanitizeModelProvidersForClient(
          modelProviders,
          fields.modelProviders,
        ),
      },
      fields,
    });
  } catch (err) {
    console.error('Error in getting config: ', err);
    return Response.json(
      { message: 'An error has occurred.' },
      { status: 500 },
    );
  }
};

export const POST = async (req: NextRequest) => {
  try {
    if (isDemoModeEnabled()) {
      return Response.json(
        { message: 'Configuration changes are disabled in demo mode.' },
        { status: 403 },
      );
    }

    const body: SaveConfigBody = await req.json();

    if (!body.key || !body.value) {
      return Response.json(
        {
          message: 'Key and value are required.',
        },
        {
          status: 400,
        },
      );
    }

    configManager.updateConfig(body.key, body.value);

    return Response.json(
      {
        message: 'Config updated successfully.',
      },
      {
        status: 200,
      },
    );
  } catch (err) {
    console.error('Error in getting config: ', err);
    return Response.json(
      { message: 'An error has occurred.' },
      { status: 500 },
    );
  }
};
