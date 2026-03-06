import configManager from '@/lib/config';
import { sanitizeModelProviderForClient } from '@/lib/config/clientSafe';
import ModelRegistry from '@/lib/models/registry';
import { NextRequest } from 'next/server';
import { isDemoModeEnabled } from '@/lib/demo';

export const GET = async (req: Request) => {
  try {
    const registry = new ModelRegistry();

    const activeProviders = await registry.getActiveProviders();

    const filteredProviders = activeProviders.filter((p) => {
      return !p.chatModels.some((m) => m.key === 'error');
    });

    return Response.json(
      {
        providers: filteredProviders,
      },
      {
        status: 200,
      },
    );
  } catch (err) {
    console.error('An error occurred while fetching providers', err);
    return Response.json(
      {
        message: 'An error has occurred.',
      },
      {
        status: 500,
      },
    );
  }
};

export const POST = async (req: NextRequest) => {
  try {
    if (isDemoModeEnabled()) {
      return Response.json(
        { message: 'Provider changes are disabled in demo mode.' },
        { status: 403 },
      );
    }

    const body = await req.json();
    const { type, name, config } = body;

    if (!type || !name || !config) {
      return Response.json(
        {
          message: 'Missing required fields.',
        },
        {
          status: 400,
        },
      );
    }

    const registry = new ModelRegistry();
    const modelProviderFields = configManager.getUIConfigSections().modelProviders;

    const newProvider = await registry.addProvider(type, name, config);

    return Response.json(
      {
        provider: sanitizeModelProviderForClient(
          newProvider,
          modelProviderFields,
        ),
      },
      {
        status: 200,
      },
    );
  } catch (err) {
    console.error('An error occurred while creating provider', err);
    return Response.json(
      {
        message: 'An error has occurred.',
      },
      {
        status: 500,
      },
    );
  }
};
