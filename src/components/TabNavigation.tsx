import React, { useState, useRef, useEffect } from 'react';
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
  const [hoverProgress, setHoverProgress] = useState<{ [key: string]: number }>({});
  const tabRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});
  
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

  const handleMouseMove = (tabId: string, event: React.MouseEvent<HTMLButtonElement>) => {
    const button = event.currentTarget;
    const rect = button.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const mouseX = event.clientX;
    
    // Calculate distance from center (0 = center, 1 = edge)
    const distanceFromCenter = Math.abs(mouseX - centerX) / (rect.width / 2);
    
    // Invert so 1 = center, 0 = edge
    const progress = Math.max(0, Math.min(1, 1 - distanceFromCenter));
    
    setHoverProgress(prev => ({
      ...prev,
      [tabId]: progress
    }));
  };

  const handleMouseLeave = (tabId: string) => {
    setHoverProgress(prev => ({
      ...prev,
      [tabId]: 0
    }));
  };

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
            const progress = hoverProgress[tab.id] || 0;
            const showText = isActive || progress > 0;
            
            // Dynamic values based on hover progress
            const textOpacity = isActive ? 1 : progress;
            const textMaxWidth = isActive ? 80 : progress * 80;
            const iconColor = isActive 
              ? 'text-blue-600' 
              : progress > 0 
                ? `rgba(59, 130, 246, ${0.5 + progress * 0.3})` // Dynamic blue intensity
                : 'text-gray-600';

            return (
              <button
                key={tab.id}
                ref={el => tabRefs.current[tab.id] = el}
                onClick={() => onTabChange(tab.id)}
                onMouseMove={(e) => handleMouseMove(tab.id, e)}
                onMouseLeave={() => handleMouseLeave(tab.id)}
                className="relative h-12 flex items-center transition-all duration-200 rounded-xl overflow-hidden px-2 pt-2"
              >
                {/* Container for icon and text with dynamic justification */}
                <div className={`flex items-center h-full w-full transition-all duration-200 ${
                  showText ? 'justify-center space-x-2' : 'justify-center'
                }`}>
                  {/* Icon - always visible with dynamic positioning */}
                  <Icon 
                    className={`w-5 h-5 transition-all duration-200 flex-shrink-0 ${
                      isActive ? 'text-blue-600' : 'text-gray-600'
                    }`}
                    style={{
                      color: isActive ? undefined : (progress > 0 ? `rgba(59, 130, 246, ${0.5 + progress * 0.3})` : undefined),
                      transform: showText ? `translateX(${-progress * 4}px)` : 'translateX(0)'
                    }}
                  />
                  
                  {/* Text - slides in dynamically based on hover progress */}
                  <div 
                    className="overflow-hidden transition-all duration-200"
                    style={{
                      maxWidth: `${textMaxWidth}px`,
                      opacity: textOpacity
                    }}
                  >
                    <span 
                      className={`text-xs font-medium whitespace-nowrap block transition-all duration-200 ${
                        isActive ? 'text-blue-600' : 'text-gray-600'
                      }`}
                      style={{
                        color: isActive ? undefined : (progress > 0 ? `rgba(59, 130, 246, ${0.5 + progress * 0.3})` : undefined),
                        transform: `translateX(${progress * 2}px)`
                      }}
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