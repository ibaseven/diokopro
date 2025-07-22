import * as React from "react";
import { cn } from "@/lib/utils";


export interface InputOTPSlotProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  char?: string;
  hasFocus?: boolean;
}

export const InputOTPSlot = React.forwardRef<HTMLInputElement, InputOTPSlotProps>(
  ({ className, char, hasFocus, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          "w-10 h-12 text-center text-lg border rounded",
          "focus:border-blue-500 focus:ring-1 focus:ring-blue-500",
          "transition-all duration-200",
          hasFocus && "border-blue-500 ring-1 ring-blue-500",
          className
        )}
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        maxLength={1}
        value={char || ""}
        autoComplete="one-time-code"
        {...props}
      />
    );
  }
);
InputOTPSlot.displayName = "InputOTPSlot";

export interface InputOTPGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const InputOTPGroup = React.forwardRef<HTMLDivElement, InputOTPGroupProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("flex gap-2", className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);
InputOTPGroup.displayName = "InputOTPGroup";

export interface InputOTPProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange"> {
  value: string;
  onChange: (value: string) => void;
  maxLength?: number;
  render: (props: { slots: InputOTPSlotProps[] }) => React.ReactNode;
}

export const InputOTP = React.forwardRef<HTMLInputElement, InputOTPProps>(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  ({ className, value = "", onChange, maxLength = 6, render, ...props }, ref) => {
    const [hasFocus, setHasFocus] = React.useState(false);
    const inputRefs = React.useRef<(HTMLInputElement | null)[]>([]);

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>, index: number) => {
      if (event.key === "Backspace" && !value[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    };

    const handleInput = (event: React.ChangeEvent<HTMLInputElement>, index: number) => {
      const newChar = event.target.value.slice(-1);
      if (!/^\d*$/.test(newChar)) return;

      const newValue = value.split("");
      newValue[index] = newChar;
      onChange(newValue.join(""));

      if (newChar && index < maxLength - 1) {
        inputRefs.current[index + 1]?.focus();
      }
    };

    const slots: InputOTPSlotProps[] = Array.from({ length: maxLength }, (_, index) => ({
      char: value[index],
      hasFocus: hasFocus && index === value.length,
      onFocus: () => setHasFocus(true),
      onBlur: () => setHasFocus(false),
      onChange: (event) => handleInput(event, index),
      onKeyDown: (event) => handleKeyDown(event, index),
      ref: (el: HTMLInputElement) => {
        inputRefs.current[index] = el;
      },
    }));

    return render({ slots });
  }
);
InputOTP.displayName = "InputOTP";