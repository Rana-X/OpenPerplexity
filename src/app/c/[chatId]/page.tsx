import ChatWindow from '@/components/ChatWindow';
import { isDemoModeEnabled } from '@/lib/demo';
import { redirect } from 'next/navigation';

const ChatPage = () => {
  if (isDemoModeEnabled()) {
    redirect('/');
  }

  return <ChatWindow />;
};

export default ChatPage;
