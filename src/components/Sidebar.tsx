import React, { useState, useEffect } from 'react';
import { cn } from "@/lib/utils";
import { Home, Image as ImageIcon, Layout, Settings2, Menu, X } from "lucide-react";
import { Button } from "./ui/button";

export type PageId = 'home' | 'templates' | 'ads' | 'settings';

interface SidebarProps {
  currentPage: PageId;
  onPageChange: (page: PageId) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentPage, onPageChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [automationStatus, setAutomationStatus] = useState(() => localStorage.getItem('bg_automation_status') || 'IDLE');

  useEffect(() => {
    const handleStorage = () => {
      setAutomationStatus(localStorage.getItem('bg_automation_status') || 'IDLE');
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'templates', label: 'Templates', icon: Layout },
    { id: 'ads', label: 'Ads', icon: ImageIcon },
    { id: 'settings', label: 'Settings', icon: Settings2 },
  ] as const;

  const handlePageChange = (id: PageId) => {
    onPageChange(id);
    setIsOpen(false);
  };

  return (
    <>
      {/* Mobile Header - Black in Day mode, White in Night/Dark mode */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-20 bg-black dark:bg-white border-b border-zinc-800 dark:border-zinc-200 flex items-center justify-between px-6 z-50">
        <div className="flex items-center">
          <img src="/darklogo.png" alt="Drutopost" className="h-8 object-contain dark:hidden" />
          <img src="/whitelogo.png" alt="Drutopost" className="h-8 object-contain hidden dark:block" />
        </div>
        <Button variant="ghost" size="icon" onClick={() => setIsOpen(!isOpen)} className="text-white dark:text-zinc-900 hover:bg-white/10 dark:hover:bg-black/10">
          {isOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
        </Button>
      </div>

      {/* Sidebar Overlay for Mobile */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Content - Day mode: Black background. Dark/Night mode: White background */}
      <aside className={cn(
        "fixed inset-y-0 left-0 w-64 bg-black dark:bg-white border-r border-zinc-800 dark:border-zinc-200 flex flex-col h-screen z-50 transition-transform duration-300 lg:translate-x-0 lg:w-24 xl:w-64",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Logo Section */}
        <div className="p-8 hidden lg:flex items-center justify-center xl:justify-start">
          <img src="/darklogo.png" alt="Drutopost" className="h-9 object-contain dark:hidden hidden xl:block" />
          <img src="/whitelogo.png" alt="Drutopost" className="h-9 object-contain hidden dark:xl:block" />
          <img src="/fav.png" alt="Drutopost" className="h-8 w-8 object-contain hidden lg:block xl:hidden" />
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-4 space-y-3 mt-24 lg:mt-6">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handlePageChange(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3.5 transition-all duration-200 group relative rounded-md font-bold text-sm",
                currentPage === item.id
                  ? "bg-red-600 text-white dark:bg-red-600 dark:text-white"
                  : "text-zinc-400 hover:bg-zinc-900 hover:text-white dark:text-zinc-600 dark:hover:bg-zinc-100 dark:hover:text-black"
              )}
            >
              <item.icon className={cn(
                "w-6 h-6 shrink-0",
                currentPage === item.id ? "text-white" : "group-hover:scale-110 transition-transform"
              )} />
              <span className="lg:hidden xl:block">{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Status Box at Bottom */}
        <div className="p-6 border-t border-zinc-900 dark:border-zinc-200 bg-zinc-950/50 dark:bg-zinc-50/50">
          <div className="hidden xl:block p-4 bg-black dark:bg-white border border-zinc-800 dark:border-zinc-200 rounded-lg">
            <p className="text-sm text-zinc-500 dark:text-zinc-500 font-semibold mb-1.5 uppercase tracking-widest">Automation Status</p>
            <div className="flex items-center gap-2">
              <div className={cn(
                "w-2 h-2 rounded-full animate-pulse",
                automationStatus === 'ACTIVE' ? "bg-green-500" : automationStatus === 'STANDBY' ? "bg-amber-500" : "bg-zinc-500"
              )} />
              <span className="text-xs font-bold text-zinc-300 dark:text-zinc-800 uppercase tracking-widest">{automationStatus}</span>
            </div>
          </div>
          <div className="xl:hidden flex justify-center">
            <div className={cn(
              "w-2.5 h-2.5 rounded-full animate-pulse",
              automationStatus === 'ACTIVE' ? "bg-green-500" : automationStatus === 'STANDBY' ? "bg-amber-500" : "bg-zinc-500"
            )} />
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
