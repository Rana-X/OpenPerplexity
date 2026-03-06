'use client';

import { useEffect, useState } from 'react';
import EmptyChatMessageInput from './EmptyChatMessageInput';
import WeatherWidget from './WeatherWidget';
import NewsArticleWidget from './NewsArticleWidget';
import SettingsButtonMobile from '@/components/Settings/SettingsButtonMobile';
import {
  getShowNewsWidget,
  getShowWeatherWidget,
} from '@/lib/config/clientRegistry';

const EmptyChat = () => {
  const [showWeather, setShowWeather] = useState(() =>
    typeof window !== 'undefined' ? getShowWeatherWidget() : true,
  );
  const [showNews, setShowNews] = useState(() =>
    typeof window !== 'undefined' ? getShowNewsWidget() : true,
  );

  useEffect(() => {
    const updateWidgetVisibility = () => {
      setShowWeather(getShowWeatherWidget());
      setShowNews(getShowNewsWidget());
    };

    updateWidgetVisibility();

    window.addEventListener('client-config-changed', updateWidgetVisibility);
    window.addEventListener('storage', updateWidgetVisibility);

    return () => {
      window.removeEventListener(
        'client-config-changed',
        updateWidgetVisibility,
      );
      window.removeEventListener('storage', updateWidgetVisibility);
    };
  }, []);

  return (
    <div className="relative">
      <div className="absolute right-0 top-0 z-10 px-1 pt-5 sm:px-4">
        <div className="rounded-full border border-light-200 bg-light-primary/85 px-3 py-2 backdrop-blur-xl dark:border-dark-200 dark:bg-dark-primary/85">
          <SettingsButtonMobile />
        </div>
      </div>
      <div className="flex min-h-screen flex-col items-center justify-center max-w-screen-lg mx-auto px-2 pb-28 pt-24 lg:pb-8">
        <div className="mx-auto flex w-full max-w-3xl flex-col items-center space-y-6 text-center">
          <div className="space-y-3">
            <h2 className="text-4xl font-semibold tracking-[-0.05em] text-[#111827] dark:text-white sm:text-5xl">
              OpenPerplexity
            </h2>
            <p className="mx-auto max-w-2xl text-sm leading-7 text-black/60 dark:text-white/60 sm:text-base">
              Grounded search, cited answers, and model control in one
              workspace.
            </p>
          </div>
          <div className="w-full">
            <EmptyChatMessageInput />
          </div>
        </div>
        {(showWeather || showNews) && (
          <div className="mt-6 flex w-full max-w-3xl flex-col gap-4 sm:flex-row sm:justify-center">
            {showWeather && (
              <div className="flex-1 w-full">
                <WeatherWidget />
              </div>
            )}
            {showNews && (
              <div className="flex-1 w-full">
                <NewsArticleWidget />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default EmptyChat;
