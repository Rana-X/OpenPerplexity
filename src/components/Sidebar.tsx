'use client';

import { cn } from '@/lib/utils';
import {
  Home,
  Search,
} from 'lucide-react';
import Link from 'next/link';
import { useSelectedLayoutSegments } from 'next/navigation';
import React, { type ReactNode } from 'react';
import Layout from './Layout';
import SettingsButton from './Settings/SettingsButton';

const VerticalIconContainer = ({ children }: { children: ReactNode }) => {
  return <div className="flex flex-col items-center w-full">{children}</div>;
};

const Sidebar = ({ children }: { children: React.ReactNode }) => {
  const segments = useSelectedLayoutSegments();

  const navLinks = [
    {
      icon: Home,
      href: '/',
      active: segments.length === 0 || segments.includes('c'),
      label: 'Home',
    },
    {
      icon: Search,
      href: '/discover',
      active: segments.includes('discover'),
      label: 'Discover',
    },
  ];

  const handleHomeNavigation = (
    event: React.MouseEvent<HTMLAnchorElement, MouseEvent>,
  ) => {
    event.preventDefault();
    window.location.href = '/';
  };

  return (
    <div>
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-[76px] lg:flex-col border-r border-light-200/60 dark:border-dark-200/60">
        <div className="flex grow flex-col items-center justify-between gap-y-5 overflow-y-auto bg-light-100/80 px-3 py-6 backdrop-blur-xl dark:bg-dark-100/85">
          <VerticalIconContainer>
            {navLinks.map((link, i) => (
              <Link
                key={i}
                href={link.href}
                onClick={link.href === '/' ? handleHomeNavigation : undefined}
                className={cn(
                  'relative flex flex-col items-center justify-center space-y-1 cursor-pointer w-full py-2 rounded-2xl',
                  link.active
                    ? 'text-[#111827] dark:text-white'
                    : 'text-black/55 dark:text-white/60',
                )}
              >
                <div
                  className={cn(
                    link.active &&
                      'bg-[linear-gradient(135deg,rgba(37,99,235,0.14),rgba(20,184,166,0.14))] border border-sky-200 dark:border-white/10',
                    'group rounded-2xl border border-transparent hover:border-light-200 hover:bg-white/70 dark:hover:border-white/10 dark:hover:bg-white/5 transition duration-200',
                  )}
                >
                  <link.icon
                    size={25}
                    className={cn(
                      !link.active && 'group-hover:scale-105',
                      'transition duration:200 m-1.5',
                    )}
                  />
                </div>
                <p
                  className={cn(
                    link.active
                      ? 'text-[#111827] dark:text-white'
                      : 'text-black/55 dark:text-white/60',
                    'text-[10px] uppercase tracking-[0.18em]',
                  )}
                >
                  {link.label}
                </p>
              </Link>
            ))}
          </VerticalIconContainer>

          <SettingsButton />
        </div>
      </div>

      <div className="fixed bottom-0 w-full z-50 flex flex-row items-center gap-x-6 bg-light-100/95 dark:bg-dark-100/95 px-4 py-4 shadow-[0_-12px_32px_rgba(15,23,42,0.08)] backdrop-blur-xl lg:hidden">
        {navLinks.map((link, i) => (
          <Link
            href={link.href}
            key={i}
            onClick={link.href === '/' ? handleHomeNavigation : undefined}
            className={cn(
              'relative flex flex-col items-center space-y-1 text-center w-full',
              link.active
                ? 'text-black dark:text-white'
                : 'text-black dark:text-white/70',
            )}
          >
            {link.active && (
              <div className="absolute top-0 -mt-4 h-1 w-full rounded-b-lg bg-[linear-gradient(90deg,#2563eb,#14b8a6)]" />
            )}
            <link.icon />
            <p className="text-xs">{link.label}</p>
          </Link>
        ))}
      </div>

      <Layout>{children}</Layout>
    </div>
  );
};

export default Sidebar;
