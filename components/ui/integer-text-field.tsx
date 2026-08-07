"use client";

import React, { useEffect, useState } from "react";

export type IntegerTextFieldProps = {
  value: number | null | undefined;
  onChange: (value: number | null) => void;
  min?: number;
  max?: number;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  id?: string;
  name?: string;
  /** When true, empty is allowed while typing; blur/commit still validates if required. */
  allowEmpty?: boolean;
  error?: string;
  onErrorChange?: (error: string) => void;
};

/**
 * Text input for whole numbers only.
 * Rejects letters, decimals, signs, and out-of-range values (does not apply them).
 */
export function IntegerTextField({
  value,
  onChange,
  min,
  max,
  placeholder,
  className = "",
  disabled,
  id,
  name,
  allowEmpty = true,
  error,
  onErrorChange,
}: IntegerTextFieldProps) {
  const [text, setText] = useState(
    value === null || value === undefined || Number.isNaN(value)
      ? ""
      : String(value),
  );
  const [localError, setLocalError] = useState("");

  useEffect(() => {
    if (value === null || value === undefined || Number.isNaN(Number(value))) {
      setText((prev) => (prev === "" ? prev : ""));
      return;
    }
    const next = String(value);
    setText((prev) => {
      const parsed = prev === "" ? null : Number(prev);
      if (parsed === value) return prev;
      return next;
    });
  }, [value]);

  const setErr = (msg: string) => {
    setLocalError(msg);
    onErrorChange?.(msg);
  };

  const clearErr = () => {
    setLocalError("");
    onErrorChange?.("");
  };

  const commitIfValid = (raw: string): boolean => {
    if (raw === "") {
      if (allowEmpty) {
        onChange(null);
        clearErr();
        return true;
      }
      setErr("Enter a whole number");
      return false;
    }
    if (!/^\d+$/.test(raw)) {
      setErr("Whole numbers only — no letters or decimals");
      return false;
    }
    const n = Number(raw);
    if (!Number.isInteger(n)) {
      setErr("Whole numbers only — no decimals");
      return false;
    }
    if (min !== undefined && n < min) {
      setErr(`Must be at least ${min}`);
      return false;
    }
    if (max !== undefined && n > max) {
      setErr(`Must be at most ${max}`);
      return false;
    }
    onChange(n);
    clearErr();
    return true;
  };

  const handleChange = (raw: string) => {
    if (raw === "") {
      setText("");
      if (allowEmpty) {
        onChange(null);
        clearErr();
      } else {
        setErr("Enter a whole number");
      }
      return;
    }

    // Reject any non-digit character (letters, decimal point, signs, spaces)
    if (!/^\d+$/.test(raw)) {
      setErr("Whole numbers only — no letters or decimals");
      return;
    }

    setText(raw);
    const n = Number(raw);
    if (min !== undefined && n < min) {
      setErr(`Must be at least ${min}`);
      return;
    }
    if (max !== undefined && n > max) {
      setErr(`Must be at most ${max}`);
      return;
    }
    onChange(n);
    clearErr();
  };

  const handleBlur = () => {
    if (text === "") {
      if (!allowEmpty) {
        setErr("Enter a whole number");
        if (value !== null && value !== undefined) setText(String(value));
      }
      return;
    }
    if (!commitIfValid(text)) {
      // Revert display to last committed valid value
      if (value !== null && value !== undefined && !Number.isNaN(Number(value))) {
        setText(String(value));
        clearErr();
      }
    }
  };

  const shownError = error || localError;

  return (
    <div>
      <input
        id={id}
        name={name}
        type="text"
        inputMode="numeric"
        autoComplete="off"
        disabled={disabled}
        placeholder={placeholder}
        value={text}
        onChange={(e) => handleChange(e.target.value)}
        onBlur={handleBlur}
        className={`${className}${shownError ? " border-red-500" : ""}`}
        aria-invalid={Boolean(shownError)}
      />
      {shownError ? (
        <p className="mt-1 text-xs text-red-600">{shownError}</p>
      ) : null}
    </div>
  );
}

/** Parse a committed integer field; returns null if empty/invalid. */
export function parseIntegerField(
  value: unknown,
  opts: { min?: number; max?: number } = {},
): number | null {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value === "number") {
    if (!Number.isInteger(value)) return null;
    if (opts.min !== undefined && value < opts.min) return null;
    if (opts.max !== undefined && value > opts.max) return null;
    return value;
  }
  const s = String(value).trim();
  if (!/^\d+$/.test(s)) return null;
  const n = Number(s);
  if (!Number.isInteger(n)) return null;
  if (opts.min !== undefined && n < opts.min) return null;
  if (opts.max !== undefined && n > opts.max) return null;
  return n;
}
