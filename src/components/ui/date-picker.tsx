"use client";

import * as React from "react";
import { format, startOfMonth, subMonths, addMonths, getDaysInMonth, getDay, isSameDay, parse } from "date-fns";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

// ==========================================
// 1. DATE PICKER (Date-only: YYYY-MM-DD)
// ==========================================
interface DatePickerProps {
  value?: string; // YYYY-MM-DD
  onChange?: (value: string) => void;
  className?: string;
  placeholder?: string;
}

export function DatePicker({ value, onChange, className, placeholder = "Pick a date" }: DatePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  // Parse current value or default to now
  const parsedDate = React.useMemo(() => {
    if (!value) return null;
    try {
      return parse(value, "yyyy-MM-dd", new Date());
    } catch {
      return null;
    }
  }, [value]);

  const activeDate = parsedDate || new Date();
  const [viewDate, setViewDate] = React.useState<Date>(activeDate);

  // Keep viewDate in sync when popover opens
  React.useEffect(() => {
    if (isOpen && parsedDate) {
      setViewDate(parsedDate);
    }
  }, [isOpen, parsedDate]);

  const handlePrevMonth = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setViewDate(subMonths(viewDate, 1));
  };

  const handleNextMonth = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setViewDate(addMonths(viewDate, 1));
  };

  const handleDateSelect = (day: number) => {
    const newDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
    const formatted = format(newDate, "yyyy-MM-dd");
    onChange?.(formatted);
    setIsOpen(false);
  };

  // Generate calendar days
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const daysCount = getDaysInMonth(viewDate);
  const firstDayIndex = getDay(startOfMonth(viewDate)); // 0 = Sunday, 1 = Monday...

  const days = Array.from({ length: daysCount }, (_, i) => i + 1);
  const blanks = Array.from({ length: firstDayIndex }, (_, i) => i);
  const weekdays = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          type="button"
          className={cn(
            "w-full justify-start text-left font-normal h-9 border border-border bg-card",
            !value && "text-muted-foreground",
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
          {parsedDate ? (
            format(parsedDate, "PPP")
          ) : (
            <span>{placeholder}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-3 z-50 bg-popover border border-border shadow-xl rounded-xl" align="start">
        <div className="w-[260px]">
          {/* Header */}
          <div className="flex items-center justify-between mb-2">
            <button
              onClick={handlePrevMonth}
              type="button"
              className="h-7 w-7 flex items-center justify-center rounded-md border border-border hover:bg-muted text-muted-foreground transition-colors cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-sm font-semibold">
              {format(viewDate, "MMMM yyyy")}
            </span>
            <button
              onClick={handleNextMonth}
              type="button"
              className="h-7 w-7 flex items-center justify-center rounded-md border border-border hover:bg-muted text-muted-foreground transition-colors cursor-pointer"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* Weekdays */}
          <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-muted-foreground mb-1">
            {weekdays.map((day) => (
              <div key={day} className="h-8 flex items-center justify-center w-8">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1 text-center text-sm">
            {blanks.map((blank) => (
              <div key={`blank-${blank}`} className="w-8 h-8" />
            ))}
            {days.map((day) => {
              const currentDate = new Date(year, month, day);
              const isSelected = parsedDate ? isSameDay(currentDate, parsedDate) : false;
              const isToday = isSameDay(currentDate, new Date());

              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => handleDateSelect(day)}
                  className={cn(
                    "w-8 h-8 flex items-center justify-center rounded-md transition-colors text-xs cursor-pointer",
                    isSelected
                      ? "bg-primary text-primary-foreground font-semibold shadow-sm shadow-primary/25"
                      : "hover:bg-muted text-foreground",
                    isToday && !isSelected && "border border-primary text-primary font-medium"
                  )}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

// ==========================================
// 2. DATE TIME PICKER (Date & Time: YYYY-MM-DDTHH:mm)
// ==========================================
interface DateTimePickerProps {
  value?: string; // YYYY-MM-DDTHH:mm
  onChange?: (value: string) => void;
  className?: string;
  placeholder?: string;
}

export function DateTimePicker({ value, onChange, className, placeholder = "Pick a date & time" }: DateTimePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  // Parse current value or default to now
  const parsedDate = React.useMemo(() => {
    if (!value) return new Date();
    try {
      return new Date(value);
    } catch {
      return new Date();
    }
  }, [value]);

  // Current month displayed in the calendar view
  const [viewDate, setViewDate] = React.useState<Date>(parsedDate);

  // Keep viewDate in sync when popover opens
  React.useEffect(() => {
    if (isOpen) {
      setViewDate(parsedDate);
    }
  }, [isOpen, parsedDate]);

  // Refs for hour/minute scroll containers
  const hourScrollRef = React.useRef<HTMLDivElement>(null);
  const minuteScrollRef = React.useRef<HTMLDivElement>(null);

  // Scroll active elements into view when open
  const scrollSelectedIntoView = React.useCallback(() => {
    setTimeout(() => {
      if (hourScrollRef.current) {
        const activeHour = hourScrollRef.current.querySelector('[data-selected="true"]');
        if (activeHour) {
          activeHour.scrollIntoView({ block: "center", behavior: "instant" as any });
        }
      }
      if (minuteScrollRef.current) {
        const activeMinute = minuteScrollRef.current.querySelector('[data-selected="true"]');
        if (activeMinute) {
          activeMinute.scrollIntoView({ block: "center", behavior: "instant" as any });
        }
      }
    }, 50);
  }, []);

  React.useEffect(() => {
    if (isOpen) {
      scrollSelectedIntoView();
    }
  }, [isOpen, scrollSelectedIntoView]);

  const handlePrevMonth = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setViewDate(subMonths(viewDate, 1));
  };

  const handleNextMonth = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setViewDate(addMonths(viewDate, 1));
  };

  const handleDateSelect = (day: number) => {
    const newDate = new Date(parsedDate);
    newDate.setFullYear(viewDate.getFullYear());
    newDate.setMonth(viewDate.getMonth());
    newDate.setDate(day);
    
    const formatted = format(newDate, "yyyy-MM-dd'T'HH:mm");
    onChange?.(formatted);
  };

  const handleHourSelect = (hour: number) => {
    const newDate = new Date(parsedDate);
    newDate.setHours(hour);
    const formatted = format(newDate, "yyyy-MM-dd'T'HH:mm");
    onChange?.(formatted);
  };

  const handleMinuteSelect = (minute: number) => {
    const newDate = new Date(parsedDate);
    newDate.setMinutes(minute);
    const formatted = format(newDate, "yyyy-MM-dd'T'HH:mm");
    onChange?.(formatted);
  };

  // Generate calendar days
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const daysCount = getDaysInMonth(viewDate);
  const firstDayIndex = getDay(startOfMonth(viewDate)); // 0 = Sunday, 1 = Monday...

  const days = Array.from({ length: daysCount }, (_, i) => i + 1);
  const blanks = Array.from({ length: firstDayIndex }, (_, i) => i);
  const weekdays = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

  // Time items
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const minutes = Array.from({ length: 60 }, (_, i) => i);

  const selectedHour = parsedDate.getHours();
  const selectedMinute = parsedDate.getMinutes();

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          type="button"
          className={cn(
            "w-full justify-start text-left font-normal h-9 border border-border bg-card",
            !value && "text-muted-foreground",
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
          {value ? (
            format(parsedDate, "PPP, p")
          ) : (
            <span>{placeholder}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 z-50 bg-popover border border-border shadow-xl rounded-xl" align="start">
        <div className="flex divide-x divide-border">
          {/* Calendar Section */}
          <div className="p-3 w-[260px]">
            {/* Header */}
            <div className="flex items-center justify-between mb-2">
              <button
                onClick={handlePrevMonth}
                type="button"
                className="h-7 w-7 flex items-center justify-center rounded-md border border-border hover:bg-muted text-muted-foreground transition-colors cursor-pointer"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="text-sm font-semibold">
                {format(viewDate, "MMMM yyyy")}
              </span>
              <button
                onClick={handleNextMonth}
                type="button"
                className="h-7 w-7 flex items-center justify-center rounded-md border border-border hover:bg-muted text-muted-foreground transition-colors cursor-pointer"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            {/* Weekdays */}
            <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-muted-foreground mb-1">
              {weekdays.map((day) => (
                <div key={day} className="h-8 flex items-center justify-center w-8">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1 text-center text-sm">
              {blanks.map((blank) => (
                <div key={`blank-${blank}`} className="w-8 h-8" />
              ))}
              {days.map((day) => {
                const currentDate = new Date(year, month, day);
                const isSelected = isSameDay(currentDate, parsedDate);
                const isToday = isSameDay(currentDate, new Date());

                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => handleDateSelect(day)}
                    className={cn(
                      "w-8 h-8 flex items-center justify-center rounded-md transition-colors text-xs cursor-pointer",
                      isSelected
                        ? "bg-primary text-primary-foreground font-semibold shadow-sm shadow-primary/25"
                        : "hover:bg-muted text-foreground",
                      isToday && !isSelected && "border border-primary text-primary font-medium"
                    )}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom Time Selection Section */}
          <div className="flex flex-col p-3 w-[130px] bg-muted/20 select-none">
            <div className="flex items-center gap-1.5 mb-2 px-1">
              <Clock className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs font-semibold text-foreground">Time</span>
            </div>

            <div className="flex gap-1 h-[210px]">
              {/* Hours Column */}
              <div 
                ref={hourScrollRef}
                className="flex-1 flex flex-col overflow-y-auto scrollbar-none pr-0.5 space-y-0.5"
              >
                <div className="text-[10px] uppercase font-bold text-muted-foreground/60 text-center pb-1 sticky top-0 bg-popover z-10">Hr</div>
                {hours.map((h) => {
                  const isHourSelected = h === selectedHour;
                  return (
                    <button
                      key={`h-${h}`}
                      type="button"
                      data-selected={isHourSelected ? "true" : "false"}
                      onClick={() => handleHourSelect(h)}
                      className={cn(
                        "w-full py-1 text-center rounded-md text-xs cursor-pointer transition-colors",
                        isHourSelected 
                          ? "bg-primary text-primary-foreground font-semibold" 
                          : "hover:bg-muted text-foreground"
                      )}
                    >
                      {String(h).padStart(2, "0")}
                    </button>
                  );
                })}
              </div>

              {/* Minutes Column */}
              <div 
                ref={minuteScrollRef}
                className="flex-1 flex flex-col overflow-y-auto scrollbar-none pl-0.5 space-y-0.5"
              >
                <div className="text-[10px] uppercase font-bold text-muted-foreground/60 text-center pb-1 sticky top-0 bg-popover z-10">Min</div>
                {minutes.map((m) => {
                  const isMinuteSelected = m === selectedMinute;
                  return (
                    <button
                      key={`m-${m}`}
                      type="button"
                      data-selected={isMinuteSelected ? "true" : "false"}
                      onClick={() => handleMinuteSelect(m)}
                      className={cn(
                        "w-full py-1 text-center rounded-md text-xs cursor-pointer transition-colors",
                        isMinuteSelected 
                          ? "bg-primary text-primary-foreground font-semibold" 
                          : "hover:bg-muted text-foreground"
                      )}
                    >
                      {String(m).padStart(2, "0")}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
