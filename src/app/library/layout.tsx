import { Metadata } from 'next';
import React from 'react';
import { isDemoModeEnabled } from '@/lib/demo';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Library - OpenPerplexity',
};

const Layout = ({ children }: { children: React.ReactNode }) => {
  if (isDemoModeEnabled()) {
    redirect('/');
  }

  return <div>{children}</div>;
};

export default Layout;
