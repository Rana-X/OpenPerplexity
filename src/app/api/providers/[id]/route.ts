import configManager from '@/lib/config';
import {
  mergeProviderSecretsForUpdate,
  sanitizeModelProviderForClient,
} from '@/lib/config/clientSafe';
import ModelRegistry from '@/lib/models/registry';
import { NextRequest } from 'next/server';
import { isDemoModeEnabled } from '@/lib/demo';

export const DELETE = async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) => {
  try {
    if (isDemoModeEnabled()) {
      return Response.json(
        { message: 'Provider changes are disabled in demo mode.' },
        { status: 403 },
      );
    }

    const { id } = await params;

    if (!id) {
      return Response.json(
        {
          message: 'Provider ID is required.',
        },
        {
          status: 400,
        },
      );
    }

    const registry = new ModelRegistry();
    await registry.removeProvider(id);

    return Response.json(
      {
        message: 'Provider deleted successfully.',
      },
      {
        status: 200,
      },
    );
  } catch (err: any) {
    console.error('An error occurred while deleting provider', err.message);
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

export const PATCH = async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) => {
  try {
    if (isDemoModeEnabled()) {
      return Response.json(
        { message: 'Provider changes are disabled in demo mode.' },
        { status: 403 },
      );
    }

    const body = await req.json();
    const { name, config } = body;
    const { id } = await params;

    if (!id || !name || !config) {
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
    const currentProvider = configManager
      .getCurrentConfig()
      .modelProviders.find((provider) => provider.id === id);

    if (!currentProvider) {
      return Response.json(
        {
          message: 'Provider not found.',
        },
        {
          status: 404,
        },
      );
    }

    const modelProviderFields = configManager.getUIConfigSections().modelProviders;
    const mergedConfig = mergeProviderSecretsForUpdate(
      currentProvider,
      config,
      modelProviderFields,
    );

    const updatedProvider = await registry.updateProvider(
      id,
      name,
      mergedConfig,
    );

    return Response.json(
      {
        provider: sanitizeModelProviderForClient(
          updatedProvider,
          modelProviderFields,
        ),
      },
      {
        status: 200,
      },
    );
  } catch (err: any) {
    console.error('An error occurred while updating provider', err.message);
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
