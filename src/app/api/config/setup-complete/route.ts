import configManager from '@/lib/config';
import { NextRequest } from 'next/server';
import { isDemoModeEnabled } from '@/lib/demo';

export const POST = async (req: NextRequest) => {
  try {
    if (isDemoModeEnabled()) {
      return Response.json(
        { message: 'Setup changes are disabled in demo mode.' },
        { status: 403 },
      );
    }

    configManager.markSetupComplete();

    return Response.json(
      {
        message: 'Setup marked as complete.',
      },
      {
        status: 200,
      },
    );
  } catch (err) {
    console.error('Error marking setup as complete: ', err);
    return Response.json(
      { message: 'An error has occurred.' },
      { status: 500 },
    );
  }
};
