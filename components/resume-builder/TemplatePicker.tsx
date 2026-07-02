"use client";

import { TemplateSlug, getTemplateList } from "./templates/TemplateRegistry";
import { TemplateThumbnail } from "./templates/TemplateThumbnail";

interface TemplatePickerProps {
  selectedTemplateId: TemplateSlug;
  onTemplateChange: (templateId: TemplateSlug) => void;
  compact?: boolean;
}

export function TemplatePicker({
  selectedTemplateId,
  onTemplateChange,
  compact = false,
}: TemplatePickerProps) {
  const templates = getTemplateList();

  if (compact) {
    return (
      <div className="flex flex-wrap gap-2">
        {templates.map((template) => (
          <button
            key={template.id}
            type="button"
            onClick={() => onTemplateChange(template.id as TemplateSlug)}
            className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-colors ${
              selectedTemplateId === template.id
                ? "bg-primary-500 text-white border-primary-500"
                : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:border-primary-400"
            }`}
          >
            {template.name}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 mb-4">
      <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
        Choose Template
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {templates.map((template) => (
          <button
            key={template.id}
            type="button"
            onClick={() => onTemplateChange(template.id as TemplateSlug)}
            className={`text-left rounded-lg border-2 p-2 transition-all hover:shadow-md ${
              selectedTemplateId === template.id
                ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20"
                : "border-gray-200 dark:border-gray-600 hover:border-gray-300"
            }`}
          >
            <TemplateThumbnail
              templateId={template.id as TemplateSlug}
              selected={selectedTemplateId === template.id}
            />
            <p className="text-xs font-medium text-gray-900 dark:text-white mt-2 truncate">
              {template.name}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}
