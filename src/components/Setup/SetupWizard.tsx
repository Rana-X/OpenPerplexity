'use client';

import { useEffect, useState } from 'react';
import { UIConfigSections } from '@/lib/config/types';
import { AnimatePresence, motion } from 'framer-motion';
import SetupConfig from './SetupConfig';

const SetupWizard = ({
  configSections,
}: {
  configSections: UIConfigSections;
}) => {
  const [showWelcome, setShowWelcome] = useState(true);
  const [showSetup, setShowSetup] = useState(false);
  const [setupState, setSetupState] = useState(1);

  const delay = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  useEffect(() => {
    (async () => {
      await delay(2500);
      setShowWelcome(false);
      await delay(600);
      setShowSetup(true);
      setSetupState(1);
      await delay(1500);
      setSetupState(2);
    })();
  }, []);

  return (
    <div className="fixed inset-0 h-screen w-screen overflow-hidden bg-[linear-gradient(180deg,#f8fbff_0%,#f3f7fb_100%)] dark:bg-[linear-gradient(180deg,#0b1120_0%,#0f172a_100%)]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.18),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(20,184,166,0.16),transparent_30%)]" />
      <AnimatePresence>
        {showWelcome && (
          <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
            <motion.div
              className="absolute flex h-full flex-col items-center justify-center px-6 text-center"
              initial={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              transition={{ duration: 0.6 }}
            >
              <motion.div
                transition={{ duration: 0.6 }}
                initial={{ opacity: 0, translateY: '30px' }}
                animate={{ opacity: 1, translateY: '0px' }}
                className="space-y-4"
              >
                <h2 className="text-4xl font-semibold tracking-[-0.06em] text-[#111827] dark:text-white md:text-6xl xl:text-8xl">
                  Open research,
                  <span className="block font-serif italic text-[#2563eb]">
                    orchestrated.
                  </span>
                </h2>
                <p className="mx-auto max-w-2xl text-sm leading-7 text-black/65 dark:text-white/60 md:text-lg xl:text-2xl">
                  OpenPerplexity combines live search, grounded answers, and
                  model control in one workspace built for investigation.
                </p>
              </motion.div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{
                opacity: 0.28,
                scale: 1,
                transition: { delay: 0.8, duration: 0.7 },
              }}
              exit={{ opacity: 0, scale: 1.1, transition: { duration: 0.6 } }}
              className="absolute left-1/2 top-1/2 z-40 h-[240px] w-[240px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#2563eb] blur-[120px]"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.65 }}
              animate={{
                opacity: 0.2,
                scale: 1,
                transition: { delay: 1.1, duration: 0.8 },
              }}
              exit={{ opacity: 0, scale: 1.1, transition: { duration: 0.6 } }}
              className="absolute right-[20%] top-[26%] h-[200px] w-[200px] rounded-full bg-[#14b8a6] blur-[120px]"
            />
          </div>
        )}
        {showSetup && (
          <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
            <AnimatePresence mode="wait">
              {setupState === 1 && (
                <motion.div
                  key="setup-text"
                  transition={{ duration: 0.6 }}
                  initial={{ opacity: 0, translateY: '30px' }}
                  animate={{ opacity: 1, translateY: '0px' }}
                  exit={{
                    opacity: 0,
                    translateY: '-30px',
                    transition: { duration: 0.6 },
                  }}
                  className="flex flex-col items-center gap-6 px-6 text-center"
                >
                  <p className="text-2xl font-semibold tracking-[-0.06em] text-[#111827] dark:text-white md:text-4xl xl:text-6xl">
                    Configure OpenPerplexity with the models and search layer
                    you actually want to use.
                  </p>
                </motion.div>
              )}
              {setupState > 1 && (
                <motion.div
                  key="setup-config"
                  initial={{ opacity: 0, translateY: '30px' }}
                  animate={{
                    opacity: 1,
                    translateY: '0px',
                    transition: { duration: 0.6 },
                  }}
                >
                  <SetupConfig
                    configSections={configSections}
                    setupState={setupState}
                    setSetupState={setSetupState}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SetupWizard;
