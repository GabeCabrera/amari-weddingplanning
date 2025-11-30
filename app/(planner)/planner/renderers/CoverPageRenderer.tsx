"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { CalendarDays, ChevronUp } from "lucide-react";
import { type BaseRendererProps } from "./types";
import { FieldLabel, MONTHS, DAYS_OF_WEEK } from "./shared";

export function CoverPageRenderer({ page, fields, updateField }: BaseRendererProps) {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [viewYear, setViewYear] = useState(() => {
    const savedDate = fields.weddingDate as string;
    if (savedDate) {
      return new Date(savedDate).getFullYear();
    }
    return new Date().getFullYear();
  });
  const [viewMonth, setViewMonth] = useState(() => {
    const savedDate = fields.weddingDate as string;
    if (savedDate) {
      return new Date(savedDate).getMonth();
    }
    return new Date().getMonth();
  });

  const weddingDate = fields.weddingDate as string;

  // Parse selected date - use local timezone to avoid off-by-one errors
  const selectedDate = weddingDate ? (() => {
    const [year, month, day] = weddingDate.split('-').map(Number);
    return { year, month: month - 1, day }; // month is 0-indexed
  })() : null;

  // Get days in month
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  // Get first day of month (0 = Sunday)
  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  // Generate calendar days
  const generateCalendarDays = () => {
    const daysInMonth = getDaysInMonth(viewYear, viewMonth);
    const firstDay = getFirstDayOfMonth(viewYear, viewMonth);
    const days: (number | null)[] = [];

    // Add empty cells for days before first day
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }

    // Add days of month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }

    return days;
  };

  const handleDateSelect = (day: number) => {
    const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    updateField("weddingDate", dateStr);
    setShowDatePicker(false);
  };

  const isSelectedDate = (day: number) => {
    if (!selectedDate) return false;
    return (
      selectedDate.year === viewYear &&
      selectedDate.month === viewMonth &&
      selectedDate.day === day
    );
  };

  const isToday = (day: number) => {
    const today = new Date();
    return (
      today.getFullYear() === viewYear &&
      today.getMonth() === viewMonth &&
      today.getDate() === day
    );
  };

  const goToPrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };

  const goToNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

  const formatDisplayDate = () => {
    if (!weddingDate) return null;
    // Parse directly from string to avoid timezone issues
    const [year, month, day] = weddingDate.split('-').map(Number);
    return { month: MONTHS[month - 1], day, year };
  };

  const displayDate = formatDisplayDate();

  // Generate year options (current year - 1 to current year + 5)
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 7 }, (_, i) => currentYear - 1 + i);

  return (
    <div className="max-w-2xl mx-auto px-4 md:px-0">
      <div className="bg-white shadow-lg aspect-auto md:aspect-[8.5/11] p-8 md:p-16 flex flex-col items-center justify-center text-center">
        <div className="w-12 md:w-16 h-px bg-warm-400 mb-6 md:mb-8" />
        
        <h1 className="text-3xl md:text-5xl font-serif font-light tracking-widest uppercase mb-2">
          Wedding
        </h1>
        <p className="text-xs md:text-sm tracking-[0.3em] md:tracking-[0.4em] uppercase text-warm-500 mb-6 md:mb-8">
          Planner
        </p>
        
        <div className="w-12 md:w-16 h-px bg-warm-400 mb-8 md:mb-12" />
        
        <div className="w-full max-w-xs space-y-6 md:space-y-8">
          {/* Names Input */}
          <div>
            <FieldLabel label="Names" fieldKey="names" />
            <Input
              value={(fields.names as string) || ""}
              onChange={(e) => updateField("names", e.target.value)}
              className="text-center text-sm md:text-base"
              placeholder="Your names (e.g., Emma & James)"
            />
          </div>

          {/* Custom Date Picker */}
          <div className="relative">
            <FieldLabel label="Wedding Date" fieldKey="weddingDate" />
            
            {/* Date Display Button */}
            <button
              onClick={() => setShowDatePicker(!showDatePicker)}
              className="w-full group"
            >
              {displayDate ? (
                <div className="p-3 md:p-4 border border-warm-200 hover:border-warm-400 transition-colors bg-gradient-to-b from-white to-warm-50">
                  <div className="flex items-center justify-center gap-3 md:gap-4">
                    <div className="text-right">
                      <p className="text-xl md:text-3xl font-serif font-light text-warm-700">
                        {displayDate.month}
                      </p>
                    </div>
                    <div className="w-px h-10 md:h-12 bg-warm-300" />
                    <div className="text-left">
                      <p className="text-2xl md:text-4xl font-serif font-light text-warm-800">
                        {displayDate.day}
                      </p>
                      <p className="text-xs md:text-sm tracking-wider text-warm-500">
                        {displayDate.year}
                      </p>
                    </div>
                  </div>
                  <p className="text-[10px] md:text-xs text-warm-400 mt-2 md:mt-3 group-hover:text-warm-600 transition-colors">
                    Click to change date
                  </p>
                </div>
              ) : (
                <div className="p-4 md:p-6 border-2 border-dashed border-warm-300 hover:border-warm-400 transition-colors">
                  <CalendarDays className="w-6 h-6 md:w-8 md:h-8 mx-auto text-warm-400 mb-2" />
                  <p className="text-xs md:text-sm text-warm-500">Click to select your wedding date</p>
                </div>
              )}
            </button>

            {/* Calendar Dropdown */}
            {showDatePicker && (
              <div className="absolute z-50 mt-2 left-1/2 -translate-x-1/2 w-full max-w-[300px] md:max-w-[320px]">
                <div className="bg-white border border-warm-200 shadow-xl p-3 md:p-4">
                  {/* Month/Year Navigation */}
                  <div className="flex items-center justify-between mb-3 md:mb-4">
                    <button
                      onClick={goToPrevMonth}
                      className="p-2 hover:bg-warm-100 transition-colors"
                    >
                      <ChevronUp className="w-4 h-4 rotate-[-90deg]" />
                    </button>
                    
                    <div className="flex items-center gap-1 md:gap-2">
                      <select
                        value={viewMonth}
                        onChange={(e) => setViewMonth(parseInt(e.target.value))}
                        className="px-1 md:px-2 py-1 text-xs md:text-sm border border-warm-200 bg-white font-medium"
                      >
                        {MONTHS.map((month, index) => (
                          <option key={month} value={index}>{month}</option>
                        ))}
                      </select>
                      <select
                        value={viewYear}
                        onChange={(e) => setViewYear(parseInt(e.target.value))}
                        className="px-1 md:px-2 py-1 text-xs md:text-sm border border-warm-200 bg-white font-medium"
                      >
                        {yearOptions.map((year) => (
                          <option key={year} value={year}>{year}</option>
                        ))}
                      </select>
                    </div>
                    
                    <button
                      onClick={goToNextMonth}
                      className="p-2 hover:bg-warm-100 transition-colors"
                    >
                      <ChevronUp className="w-4 h-4 rotate-90" />
                    </button>
                  </div>

                  {/* Days of Week Header */}
                  <div className="grid grid-cols-7 gap-1 mb-2">
                    {DAYS_OF_WEEK.map((day) => (
                      <div
                        key={day}
                        className="text-center text-[10px] md:text-xs font-medium text-warm-500 py-1"
                      >
                        {day}
                      </div>
                    ))}
                  </div>

                  {/* Calendar Grid */}
                  <div className="grid grid-cols-7 gap-1">
                    {generateCalendarDays().map((day, index) => (
                      <div key={index}>
                        {day !== null ? (
                          <button
                            onClick={() => handleDateSelect(day)}
                            className={`
                              w-full aspect-square flex items-center justify-center text-xs md:text-sm
                              transition-all duration-150
                              ${isSelectedDate(day)
                                ? "bg-warm-700 text-white font-medium"
                                : isToday(day)
                                  ? "bg-warm-100 text-warm-700 font-medium ring-1 ring-warm-400"
                                  : "hover:bg-warm-100 text-warm-600"
                              }
                            `}
                          >
                            {day}
                          </button>
                        ) : (
                          <div className="w-full aspect-square" />
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Clear/Close Buttons */}
                  <div className="flex gap-2 mt-3 md:mt-4 pt-3 md:pt-4 border-t border-warm-200">
                    {weddingDate && (
                      <button
                        onClick={() => {
                          updateField("weddingDate", "");
                          setShowDatePicker(false);
                        }}
                        className="flex-1 px-2 md:px-3 py-2 text-xs md:text-sm text-warm-500 hover:text-warm-700 hover:bg-warm-50 transition-colors"
                      >
                        Clear Date
                      </button>
                    )}
                    <button
                      onClick={() => setShowDatePicker(false)}
                      className="flex-1 px-2 md:px-3 py-2 text-xs md:text-sm bg-warm-100 text-warm-700 hover:bg-warm-200 transition-colors"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Backdrop to close date picker */}
      {showDatePicker && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowDatePicker(false)}
        />
      )}
    </div>
  );
}
