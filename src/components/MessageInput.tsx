import { cn } from '@/lib/utils';
import { ArrowUp } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import AttachSmall from './MessageInputActions/AttachSmall';
import { useChat } from '@/lib/hooks/useChat';

const MessageInput = () => {
  const { loading, sendMessage } = useChat();

  const [copilotEnabled, setCopilotEnabled] = useState(false);
  const [message, setMessage] = useState('');
  const [textareaRows, setTextareaRows] = useState(1);
  const [mode, setMode] = useState<'multi' | 'single'>('single');

  useEffect(() => {
    if (textareaRows >= 2 && message && mode === 'single') {
      setMode('multi');
    } else if (!message && mode === 'multi') {
      setMode('single');
    }
  }, [textareaRows, mode, message]);

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

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <form
      onSubmit={(e) => {
        if (loading) return;
        e.preventDefault();
        sendMessage(message);
        setMessage('');
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter' && !e.shiftKey && !loading) {
          e.preventDefault();
          sendMessage(message);
          setMessage('');
        }
      }}
      className={cn(
        'relative bg-light-primary/90 dark:bg-dark-primary/90 p-4 flex items-center overflow-visible border border-light-200 dark:border-dark-200 transition-all duration-200 focus-within:border-sky-300 dark:focus-within:border-sky-800 backdrop-blur-xl',
        mode === 'multi' ? 'flex-col rounded-2xl' : 'flex-row rounded-full',
      )}
    >
      {mode === 'single' && <AttachSmall />}
      <TextareaAutosize
        ref={inputRef}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onHeightChange={(height, props) => {
          setTextareaRows(Math.ceil(height / props.rowHeight));
        }}
        className="transition bg-transparent dark:placeholder:text-white/50 placeholder:text-sm text-sm dark:text-white resize-none focus:outline-none w-full px-2 max-h-24 lg:max-h-36 xl:max-h-48 flex-grow flex-shrink"
        placeholder="Ask a follow-up"
      />
      {mode === 'single' && (
        <button
          disabled={message.trim().length === 0 || loading}
          className="rounded-full bg-[linear-gradient(135deg,#2563eb,#14b8a6)] p-2 text-white shadow-[0_10px_20px_rgba(37,99,235,0.22)] transition duration-100 hover:opacity-90 disabled:bg-light-200 disabled:text-black/45 dark:disabled:bg-[#ececec21] dark:disabled:text-white/45"
        >
          <ArrowUp className="bg-background" size={17} />
        </button>
      )}
      {mode === 'multi' && (
        <div className="flex flex-row items-center justify-between w-full pt-2">
          <AttachSmall />
          <button
            disabled={message.trim().length === 0 || loading}
            className="rounded-full bg-[linear-gradient(135deg,#2563eb,#14b8a6)] p-2 text-white shadow-[0_10px_20px_rgba(37,99,235,0.22)] transition duration-100 hover:opacity-90 disabled:bg-light-200 disabled:text-black/45 dark:disabled:bg-[#ececec21] dark:disabled:text-white/45"
          >
            <ArrowUp className="bg-background" size={17} />
          </button>
        </div>
      )}
    </form>
  );
};

export default MessageInput;
