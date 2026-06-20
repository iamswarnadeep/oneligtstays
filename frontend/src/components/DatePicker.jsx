import { useState } from "react";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Calendar as CalendarIcon } from "lucide-react";

function toISO(d) {
  if (!d) return "";
  const tz = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - tz).toISOString().split("T")[0];
}
function fromISO(s) {
  if (!s) return undefined;
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
}
function format(d) {
  if (!d) return "";
  return d.toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" });
}

/**
 * Reusable date picker. Renders a shadcn Calendar inside a Popover.
 *
 * Props:
 *  - value (ISO 'YYYY-MM-DD' string)
 *  - onChange (newIso => void)
 *  - minDate (ISO string, optional)
 *  - placeholder (string)
 *  - testid
 *  - className (applied to trigger button)
 *  - variant: 'plain' (just text, no border) or 'input' (full input look)
 */
export default function DatePicker({ value, onChange, minDate, placeholder = "Select date", testid, className = "", variant = "plain" }) {
  const [open, setOpen] = useState(false);
  const date = fromISO(value);
  const min = fromISO(minDate);

  const baseCls = variant === "input"
    ? "w-full border border-stone-300 rounded-md px-3 py-2 text-sm text-left flex items-center justify-between gap-2 outline-none hover:border-stone-500"
    : "w-full text-sm text-left bg-transparent outline-none flex items-center justify-between gap-2";

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button type="button" className={`${baseCls} ${className}`} data-testid={testid}>
          <span className={date ? "" : "text-stone-400"}>{date ? format(date) : placeholder}</span>
          <CalendarIcon className="w-4 h-4 text-stone-500 shrink-0" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 bg-white" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={(d) => { onChange(toISO(d)); setOpen(false); }}
          disabled={min ? (d) => d < min : undefined}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}
