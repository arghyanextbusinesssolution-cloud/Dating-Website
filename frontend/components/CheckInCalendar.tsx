'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '@/lib/api';

interface CheckInCalendarProps {
  onDateSelect?: (date: Date) => void;
}

interface CheckInData {
  emotion: string;
  need: string;
  energy: string;
  hasCheckIn: boolean;
}

export default function CheckInCalendar({ onDateSelect }: CheckInCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [checkIns, setCheckIns] = useState<Record<string, CheckInData>>({});
  const [loading, setLoading] = useState(true);

  const month = currentDate.getMonth();
  const year = currentDate.getFullYear();

  useEffect(() => {
    fetchCheckInHistory();
  }, [month, year]);

  const fetchCheckInHistory = async () => {
    try {
      setLoading(true);
      const response = await api.get('/soul/check-in/history', {
        params: { month: month, year: year }
      });
      if (response.data.success) {
        setCheckIns(response.data.checkIns || {});
      }
    } catch (error) {
      console.error('Error fetching check-in history:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);
  const today = new Date();
  const isCurrentMonth = currentDate.getMonth() === today.getMonth() && currentDate.getFullYear() === today.getFullYear();

  const days = [];
  // Empty cells for days before the first day of the month
  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }
  // Days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    days.push(day);
  }

  const getDateString = (day: number | null) => {
    if (day === null) return '';
    const date = new Date(year, month, day);
    return date.toISOString().split('T')[0];
  };

  const getEmotionEmoji = (emotion: string) => {
    const emojiMap: Record<string, string> = {
      calm: '😌',
      heavy: '😔',
      open: '😊',
      confused: '😕',
      hopeful: '✨'
    };
    return emojiMap[emotion] || '○';
  };

  const isToday = (day: number | null) => {
    if (day === null || !isCurrentMonth) return false;
    return day === today.getDate();
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigateMonth('prev')}
          className="p-2 rounded-full hover:bg-gray-100 transition-colors"
        >
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h3 className="text-lg font-bold text-gray-800">
          {monthNames[month]} {year}
        </h3>
        <button
          onClick={() => navigateMonth('next')}
          className="p-2 rounded-full hover:bg-gray-100 transition-colors"
        >
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
        </div>
      ) : (
        <>
          {/* Day names header */}
          <div className="grid grid-cols-7 gap-2 mb-2">
            {dayNames.map(day => (
              <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-2">
            {days.map((day, index) => {
              const dateString = getDateString(day);
              const checkInData = day !== null ? checkIns[dateString] : null;
              const isTodayDate = isToday(day);

              return (
                <motion.button
                  key={index}
                  onClick={() => {
                    if (day !== null && onDateSelect) {
                      onDateSelect(new Date(year, month, day));
                    }
                  }}
                  disabled={day === null}
                  className={`
                    aspect-square rounded-xl text-sm font-medium transition-all
                    ${day === null ? 'bg-transparent' : 'bg-gray-50 hover:bg-gray-100'}
                    ${isTodayDate ? 'ring-2 ring-purple-500' : ''}
                    ${checkInData?.hasCheckIn ? 'bg-purple-200 hover:bg-purple-300 border-2 border-purple-400' : ''}
                  `}
                  whileHover={day !== null ? { scale: 1.05 } : {}}
                  whileTap={day !== null ? { scale: 0.95 } : {}}
                >
                  {day !== null && (
                    <div className="flex flex-col items-center justify-center h-full">
                      <span className={isTodayDate ? 'font-bold text-purple-600' : 'text-gray-700'}>
                        {day}
                      </span>
                      {checkInData?.hasCheckIn && (
                        <span className="text-lg mt-1">
                          {getEmotionEmoji(checkInData.emotion)}
                        </span>
                      )}
                    </div>
                  )}
                </motion.button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-center gap-4 text-xs text-gray-600">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded bg-purple-100"></div>
                <span>Checked in</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded border-2 border-purple-500"></div>
                <span>Today</span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
