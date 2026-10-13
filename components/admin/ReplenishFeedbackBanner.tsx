"use client";

import { X } from "lucide-react";
import {
  replenishFeedbackBannerClass,
  type ReplenishFeedback,
} from "@/lib/replenishQuestionsFeedback";

export function ReplenishFeedbackBanner({
  feedback,
  onDismiss,
}: {
  feedback: ReplenishFeedback | null;
  onDismiss: () => void;
}) {
  if (!feedback) return null;

  return (
    <div
      className={`mb-4 flex items-start gap-3 rounded-lg border px-4 py-3 text-sm ${replenishFeedbackBannerClass(feedback.type)}`}
      role="alert"
    >
      <p className="min-w-0 flex-1 leading-relaxed">{feedback.text}</p>
      <button
        type="button"
        onClick={onDismiss}
        className="shrink-0 rounded-md p-1 opacity-70 transition-opacity hover:opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1"
        aria-label="Dismiss message"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
