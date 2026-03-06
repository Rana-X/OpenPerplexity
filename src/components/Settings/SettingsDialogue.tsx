import { Dialog, DialogPanel } from '@headlessui/react';
import {
  ArrowLeft,
  BrainCog,
  ChevronLeft,
  Search,
  Sliders,
  ToggleRight,
} from 'lucide-react';
import Preferences from './Sections/Preferences';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import Loader from '../ui/Loader';
import { cn } from '@/lib/utils';
import Models from './Sections/Models/Section';
import SearchSection from './Sections/Search';
import Select from '@/components/ui/Select';
import Personalization from './Sections/Personalization';
import { useChat } from '@/lib/hooks/useChat';

const allSections = [
  {
    key: 'preferences',
    name: 'Preferences',
    description: 'Customize your application preferences.',
    icon: Sliders,
    component: Preferences,
    dataAdd: 'preferences',
  },
  {
    key: 'personalization',
    name: 'Personalization',
    description: 'Customize the behavior and tone of the model.',
    icon: ToggleRight,
    component: Personalization,
    dataAdd: 'personalization',
  },
  {
    key: 'models',
    name: 'Models',
    description: 'Connect to AI services and manage connections.',
    icon: BrainCog,
    component: Models,
    dataAdd: 'modelProviders',
  },
  {
    key: 'search',
    name: 'Search',
    description: 'Manage search settings.',
    icon: Search,
    component: SearchSection,
    dataAdd: 'search',
  },
];

const SettingsDialogue = ({
  isOpen,
  setIsOpen,
}: {
  isOpen: boolean;
  setIsOpen: (active: boolean) => void;
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [config, setConfig] = useState<any>(null);
  const { demoMode } = useChat();
  const sections = demoMode
    ? allSections.filter((section) =>
        ['preferences', 'personalization'].includes(section.key),
      )
    : allSections;
  const [activeSection, setActiveSection] = useState<string>(allSections[0].key);
  const [selectedSection, setSelectedSection] = useState(allSections[0]);

  useEffect(() => {
    if (!sections.find((section) => section.key === activeSection)) {
      setActiveSection(sections[0].key);
    }
  }, [activeSection, sections]);

  useEffect(() => {
    const nextSection =
      sections.find((section) => section.key === activeSection) ?? sections[0];

    setSelectedSection(nextSection);
  }, [activeSection, sections]);

  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);

      const fetchConfig = async () => {
        try {
          const res = await fetch('/api/config', {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          });

          const data = await res.json();

          setConfig(data);
        } catch (error) {
          console.error('Error fetching config:', error);
          toast.error('Failed to load configuration.');
        } finally {
          setIsLoading(false);
        }
      };

      fetchConfig();
    }
  }, [isOpen]);

  return (
    <Dialog
      open={isOpen}
      onClose={() => setIsOpen(false)}
      className="relative z-50"
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.1 }}
        className="fixed inset-0 flex h-screen w-screen items-center justify-center bg-black/30 p-4 backdrop-blur-sm"
      >
        <DialogPanel className="space-y-4 rounded-[1.8rem] border border-light-200 bg-light-primary backdrop-blur-lg h-[calc(100vh-2%)] w-[calc(100vw-2%)] overflow-hidden flex flex-col md:h-[calc(100vh-7%)] md:w-[calc(100vw-7%)] lg:h-[calc(100vh-20%)] lg:w-[calc(100vw-30%)] dark:border-dark-200 dark:bg-dark-primary">
          {isLoading ? (
            <div className="flex items-center justify-center h-full w-full">
              <Loader />
            </div>
          ) : (
            <div className="flex flex-1 inset-0 h-full overflow-hidden">
              <div className="hidden lg:flex flex-col justify-between w-[240px] border-r border-light-200/60 dark:border-dark-200/60 h-full px-3 pt-3 overflow-y-auto">
                <div className="flex flex-col">
                  <div className="px-2 pb-4 pt-1">
                    <p className="text-sm font-semibold tracking-[0.18em] text-[#111827] dark:text-white">
                      OpenPerplexity
                    </p>
                  </div>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="group flex flex-row items-center hover:bg-light-200 hover:dark:bg-dark-200 p-2 rounded-lg"
                  >
                    <ChevronLeft
                      size={18}
                      className="text-black/50 dark:text-white/50 group-hover:text-black/70 group-hover:dark:text-white/70"
                    />
                    <p className="text-black/50 dark:text-white/50 group-hover:text-black/70 group-hover:dark:text-white/70 text-[14px]">
                      Back
                    </p>
                  </button>

                  <div className="flex flex-col items-start space-y-1 mt-8">
                    {sections.map((section) => (
                      <button
                        key={section.dataAdd}
                        className={cn(
                          `flex flex-row items-center space-x-2 px-2 py-1.5 rounded-lg w-full text-sm hover:bg-light-200 hover:dark:bg-dark-200 transition duration-200 active:scale-95`,
                          activeSection === section.key
                            ? 'bg-light-200 dark:bg-dark-200 text-black/90 dark:text-white/90'
                            : ' text-black/70 dark:text-white/70',
                        )}
                        onClick={() => setActiveSection(section.key)}
                      >
                        <section.icon size={17} />
                        <p>{section.name}</p>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col space-y-1 py-[18px] px-2">
                  <p className="text-xs uppercase tracking-[0.28em] text-black/45 dark:text-white/45">
                    OpenPerplexity
                  </p>
                  <p className="text-xs text-black/70 dark:text-white/70">
                    Version: {process.env.NEXT_PUBLIC_VERSION}
                  </p>
                </div>
              </div>
              <div className="w-full flex flex-col overflow-hidden">
                <div className="flex flex-row lg:hidden w-full justify-between px-[20px] my-4 flex-shrink-0">
                  <button
                    onClick={() => setIsOpen(false)}
                    className="group flex flex-row items-center hover:bg-light-200 hover:dark:bg-dark-200 rounded-lg mr-[40%]"
                  >
                    <ArrowLeft
                      size={18}
                      className="text-black/50 dark:text-white/50 group-hover:text-black/70 group-hover:dark:text-white/70"
                    />
                  </button>
                  <Select
                    options={sections.map((section) => {
                      return {
                        value: section.key,
                        key: section.key,
                        label: section.name,
                      };
                    })}
                    value={activeSection}
                    onChange={(e) => {
                      setActiveSection(e.target.value);
                    }}
                    className="!text-xs lg:!text-sm"
                  />
                </div>
                {selectedSection.component && (
                  <div className="flex flex-1 flex-col overflow-hidden">
                    <div className="border-b border-light-200/60 px-6 pb-6 lg:pt-6 dark:border-dark-200/60 flex-shrink-0">
                      <div className="flex flex-col">
                        <h4 className="font-medium text-black dark:text-white text-sm lg:text-sm">
                          {selectedSection.name}
                        </h4>
                        <p className="text-[11px] lg:text-xs text-black/50 dark:text-white/50">
                          {selectedSection.description}
                        </p>
                      </div>
                    </div>
                    <div className="flex-1 overflow-y-auto">
                      <selectedSection.component
                        fields={config.fields[selectedSection.dataAdd]}
                        values={config.values[selectedSection.dataAdd]}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogPanel>
      </motion.div>
    </Dialog>
  );
};

export default SettingsDialogue;
