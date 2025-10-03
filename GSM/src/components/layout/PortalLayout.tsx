import React from 'react';
import { PortalNavbar } from './PortalNavbar';
import { Footer } from './Footer';
import { Chatbot } from '../ai/Chatbot';

interface PortalLayoutProps {
  children: React.ReactNode;
}

export const PortalLayout: React.FC<PortalLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <PortalNavbar />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
      <Chatbot />
    </div>
  );
};
