import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Calculator, Edit3, TrendingUp, Trash2, AlertTriangle, X } from 'lucide-react';
import { gsap } from 'gsap';
import { SHIFTS } from '../constants';
import { DaySchedule, SpecialDates } from '../types';

interface CalendarProps {
  currentDate: Date;
  schedule: DaySchedule;
  specialDates: SpecialDates;
  onDateClick: (day: number) => void;
  onNavigateMonth: (direction: 'prev' | 'next') => void;
  totalAmount: number;
  monthToDateAmount: number;
  onDateChange: (date: Date) => void;
  scheduleTitle: string;
  onTitleUpdate: (title: string) => void;
  onResetMonth?: (year: number, month: number) => void;
}

export const Calendar: React.FC<CalendarProps> = ({
  currentDate,
  schedule,
  specialDates,
  onDateClick,
  onNavigateMonth,
  totalAmount,
  monthToDateAmount,
  onDateChange,
  scheduleTitle,
  onTitleUpdate,
  onResetMonth
}) => {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [tempTitle, setTempTitle] = useState(scheduleTitle);
  const [showResetModal, setShowResetModal] = useState(false);
  const [showClearDateModal, setShowClearDateModal] = useState(false);
  const [selectedClearDate, setSelectedClearDate] = useState<number | null>(null);
  const [longPressingDate, setLongPressingDate] = useState<number | null>(null);
  const [isLongPressing, setIsLongPressing] = useState(false);
  const calendarGridRef = useRef<HTMLDivElement>(null);
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const dateLongPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const monthButtonRef = useRef<HTMLButtonElement>(null);
  
  const today = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
  const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
  const firstDayWeekday = firstDayOfMonth.getDay();
  const daysInMonth = lastDayOfMonth.getDate();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Prevent body scroll when reset modal is open - EXACTLY LIKE SHIFT MODAL
  useEffect(() => {
    if (showResetModal || showClearDateModal) {
      // Disable body scroll
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.top = '0';
      document.body.style.left = '0';
      document.body.style.right = '0';
      document.body.style.bottom = '0';
    }

    return () => {
      // Re-enable body scroll
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.left = '';
      document.body.style.right = '';
      document.body.style.bottom = '';
    };
  }, [showResetModal, showClearDateModal]);

  // Prevent body scroll when date picker modal is open - EXACTLY LIKE OTHER MODALS
  useEffect(() => {
    if (showDatePicker) {
      // Disable body scroll
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.top = '0';
      document.body.style.left = '0';
      document.body.style.right = '0';
      document.body.style.bottom = '0';
    }

    return () => {
      // Re-enable body scroll
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.left = '';
      document.body.style.right = '';
      document.body.style.bottom = '';
    };
  }, [showDatePicker]);

  // Mobile-optimized sequential animation - smoother for iOS
  useEffect(() => {
    if (calendarGridRef.current) {
      // Get all day boxes and sort them by day number for sequential animation
      const dayBoxes = Array.from(calendarGridRef.current.querySelectorAll('.day-box'))
        .filter(box => box.getAttribute('data-day') !== null)
        .sort((a, b) => {
          const dayA = parseInt(a.getAttribute('data-day') || '0');
          const dayB = parseInt(b.getAttribute('data-day') || '0');
          return dayA - dayB;
        });
      
      // Force hardware acceleration and set initial state - iOS optimized
      gsap.set(dayBoxes, {
        opacity: 0,
        x: 80,  // Reduced distance for smoother mobile performance
        scale: 0.9,
        force3D: true,  // Force hardware acceleration
        transformOrigin: "center center"
      });

      // Set initial state for shift texts - optimized for mobile
      const shiftTexts = calendarGridRef.current.querySelectorAll('.shift-text');
      gsap.set(shiftTexts, {
        opacity: 0,
        y: 8,   // Reduced movement for smoother animation
        scale: 0.8,
        force3D: true
      });

      // Set initial state for special text
      const specialTexts = calendarGridRef.current.querySelectorAll('.special-text');
      gsap.set(specialTexts, {
        opacity: 0,
        scale: 0.7,
        y: -8,
        force3D: true
      });

      // Create master timeline with mobile-optimized settings
      const masterTl = gsap.timeline({
        defaults: {
          ease: "power2.out",  // Smoother easing for mobile
          force3D: true
        }
      });

      // Phase 1: Animate boxes sequentially - optimized timing for mobile
      dayBoxes.forEach((box, index) => {
        const dayNumber = parseInt(box.getAttribute('data-day') || '0');
        const shiftElements = box.querySelectorAll('.shift-text');
        const specialElements = box.querySelectorAll('.special-text');
        
        // Faster sequence for mobile - reduced delay
        const delay = (dayNumber - 1) * 0.05; // 50ms between each day (faster)
        
        // Animate the box - smoother for mobile
        masterTl.to(box, {
          opacity: 1,
          x: 0,
          scale: 1,
          duration: 0.4,  // Shorter duration
          ease: "power2.out",  // Simpler easing
          force3D: true
        }, delay);

        // Animate shift texts - simplified for mobile
        if (shiftElements.length > 0) {
          masterTl.to(shiftElements, {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.3,
            ease: "power1.out",  // Gentler easing
            stagger: 0.03,  // Faster stagger
            force3D: true
          }, delay + 0.15);
        }

        // Animate special text - simplified
        if (specialElements.length > 0) {
          masterTl.to(specialElements, {
            opacity: 1,
            scale: 1,
            y: 0,
            duration: 0.25,
            ease: "power1.out",
            force3D: true
          }, delay + 0.2);
        }
      });
    }
  }, [currentMonth, currentYear]);

  // Long press handlers - REMOVED ALL VISUAL FEEDBACK
  const handleLongPressStart = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    
    // Check if there's any data to reset before starting long press
    const { shiftsCount, specialDatesCount } = getMonthDataCount();
    if (shiftsCount === 0 && specialDatesCount === 0) {
      console.log('🚫 No data to reset, ignoring long press');
      return;
    }
    
    setIsLongPressing(true);
    
    // NO VISUAL FEEDBACK - removed all style changes
    
    longPressTimerRef.current = setTimeout(() => {
      setIsLongPressing(false);
      setShowResetModal(true);
    }, 800); // 800ms long press
  };

  const handleLongPressEnd = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
    
    setIsLongPressing(false);
    
    // NO VISUAL FEEDBACK - removed all style resets
  };

  // Close modal on escape key - EXACTLY LIKE SHIFT MODAL
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowResetModal(false);
        setShowDatePicker(false);
        setShowClearDateModal(false);
      }
    };

    if (showResetModal || showDatePicker || showClearDateModal) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [showResetModal, showDatePicker, showClearDateModal]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
      }
      if (dateLongPressTimerRef.current) {
        clearTimeout(dateLongPressTimerRef.current);
      }
      setLongPressingDate(null);
    };
  }, []);

  // Count shifts and special dates for current month
  const getMonthDataCount = () => {
    let shiftsCount = 0;
    let specialDatesCount = 0;
    
    for (let day = 1; day <= daysInMonth; day++) {
      const dateKey = formatDateKey(day);
      const dayShifts = schedule[dateKey] || [];
      if (dayShifts.length > 0) shiftsCount += dayShifts.length;
      if (specialDates[dateKey]) specialDatesCount++;
    }
    
    return { shiftsCount, specialDatesCount };
  };

  // Close modal when clicking outside - EXACTLY LIKE SHIFT MODAL
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setShowResetModal(false);
    }
  };

  // Close clear date modal when clicking outside
  const handleClearDateBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setShowClearDateModal(false);
    }
  };

  // Close date picker when clicking outside - EXACTLY LIKE OTHER MODALS
  const handleDatePickerBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setShowDatePicker(false);
    }
  };

  const handleResetMonth = () => {
    if (onResetMonth) {
      onResetMonth(currentYear, currentMonth);
    }
    setShowResetModal(false);
  };

  const handleClearDate = () => {
    if (selectedClearDate && onResetMonth) {
      // Clear shifts for the specific date
      const dateKey = formatDateKey(selectedClearDate);
      
      console.log(`🗑️ Clearing date ${dateKey}`);
      
      // We need to clear this specific date by calling onResetMonth with a single date
      // Since onResetMonth clears the whole month, we need a different approach
      // Let's create a custom clear function that works with the existing architecture
      
      // For now, we'll clear by creating a "mini reset" for just this date
      const year = currentYear;
      const month = currentMonth;
      const day = selectedClearDate;
      
      // Call the reset function but only for this specific date
      // We'll modify the onResetMonth to accept optional day parameter
      if (typeof onResetMonth === 'function') {
        // Pass the specific day as a third parameter
        (onResetMonth as any)(year, month, day);
      }
      
      // Show success message
      alert(`✅ Cleared all shifts for ${selectedClearDate}/${currentMonth + 1}/${currentYear}`);
    }
    setShowClearDateModal(false);
    setSelectedClearDate(null);
  };

  // Date long press handlers
  const handleDateLongPressStart = (day: number, e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Check if there are shifts to clear
    const dateKey = formatDateKey(day);
    const dayShifts = schedule[dateKey] || [];
    const hasSpecialDate = specialDates[dateKey];
    
    if (dayShifts.length === 0 && !hasSpecialDate) {
      console.log('🚫 No data to clear for this date');
      return;
    }
    
    setSelectedClearDate(day);
    setLongPressingDate(day);
    
    dateLongPressTimerRef.current = setTimeout(() => {
      setShowClearDateModal(true);
    }, 800); // 800ms long press
  };

  const handleDateLongPressEnd = () => {
    if (dateLongPressTimerRef.current) {
      clearTimeout(dateLongPressTimerRef.current);
      dateLongPressTimerRef.current = null;
      setLongPressingDate(null);
    }
  };

  const formatDateKey = (day: number) => {
    return `${currentYear}-${(currentMonth + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
  };

  const isToday = (day: number) => {
    return today.getDate() === day && 
           today.getMonth() === currentMonth && 
           today.getFullYear() === currentYear;
  };

  const getDayOfWeek = (day: number) => {
    const date = new Date(currentYear, currentMonth, day);
    return date.getDay(); // 0 = Sunday, 6 = Saturday
  };

  const isSunday = (day: number) => {
    return getDayOfWeek(day) === 0;
  };

  const isSpecialDate = (day: number) => {
    const dateKey = formatDateKey(day);
    return specialDates[dateKey] === true;
  };

  const getDayShifts = (day: number) => {
    const dateKey = formatDateKey(day);
    const shifts = schedule[dateKey] || [];
    
    // Sort shifts in the desired display order: 9-4, 4-10, 12-10, N
    const shiftOrder = ['9-4', '4-10', '12-10', 'N'];
    return shifts.sort((a, b) => {
      const indexA = shiftOrder.indexOf(a);
      const indexB = shiftOrder.indexOf(b);
      
      // If shift not found in order array, put it at the end
      const orderA = indexA === -1 ? 999 : indexA;
      const orderB = indexB === -1 ? 999 : indexB;
      
      return orderA - orderB;
    });
  };

  const getShiftDisplay = (shiftId: string) => {
    return SHIFTS.find(shift => shift.id === shiftId);
  };

  const getDateTextColor = (day: number) => {
    if (isToday(day)) {
      return 'text-green-700 font-bold'; // Current date in green
    } else if (isSunday(day) || isSpecialDate(day)) {
      return 'text-red-600 font-bold'; // Sunday and special dates in red
    } else {
      return 'text-gray-900'; // Regular dates
    }
  };

  const formatCurrency = (amount: number) => {
    // Only use thousands separator for amounts >= 1000
    if (amount >= 1000) {
      return `Rs ${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    } else {
      return `Rs ${amount.toFixed(2)}`;
    }
  };

  const handleMonthYearClick = () => {
    if (!isLongPressing) {
      setShowDatePicker(true);
    }
  };

  const handleDatePickerChange = (year: number, month: number) => {
    onDateChange(new Date(year, month, 1));
    setShowDatePicker(false);
  };

  const handleTitleClick = () => {
    setIsEditingTitle(true);
    setTempTitle(scheduleTitle);
  };

  const handleTitleSave = () => {
    onTitleUpdate(tempTitle.trim() || 'Work Schedule');
    setIsEditingTitle(false);
  };

  const handleTitleCancel = () => {
    setTempTitle(scheduleTitle);
    setIsEditingTitle(false);
  };

  const handleTitleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleTitleSave();
    } else if (e.key === 'Escape') {
      handleTitleCancel();
    }
  };

  const handleDateClick = (day: number) => {
    // Simplified click animation for mobile - no complex transforms
    const clickedElement = document.querySelector(`[data-day="${day}"]`);
    
    if (clickedElement) {
      // Simple, smooth scale animation
      gsap.to(clickedElement, {
        scale: 0.95,
        duration: 0.1,
        ease: "power2.out",
        force3D: true,
        yoyo: true,
        repeat: 1,
        onComplete: () => {
          gsap.set(clickedElement, { scale: 1 });
        }
      });
    }
    onDateClick(day);
  };

  const handleMonthNavigation = (direction: 'prev' | 'next') => {
    // Simplified month navigation for mobile
    if (calendarGridRef.current) {
      const slideDirection = direction === 'next' ? 30 : -30;
      
      gsap.to(calendarGridRef.current, {
        x: slideDirection,
        opacity: 0.5,
        duration: 0.2,
        ease: "power2.out",
        force3D: true,
        onComplete: () => {
          onNavigateMonth(direction);
          gsap.set(calendarGridRef.current, { 
            x: direction === 'next' ? -30 : 30
          });
          gsap.to(calendarGridRef.current, {
            x: 0,
            opacity: 1,
            duration: 0.3,
            ease: "power2.out",
            force3D: true
          });
        }
      });
    } else {
      onNavigateMonth(direction);
    }
  };

  // Check if current month/year matches today's month/year for month-to-date display
  const isCurrentMonth = today.getMonth() === currentMonth && today.getFullYear() === currentYear;

  // Generate calendar days
  const calendarDays = [];
  
  // Empty cells for days before the first day of the month
  for (let i = 0; i < firstDayWeekday; i++) {
    calendarDays.push(null);
  }
  
  // Days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day);
  }

  const { shiftsCount, specialDatesCount } = getMonthDataCount();

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden select-none max-w-4xl mx-auto" style={{ userSelect: 'none', WebkitUserSelect: 'none' }}>
      {/* Header */}
      <div className="p-4 sm:p-6 border-b border-gray-200">
        <div className="flex items-center justify-center space-x-3 mb-4">
          <CalendarIcon className="w-6 h-6 sm:w-8 sm:h-8 text-indigo-600" />
          {isEditingTitle ? (
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={tempTitle}
                onChange={(e) => setTempTitle(e.target.value)}
                onKeyDown={handleTitleKeyPress}
                onBlur={handleTitleSave}
                className="text-xl sm:text-3xl font-bold text-gray-900 text-center bg-transparent border-b-2 border-indigo-500 focus:outline-none min-w-[250px] sm:min-w-[300px]"
                autoFocus
              />
            </div>
          ) : (
            <button
              onClick={handleTitleClick}
              className="flex items-center space-x-2 text-xl sm:text-3xl font-bold text-gray-900 text-center hover:text-indigo-600 transition-colors duration-200 group select-none"
              style={{ userSelect: 'none', WebkitUserSelect: 'none' }}
            >
              <span className="select-none">{scheduleTitle}</span>
              <Edit3 className="w-4 h-4 sm:w-5 sm:h-5 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
            </button>
          )}
        </div>
        
        {/* Month/Year Navigation with Long Press - NO VISUAL FEEDBACK */}
        <div className="flex items-center justify-center space-x-4">
          <button
            onClick={() => handleMonthNavigation('prev')}
            className="p-2 rounded-lg bg-indigo-100 hover:bg-indigo-200 text-indigo-600 transition-colors duration-200 active:scale-95 select-none"
            style={{ userSelect: 'none', WebkitUserSelect: 'none' }}
          >
            <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          
          {/* Month/Year Button with Long Press - REMOVED ALL VISUAL FEEDBACK */}
          <button
            ref={monthButtonRef}
            onClick={handleMonthYearClick}
            onMouseDown={handleLongPressStart}
            onMouseUp={handleLongPressEnd}
            onMouseLeave={handleLongPressEnd}
            onTouchStart={handleLongPressStart}
            onTouchEnd={handleLongPressEnd}
            className="text-lg sm:text-xl font-semibold text-gray-700 min-w-[160px] sm:min-w-[200px] text-center hover:bg-gray-100 px-3 sm:px-4 py-2 rounded-lg transition-colors duration-200 select-none"
            style={{ 
              userSelect: 'none', 
              WebkitUserSelect: 'none',
              // REMOVED: All transition and transform styles that caused jiggling
            }}
          >
            <span className="select-none">{monthNames[currentMonth]} {currentYear}</span>
          </button>
          
          <button
            onClick={() => handleMonthNavigation('next')}
            className="p-2 rounded-lg bg-indigo-100 hover:bg-indigo-200 text-indigo-600 transition-colors duration-200 active:scale-95 select-none"
            style={{ userSelect: 'none', WebkitUserSelect: 'none' }}
          >
            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
      </div>

      {/* Reset Month Modal - POSITIONED HIGHER FOR IPHONE */}
      {showResetModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center p-4 z-50 overflow-y-auto"
          onClick={handleBackdropClick}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 9999,
            // CRITICAL: Enable touch scrolling on the backdrop
            WebkitOverflowScrolling: 'touch',
            touchAction: 'pan-y', // Allow vertical panning (scrolling)
            // POSITION HIGHER: Use flex-start and add top padding
            alignItems: 'flex-start',
            paddingTop: '10vh' // Start 10% from top instead of center
          }}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full select-none" 
            style={{ 
              userSelect: 'none', 
              WebkitUserSelect: 'none',
              // REMOVE MARGIN TOP/BOTTOM since we're using paddingTop on parent
              marginBottom: '2rem',
              // ENSURE MODAL DOESN'T GET TOO TALL
              maxHeight: '80vh'
            }}
            onClick={(e) => {
              // Prevent modal from closing when clicking inside
              e.stopPropagation();
            }}
          >
            {/* Header with close button */}
            <div className="relative p-6 pb-4 border-b border-gray-200">
              <button
                onClick={() => setShowResetModal(false)}
                className="absolute top-4 right-4 p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors duration-200 select-none"
                style={{ userSelect: 'none', WebkitUserSelect: 'none' }}
              >
                <X className="w-5 h-5" />
              </button>
              
              {/* Title - centered */}
              <div className="text-center">
                <h3 className="text-xl font-bold text-gray-900 mb-1 select-none">
                  Reset Month Data
                </h3>
                <p className="text-lg text-gray-700 select-none">
                  {monthNames[currentMonth]} {currentYear}
                </p>
              </div>
            </div>

            {/* Scrollable content with ENHANCED TOUCH SUPPORT */}
            <div 
              className="overflow-y-auto p-6"
              style={{
                // CRITICAL: Enable smooth touch scrolling
                WebkitOverflowScrolling: 'touch',
                touchAction: 'pan-y', // Allow vertical panning (scrolling)
                overscrollBehavior: 'contain', // Prevent scroll chaining to parent
                // LIMIT HEIGHT TO ENSURE SCROLLING WORKS
                maxHeight: '60vh'
              }}
            >
              {/* Warning Icon and Message */}
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="w-8 h-8 text-red-600" />
                </div>
                <p className="text-gray-600 select-none">
                  Are you sure you want to clear all data for <strong className="select-none">{monthNames[currentMonth]} {currentYear}</strong>?
                </p>
              </div>

              {/* Data Summary */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h4 className="font-semibold text-gray-800 mb-3 text-center select-none">Data to be cleared:</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 select-none">Scheduled Shifts:</span>
                    <span className="font-semibold text-red-600 select-none">{shiftsCount}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 select-none">Special Dates:</span>
                    <span className="font-semibold text-red-600 select-none">{specialDatesCount}</span>
                  </div>
                  <div className="flex items-center justify-between border-t pt-2">
                    <span className="text-sm font-medium text-gray-800 select-none">Monthly Amount:</span>
                    <span className="font-bold text-red-600 select-none">{formatCurrency(totalAmount)}</span>
                  </div>
                </div>
              </div>

              {/* Warning */}
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-6">
                <div className="flex items-start space-x-2">
                  <Trash2 className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-red-800 select-none">This action cannot be undone!</p>
                    <p className="text-xs text-red-600 mt-1 select-none">
                      All shifts and special date markings for this month will be permanently deleted.
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowResetModal(false)}
                  className="flex-1 py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg transition-colors duration-200 select-none"
                  style={{ userSelect: 'none', WebkitUserSelect: 'none' }}
                >
                  <span className="select-none">Cancel</span>
                </button>
                <button
                  onClick={handleResetMonth}
                  className="flex-1 py-3 px-4 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2 select-none"
                  style={{ userSelect: 'none', WebkitUserSelect: 'none' }}
                >
                  <Trash2 className="w-4 h-4" />
                  <span className="select-none">Reset Month</span>
                </button>
              </div>

              {/* Add extra padding at bottom to ensure all content is accessible */}
              <div className="h-8" />
            </div>
          </div>
        </div>
      )}

      {/* Clear Date Modal */}
      {showClearDateModal && selectedClearDate && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center p-4 z-50 overflow-y-auto"
          onClick={handleClearDateBackdropClick}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 9999,
            WebkitOverflowScrolling: 'touch',
            touchAction: 'pan-y',
            alignItems: 'flex-start',
            paddingTop: '10vh'
          }}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full select-none" 
            style={{ 
              userSelect: 'none', 
              WebkitUserSelect: 'none',
              marginBottom: '2rem',
              maxHeight: '80vh'
            }}
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            {/* Header with close button */}
            <div className="relative p-6 pb-4 border-b border-gray-200">
              <button
                onClick={() => setShowClearDateModal(false)}
                className="absolute top-4 right-4 p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors duration-200 select-none"
                style={{ userSelect: 'none', WebkitUserSelect: 'none' }}
              >
                <X className="w-5 h-5" />
              </button>
              
              {/* Title - centered */}
              <div className="text-center">
                <h3 className="text-xl font-bold text-gray-900 mb-1 select-none">
                  Clear Date
                </h3>
                <p className="text-lg text-gray-700 select-none">
                  {selectedClearDate}/{currentMonth + 1}/{currentYear}
                </p>
              </div>
            </div>

            {/* Content */}
            <div 
              className="overflow-y-auto p-6"
              style={{
                WebkitOverflowScrolling: 'touch',
                touchAction: 'pan-y',
                overscrollBehavior: 'contain',
                maxHeight: '60vh'
              }}
            >
              {/* Warning Icon and Message */}
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Trash2 className="w-8 h-8 text-orange-600" />
                </div>
                <p className="text-gray-600 select-none">
                  Clear all shifts and special date marking for <strong className="select-none">{selectedClearDate}/{currentMonth + 1}/{currentYear}</strong>?
                </p>
              </div>

              {/* Data Summary */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h4 className="font-semibold text-gray-800 mb-3 text-center select-none">Data to be cleared:</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 select-none">Shifts:</span>
                    <span className="font-semibold text-orange-600 select-none">
                      {selectedClearDate ? (schedule[formatDateKey(selectedClearDate)] || []).length : 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 select-none">Special Date:</span>
                    <span className="font-semibold text-orange-600 select-none">
                      {selectedClearDate && specialDates[formatDateKey(selectedClearDate)] ? 'Yes' : 'No'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Warning */}
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-6">
                <div className="flex items-start space-x-2">
                  <AlertTriangle className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-orange-800 select-none">This action cannot be undone!</p>
                    <p className="text-xs text-orange-600 mt-1 select-none">
                      All shifts and special date marking for this date will be permanently deleted.
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowClearDateModal(false)}
                  className="flex-1 py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg transition-colors duration-200 select-none"
                  style={{ userSelect: 'none', WebkitUserSelect: 'none' }}
                >
                  <span className="select-none">Cancel</span>
                </button>
                <button
                  onClick={handleClearDate}
                  className="flex-1 py-3 px-4 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2 select-none"
                  style={{ userSelect: 'none', WebkitUserSelect: 'none' }}
                >
                  <Trash2 className="w-4 h-4" />
                  <span className="select-none">Clear Date</span>
                </button>
              </div>

              <div className="h-8" />
            </div>
          </div>
        </div>
      )}

      {/* Date Picker Modal - NOW CENTERED VERTICALLY LIKE OTHER MODALS */}
      {showDatePicker && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={handleDatePickerBackdropClick}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 9999,
            // CRITICAL: Enable touch scrolling on the backdrop
            WebkitOverflowScrolling: 'touch',
            touchAction: 'pan-y' // Allow vertical panning (scrolling)
          }}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full select-none" 
            style={{ 
              userSelect: 'none', 
              WebkitUserSelect: 'none'
            }}
            onClick={(e) => {
              // Prevent modal from closing when clicking inside
              e.stopPropagation();
            }}
          >
            {/* Header with close button */}
            <div className="relative p-6 pb-4 border-b border-gray-200">
              <button
                onClick={() => setShowDatePicker(false)}
                className="absolute top-4 right-4 p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors duration-200 select-none"
                style={{ userSelect: 'none', WebkitUserSelect: 'none' }}
              >
                <X className="w-5 h-5" />
              </button>
              
              {/* Title - centered */}
              <div className="text-center">
                <h3 className="text-xl font-bold text-gray-900 mb-1 select-none">
                  Select Month & Year
                </h3>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 text-center select-none">Year</label>
                  <select
                    value={currentYear}
                    onChange={(e) => handleDatePickerChange(Number(e.target.value), currentMonth)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-center transition-colors duration-200"
                  >
                    {Array.from({ length: 10 }, (_, i) => currentYear - 5 + i).map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 text-center select-none">Month</label>
                  <select
                    value={currentMonth}
                    onChange={(e) => handleDatePickerChange(currentYear, Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-center transition-colors duration-200"
                  >
                    {monthNames.map((month, index) => (
                      <option key={index} value={index}>{month}</option>
                    ))}
                  </select>
                </div>
              </div>
              <button
                onClick={() => setShowDatePicker(false)}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors duration-200 active:scale-95 select-none"
                style={{ userSelect: 'none', WebkitUserSelect: 'none' }}
              >
                <span className="select-none">Close</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Calendar Body */}
      <div className="p-3 sm:p-6">
        {/* Week day headers */}
        <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-3 sm:mb-4">
          {weekDays.map((day, index) => (
            <div key={day} className={`p-2 sm:p-3 text-center font-semibold text-xs sm:text-sm select-none ${
              index === 0 ? 'text-red-600' : 'text-gray-600'
            }`} style={{ userSelect: 'none', WebkitUserSelect: 'none' }}>
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid - MOBILE OPTIMIZED ANIMATIONS */}
        <div 
          ref={calendarGridRef} 
          className="grid grid-cols-7 gap-1 sm:gap-2 mb-4 sm:mb-6 select-none w-full"
          style={{
            transform: 'translate3d(0,0,0)', // Force hardware acceleration
            backfaceVisibility: 'hidden',     // Prevent flickering
            userSelect: 'none',
            WebkitUserSelect: 'none',
            minHeight: '300px' // Ensure minimum height for calendar grid
          }}
        >
          {calendarDays.map((day, index) => {
            const dayShifts = day ? getDayShifts(day) : [];
            const hasSpecialDate = day ? isSpecialDate(day) : false;
            const todayDate = day ? isToday(day) : false;
            
            // Optimized height calculation based on actual content
            const minHeight = hasSpecialDate && dayShifts.length > 0
              ? 'min-h-[85px] sm:min-h-[140px]'  // Special date with shifts
              : dayShifts.length > 2
              ? 'min-h-[75px] sm:min-h-[120px]'   // Multiple shifts
              : 'min-h-[65px] sm:min-h-[100px]';  // Single/double shifts or empty
            
            return (
              <div
                key={index}
                data-day={day}
                className={`day-box ${minHeight} p-1 sm:p-2 rounded-lg border-2 transition-colors duration-200 overflow-hidden relative select-none ${
                  day 
                    ? todayDate
                      ? `cursor-pointer border-indigo-400 shadow-lg bg-yellow-100 hover:bg-yellow-200 active:bg-yellow-200` // TODAY: Permanent hover state
                      : `cursor-pointer hover:border-indigo-400 hover:shadow-lg bg-yellow-50 border-yellow-200 hover:bg-yellow-100 active:bg-yellow-200`
                    : 'border-transparent'
                }`}
                onClick={() => day && handleDateClick(day)}
               onMouseDown={(e) => day && handleDateLongPressStart(day, e)}
               onMouseUp={handleDateLongPressEnd}
               onMouseLeave={handleDateLongPressEnd}
               onTouchStart={(e) => day && handleDateLongPressStart(day, e)}
               onTouchEnd={handleDateLongPressEnd}
               onTouchCancel={handleDateLongPressEnd}
               onContextMenu={(e) => {
                 // Prevent context menu on long press
                 if (longPressingDate === day) {
                   e.preventDefault();
                 }
               }}
                style={{
                  transform: 'translate3d(0,0,0)', // Force hardware acceleration
                  backfaceVisibility: 'hidden',    // Prevent flickering
                  WebkitBackfaceVisibility: 'hidden', // Safari specific
                  WebkitTransform: 'translate3d(0,0,0)', // Safari specific
                  userSelect: 'none',
                  WebkitUserSelect: 'none'
                }}
              >
                {day && (
                  <div className="h-full flex flex-col select-none">
                    {/* Date header with special indicator and TODAY CIRCLE - FIXED SIZE */}
                    <div className="flex-shrink-0 mb-1.5 sm:mb-2 relative">
                      <div className={`text-sm sm:text-base text-center font-semibold ${getDateTextColor(day)} relative select-none`}>
                        {/* TODAY CIRCLE - PERFECT SIZE FOR 2-DIGIT DATES */}
                        {todayDate && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div 
                              className="w-6 h-6 sm:w-7 sm:h-7 border-2 border-green-500 rounded-full animate-pulse"
                              style={{
                                boxShadow: '0 0 0 1px rgba(34, 197, 94, 0.2), 0 0 10px rgba(34, 197, 94, 0.3)',
                                animation: 'todayPulse 2s ease-in-out infinite'
                              }}
                            />
                          </div>
                        )}
                        <span className="relative z-10 select-none">{day}</span>
                      </div>
                      {hasSpecialDate && (
                        <div 
                          className="special-text text-[8px] sm:text-[9px] text-red-500 font-bold leading-none mt-0.5 flex justify-center select-none"
                          style={{
                            transform: 'translate3d(0,0,0)',
                            backfaceVisibility: 'hidden',
                            userSelect: 'none',
                            WebkitUserSelect: 'none'
                          }}
                        >
                          <div className="text-center select-none">SPECIAL</div>
                        </div>
                      )}
                    </div>
                    
                    {/* Shifts container with mobile-optimized animations */}
                    <div className="flex-1 flex flex-col items-center justify-start space-y-0.5 sm:space-y-1 px-0.5 select-none min-w-0">
                      {dayShifts.slice(0, 3).map((shiftId, idx) => {
                        const shift = getShiftDisplay(shiftId);
                        return shift ? (
                          <div
                            key={`${shiftId}-${idx}`}
                            className={`shift-text text-[8px] sm:text-[11px] font-bold leading-tight ${shift.displayColor} flex-shrink-0 w-full select-none whitespace-nowrap overflow-hidden`}
                            style={{
                              transform: 'translate3d(0,0,0)',
                              backfaceVisibility: 'hidden',
                              WebkitBackfaceVisibility: 'hidden',
                              WebkitTransform: 'translate3d(0,0,0)',
                              userSelect: 'none',
                              WebkitUserSelect: 'none'
                            }}
                          >
                            <div className="text-center select-none truncate px-0.5">{shift.time}</div>
                          </div>
                        ) : null;
                      })}
                      {dayShifts.length > 3 && (
                        <div 
                          className="shift-text text-[7px] sm:text-[8px] text-gray-500 font-medium flex-shrink-0 w-full select-none whitespace-nowrap"
                          style={{
                            transform: 'translate3d(0,0,0)',
                            backfaceVisibility: 'hidden',
                            userSelect: 'none',
                            WebkitUserSelect: 'none'
                          }}
                        >
                          <div className="text-center select-none truncate">+{dayShifts.length - 3}</div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Amount Display Section - NO ANIMATION */}
        <div 
          className="space-y-3 sm:space-y-4 select-none" 
          style={{ 
            userSelect: 'none', 
            WebkitUserSelect: 'none',
            // FIXED: Add proper mobile scrolling support
            paddingBottom: '20px', // Extra padding for mobile
            marginBottom: '10px'
          }}
        >
          {/* Month to Date Total - Only show if viewing current month */}
          {isCurrentMonth && (
            <div 
              className="bg-green-50 border border-green-200 rounded-lg p-3 sm:p-4"
              style={{
                // FIXED: Ensure proper touch scrolling
                WebkitOverflowScrolling: 'touch',
                touchAction: 'pan-y'
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                  <span className="text-base sm:text-lg font-semibold text-green-800 select-none">Month to Date</span>
                </div>
                <span className="text-lg sm:text-2xl font-bold text-green-900 select-none">
                  {formatCurrency(monthToDateAmount)}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-green-600 mt-2 text-center select-none">
                Amount earned from start of month to today ({today.getDate()}/{currentMonth + 1}/{currentYear})
              </p>
            </div>
          )}

          {/* Monthly Total */}
          <div 
            className="bg-indigo-50 border border-indigo-200 rounded-lg p-3 sm:p-4"
            style={{
              // FIXED: Ensure proper touch scrolling
              WebkitOverflowScrolling: 'touch',
              touchAction: 'pan-y'
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Calculator className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600" />
                <span className="text-base sm:text-lg font-semibold text-indigo-800 select-none">Monthly Total</span>
              </div>
              <span className="text-lg sm:text-2xl font-bold text-indigo-900 select-none">
                {formatCurrency(totalAmount)}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-indigo-600 mt-2 text-center select-none">
              Total amount for all scheduled shifts in {monthNames[currentMonth]} {currentYear}
            </p>
          </div>
        </div>
      </div>

      {/* Custom CSS for today's circle animation */}
      <style jsx>{`
        @keyframes todayPulse {
          0%, 100% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.1);
            opacity: 0.8;
          }
        }
      `}</style>
    </div>
  );
};