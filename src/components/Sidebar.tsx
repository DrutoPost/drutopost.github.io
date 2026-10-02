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
      {/* Mobile Header - Day/Night responsive logo */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-20 bg-background border-b border-border flex items-center justify-between px-6 z-50">
        <div className="flex items-center">
          <img src="/darklogo.png" alt="Drutopost" className="h-8 object-contain dark:hidden" />
          <img src="/whitelogo.png" alt="Drutopost" className="h-8 object-contain hidden dark:block" />
        </div>
        <Button variant="ghost" size="icon" onClick={() => setIsOpen(!isOpen)} className="text-foreground hover:bg-accent">
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

      {/* Sidebar Content - Day/Night background and logo */}
      <aside className={cn(
        "fixed inset-y-0 left-0 w-64 bg-sidebar border-r border-sidebar-border flex flex-col h-screen z-50 transition-transform duration-300 lg:translate-x-0 lg:w-24 xl:w-64",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-8 hidden lg:flex items-center justify-center xl:justify-start">
          <img src="/darklogo.png" alt="Drutopost" className="h-9 object-contain dark:hidden hidden xl:block" />
          <img src="/whitelogo.png" alt="Drutopost" className="h-9 object-contain hidden dark:xl:block" />
          <img src="/fav.png" alt="Drutopost" className="h-8 w-8 object-contain hidden lg:block xl:hidden" />
        </div>

        <nav className="flex-1 px-4 space-y-3 mt-24 lg:mt-6">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handlePageChange(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3.5 transition-all duration-200 group relative rounded-md",
                currentPage === item.id
                  ? "bg-primary text-primary-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              <item.icon className={cn(
                "w-6 h-6 shrink-0",
                currentPage === item.id ? "text-primary-foreground" : "group-hover:scale-110 transition-transform"
              )} />
              <span className="lg:hidden xl:block font-bold text-sm">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-6 border-t border-sidebar-border bg-sidebar-accent/20">
          <div className="hidden xl:block p-4 bg-sidebar-accent/30 border border-sidebar-border rounded-lg">
            <p className="text-sm text-sidebar-foreground/60 font-semibold mb-1.5 uppercase tracking-widest">Automation Status</p>
            <div className="flex items-center gap-2">
              <div className={cn(
                "w-2 h-2 rounded-full animate-pulse",
                automationStatus === 'ACTIVE' ? "bg-green-500" : automationStatus === 'STANDBY' ? "bg-amber-500" : "bg-muted-foreground"
              )} />
              <span className="text-xs font-bold text-sidebar-foreground uppercase tracking-widest">{automationStatus}</span>
            </div>
          </div>
          <div className="xl:hidden flex justify-center">
            <div className={cn(
              "w-2.5 h-2.5 rounded-full animate-pulse",
              automationStatus === 'ACTIVE' ? "bg-green-500" : automationStatus === 'STANDBY' ? "bg-amber-500" : "bg-muted-foreground"
            )} />
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
