"use client"

import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Input } from "@/components/ui/input"

interface DatePickerProps {
  selected?: Date
  onSelect?: (date: Date | undefined) => void
  onChange?: (date: Date | undefined) => void
  placeholder?: string
  disabled?: boolean
  className?: string
}

export function DatePicker({
  selected,
  onSelect,
  onChange,
  placeholder = "Pick a date",
  disabled = false,
  className = "",
}: DatePickerProps) {
  const [date, setDate] = React.useState<string>(selected ? format(selected, 'yyyy-MM-dd') : '');
  
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDate(e.target.value);
    
    if (e.target.value) {
      const newDate = new Date(e.target.value);
      if (onSelect) onSelect(newDate);
      if (onChange) onChange(newDate);
    } else {
      if (onSelect) onSelect(undefined);
      if (onChange) onChange(undefined);
    }
  };
  
  React.useEffect(() => {
    if (selected) {
      setDate(format(selected, 'yyyy-MM-dd'));
    } else {
      setDate('');
    }
  }, [selected]);

  return (
    <div className={cn("relative w-full min-w-0", className)}>
      <CalendarIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400 pointer-events-none z-10" />
      <Input
        type="date"
        value={date}
        onChange={handleDateChange}
        className="pl-9 pr-2 w-full h-9 text-xs bg-white border-gray-200 focus:bg-white [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-60 hover:[&::-webkit-calendar-picker-indicator]:opacity-100"
        disabled={disabled}
      />
    </div>
  )
}