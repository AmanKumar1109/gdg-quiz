import React from 'react';
import { BannerStrip } from '../common/BannerStrip';
import { Navbar } from '../common/Navbar';
import { Footer } from './Footer';
import { AttendeeAuthModal } from '../auth/AttendeeAuthModal';

export const MainLayout = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-[#FFFDF7] text-black selection:bg-[#FFE600] selection:text-black bg-grid-pattern">
      <BannerStrip />
      <Navbar />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
      <AttendeeAuthModal />
    </div>
  );
};
