"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

export interface CheckboxProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, ...props }, ref) => {
    return (
      <label className="relative inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          className="sr-only peer"
          ref={ref}
          {...props}
        />
        <div
          className={cn(
            "w-4 h-4 border border-warm-400 peer-checked:bg-warm-400 peer-checked:border-warm-400 peer-focus-visible:ring-2 peer-focus-visible:ring-warm-400 peer-focus-visible:ring-offset-2 transition-colors flex items-center justify-center",
            className
          )}
        >
          <Check className="w-3 h-3 text-white opacity-0 peer-checked:opacity-100 transition-opacity" />
        </div>
      </label>
    );
  }
);
Checkbox.displayName = "Checkbox";

export { Checkbox };
