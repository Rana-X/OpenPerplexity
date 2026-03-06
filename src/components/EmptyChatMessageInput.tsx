import { ArrowRight } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import Sources from './MessageInputActions/Sources';
import Optimization from './MessageInputActions/Optimization';
import Attach from './MessageInputActions/Attach';
import { useChat } from '@/lib/hooks/useChat';
import ModelSelector from './MessageInputActions/ChatModelSelector';

const EmptyChatMessageInput = () => {
  const { sendMessage } = useChat();

  /* const [copilotEnabled, setCopilotEnabled] = useState(false); */
  const [message, setMessage] = useState('');

  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeElement = document.activeElement;

      const isInputFocused =
        activeElement?.tagName === 'INPUT' ||
        activeElement?.tagName === 'TEXTAREA' ||
        activeElement?.hasAttribute('contenteditable');

      if (e.key === '/' && !isInputFocused) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    inputRef.current?.focus();

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        sendMessage(message);
        setMessage('');
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          sendMessage(message);
          setMessage('');
        }
      }}
      className="w-full"
    >
      <div className="flex flex-col rounded-3xl border border-light-200 bg-light-primary/85 px-4 pb-3 pt-5 transition-all duration-200 focus-within:border-sky-300 dark:border-dark-200 dark:bg-dark-primary/85 dark:focus-within:border-sky-800">
        <TextareaAutosize
          ref={inputRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          minRows={2}
          className="px-2 bg-transparent placeholder:text-[15px] placeholder:text-black/38 dark:placeholder:text-white/38 text-sm text-black dark:text-white resize-none focus:outline-none w-full max-h-24 lg:max-h-36 xl:max-h-48"
          placeholder="Map the landscape, verify a claim, or open a research thread..."
        />
        <div className="mt-4 flex flex-row items-end justify-between gap-3">
          <Optimization />
          <div className="flex flex-row items-center space-x-2 self-end">
            <div className="flex flex-row items-center space-x-1">
              <Sources />
              <ModelSelector />
              <Attach />
            </div>
            <button
              disabled={message.trim().length === 0}
              className="rounded-full bg-[linear-gradient(135deg,#2563eb,#14b8a6)] p-2 text-white shadow-[0_10px_20px_rgba(37,99,235,0.22)] transition duration-100 hover:opacity-90 disabled:bg-light-200 disabled:text-black/45 dark:disabled:bg-[#ececec21] dark:disabled:text-white/45"
            >
              <ArrowRight className="bg-background" size={17} />
            </button>
          </div>
        </div>
      </div>
    </form>
  );
};

export default EmptyChatMessageInput;
