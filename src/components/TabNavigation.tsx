import React, { useState } from 'react';
import { Calendar, Settings, Database } from 'lucide-react';

interface Tab {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}

interface TabNavigationProps {
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

const TabNavigation: React.FC<TabNavigationProps> = ({ activeTab, onTabChange }) => {
  const tabs: Tab[] = [
    { id: 'calendar', icon: Calendar, label: 'Calendar' },
    { id: 'settings', icon: Settings, label: 'Settings' },
    { id: 'data', icon: Database, label: 'Data' }
  ];

  const getTabIndex = (tabId: string) => tabs.findIndex(tab => tab.id === tabId);
  const activeIndex = getTabIndex(activeTab);
  
  // Show background only for active tab
  const backgroundIndex = activeIndex;
  const showBackground = backgroundIndex !== -1;

  return (
    <div className="flex justify-center mb-6">
      <div className="relative bg-white/90 backdrop-blur-md rounded-2xl shadow-lg border border-gray-200/50 p-2">
        {/* Tab buttons container */}
        <div className="relative grid grid-cols-3 w-80">
          {/* Single background that moves between tabs */}
          {showBackground && (
            <div 
              className="absolute inset-y-0 bg-blue-500/10 rounded-xl transition-all duration-300 ease-out"
              style={{
                width: 'calc(33.333% - 8px)',
                left: `calc(${backgroundIndex * 33.333}% + 4px)`,
                top: '0px',
                bottom: '0px'
              }}
            />
          )}
          
          {/* Top indicator line - only for active tab */}
          {activeIndex !== -1 && (
            <div 
              className="absolute top-1 h-0.5 bg-blue-500 rounded-full transition-all duration-300 ease-out"
              style={{
                width: 'calc(33.333% - 48px)',
                left: `calc(${activeIndex * 33.333}% + 24px)`
              }}
            />
          )}

          {tabs.map((tab, index) => {
            const Icon = tab.icon;
            const isActive = tab.id === activeTab;
            const showText = isActive;

            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className="relative h-12 flex items-center transition-all duration-200 rounded-xl overflow-hidden px-2 pt-2"
              >
                {/* Container for icon and text with dynamic justification */}
                <div className={`flex items-center h-full w-full transition-all duration-300 ${
                  showText ? 'justify-center space-x-2' : 'justify-center'
                }`}>
                  {/* Icon - always visible */}
                  <Icon 
                    className={`w-5 h-5 transition-all duration-300 flex-shrink-0 ${
                      isActive ? 'text-blue-600' : 'text-gray-600'
                    } ${
                      showText ? '' : 'transform-none'
                    }`} 
                  />
                  
                  {/* Text - slides in horizontally with width animation */}
                  <div className={`overflow-hidden transition-all duration-300 ${
                    showText ? 'max-w-[80px] opacity-100' : 'max-w-0 opacity-0'
                  }`}>
                    <span 
                      className={`text-xs font-medium whitespace-nowrap block transition-all duration-300 ${
                        isActive ? 'text-blue-600' : 'text-gray-600'
                      }`}
                    >
                      {tab.label}
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TabNavigation;