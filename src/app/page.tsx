import ChatWindow from '@/components/ChatWindow';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Workspace - OpenPerplexity',
  description:
    'OpenPerplexity blends live search, grounded citations, and configurable models in one research workspace.',
};

const Home = () => {
  return <ChatWindow />;
};

export default Home;
