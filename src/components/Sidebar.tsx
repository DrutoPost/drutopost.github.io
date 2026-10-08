import React, { useState } from 'react';
import { cn } from "@/lib/utils";
import { Home, Image as ImageIcon, Layout, Settings2, Menu, X, Sun, Moon } from "lucide-react";
import { Button } from "./ui/button";
import { useEffect } from "react";
import { getScopedItem, setScopedItem } from "@/lib/scopedStorage";

export type PageId = 'home' | 'templates' | 'ads' | 'settings';

interface SidebarProps {
  currentPage: PageId;
  onPageChange: (page: PageId) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentPage, onPageChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [automationStatus, setAutomationStatus] = useState(() => getScopedItem('bg_automation_status') || 'IDLE');
  const [theme, setTheme] = useState(() => getScopedItem('bg_theme') || 'day');

  useEffect(() => {
    const handleStorage = () => {
      setAutomationStatus(getScopedItem('bg_automation_status') || 'IDLE');
      setTheme(getScopedItem('bg_theme') || 'day');
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const logoSrc = (currentPage === 'home' && theme === 'day') ? '/logo.png' : '/darklogo.png';

  const toggleAppTheme = () => {
    const nextTheme = theme === 'day' ? 'night' : 'day';
    setTheme(nextTheme);
    setScopedItem('bg_theme', nextTheme);
    window.dispatchEvent(new Event('storage'));
  };

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
      {/* Mobile Header */}
      <div className={cn(
        "lg:hidden fixed top-0 left-0 right-0 h-20 border-b flex items-center justify-between px-6 z-50 transition-colors",
        currentPage === 'home' && theme === 'day' ? "bg-white border-zinc-200 text-black" : "bg-black border-zinc-800 text-white"
      )}>
        <div className="flex items-center">
          <img src={logoSrc} alt="Drutopost" className="h-10 w-auto object-contain" />
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsOpen(!isOpen)}
          className={cn(currentPage === 'home' && theme === 'day' ? "text-black hover:bg-black/10" : "text-white hover:bg-white/10")}
        >
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

      {/* Sidebar Content - Black Background as requested */}
      <aside className={cn(
        "fixed inset-y-0 left-0 w-64 bg-black border-r border-zinc-800 flex flex-col h-screen z-50 transition-transform duration-300 lg:translate-x-0 lg:w-24 xl:w-64",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-8 hidden lg:flex items-center justify-center xl:justify-start">
          <div className={cn("p-2 rounded-none transition-colors inline-block", currentPage === 'home' && theme === 'day' ? "bg-white" : "")}>
            <img src={logoSrc} alt="Drutopost" className="h-10 w-auto object-contain lg:hidden xl:block" />
            <img src={logoSrc} alt="Drutopost" className="h-8 w-auto object-contain hidden lg:block xl:hidden" />
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-3 mt-24 lg:mt-6">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handlePageChange(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3.5 transition-all duration-200 group relative",
                currentPage === item.id
                  ? "bg-primary text-white"
                  : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
              )}
            >
              <item.icon className={cn(
                "w-6 h-6 shrink-0",
                currentPage === item.id ? "text-white" : "group-hover:scale-110 transition-transform"
              )} />
              <span className="lg:hidden xl:block font-bold text-sm">{item.label}</span>
            </button>
          ))}

          {/* Theme Toggle Button inside mobile drawer / sidebar */}
          <div className="pt-4 border-t border-zinc-900 mt-4">
            <button
              onClick={toggleAppTheme}
              className="w-full flex items-center gap-3 px-4 py-3.5 transition-all duration-200 text-zinc-400 hover:bg-zinc-900 hover:text-white"
            >
              {theme === 'day' ? <Moon className="w-6 h-6 shrink-0 text-amber-400" /> : <Sun className="w-6 h-6 shrink-0 text-amber-400" />}
              <span className="lg:hidden xl:block font-bold text-sm">{theme === 'day' ? 'Night Mode' : 'Day Mode'}</span>
            </button>
          </div>
        </nav>

        <div className="p-6 border-t border-zinc-900 bg-zinc-950/50">
          <div className="hidden xl:block p-4 bg-black border border-zinc-800">
            <p className="text-sm text-zinc-500 font-semibold mb-1.5 uppercase tracking-widest">Automation Status</p>
            <div className="flex items-center gap-2">
              <div className={cn(
                "w-2 h-2 rounded-full animate-pulse",
                automationStatus === 'ACTIVE' ? "bg-green-500" : automationStatus === 'STANDBY' ? "bg-amber-500" : "bg-zinc-500"
              )} />
              <span className="text-xs font-bold text-zinc-300 uppercase tracking-widest">{automationStatus}</span>
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
