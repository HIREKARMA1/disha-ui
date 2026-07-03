"use client";

import { TemplateSlug, TEMPLATES } from "./TemplateRegistry";

interface TemplateThumbnailProps {
  templateId: TemplateSlug;
  selected?: boolean;
}

export function TemplateThumbnail({
  templateId,
  selected = false,
}: TemplateThumbnailProps) {
  const template = TEMPLATES[templateId];
  const accent = template.accentColor;

  const renderLayout = () => {
    switch (templateId) {
      case "modern-professional":
        return (
          <div className="flex h-full gap-1 p-2">
            <div
              className="w-[30%] rounded-sm"
              style={{ backgroundColor: accent }}
            />
            <div className="flex-1 space-y-1.5 pt-1">
              <div className="h-1.5 bg-gray-200 rounded w-3/4" />
              <div className="h-1 bg-gray-100 rounded w-full" />
              <div className="h-1 bg-gray-100 rounded w-5/6" />
              <div className="h-1 bg-gray-100 rounded w-full" />
            </div>
          </div>
        );
      case "executive-corporate":
        return (
          <div className="h-full p-2 space-y-2">
            <div
              className="h-6 rounded-sm border-b-2"
              style={{ borderColor: accent }}
            />
            <div className="flex gap-2 flex-1">
              <div className="flex-1 space-y-1">
                <div className="h-1 bg-gray-200 rounded w-full" />
                <div className="h-1 bg-gray-100 rounded w-4/5" />
                <div className="h-1 bg-gray-100 rounded w-full" />
              </div>
              <div className="w-[28%] space-y-1">
                <div className="h-1 bg-gray-200 rounded w-full" />
                <div className="h-1 bg-gray-100 rounded w-full" />
              </div>
            </div>
          </div>
        );
      case "minimal-ats":
        return (
          <div className="h-full p-3 space-y-2">
            <div className="text-center space-y-1">
              <div className="h-2 bg-black rounded w-1/2 mx-auto" />
              <div className="h-1 bg-gray-300 rounded w-2/3 mx-auto" />
            </div>
            <div className="border-t border-black pt-2 space-y-1">
              <div className="h-1 bg-gray-200 rounded w-1/3" />
              <div className="h-1 bg-gray-100 rounded w-full" />
              <div className="h-1 bg-gray-100 rounded w-5/6" />
            </div>
          </div>
        );
      case "creative-premium":
        return (
          <div className="h-full">
            <div
              className="h-8 rounded-t-sm"
              style={{
                background: `linear-gradient(135deg, ${accent}30, #7c3aed20)`,
              }}
            />
            <div className="p-2 space-y-1.5">
              <div className="flex gap-1 items-center">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: accent }}
                />
                <div className="h-1 bg-gray-200 rounded flex-1" />
              </div>
              <div className="h-1 bg-gray-100 rounded w-full" />
              <div className="flex gap-1">
                <div
                  className="h-3 flex-1 rounded"
                  style={{ backgroundColor: `${accent}15` }}
                />
                <div className="h-3 flex-1 rounded bg-purple-50" />
              </div>
            </div>
          </div>
        );
      case "classic-ats":
      default:
        return (
          <div className="h-full p-2 space-y-2">
            <div className="flex gap-2">
              <div
                className="w-8 h-8 rounded"
                style={{ backgroundColor: `${accent}20` }}
              />
              <div className="flex-1 space-y-1 pt-1">
                <div
                  className="h-2 rounded w-3/4"
                  style={{ backgroundColor: `${accent}40` }}
                />
                <div className="h-1 bg-gray-100 rounded w-full" />
              </div>
            </div>
            <div
              className="h-1 rounded w-1/3"
              style={{ backgroundColor: `${accent}30` }}
            />
            <div className="h-1 bg-gray-100 rounded w-full" />
            <div className="h-1 bg-gray-100 rounded w-5/6" />
          </div>
        );
    }
  };

  return (
    <div
      className={`bg-white rounded-lg shadow-inner overflow-hidden h-48 sm:h-56 transition-all ${
        selected ? "ring-2 ring-primary-500" : ""
      }`}
    >
      {renderLayout()}
    </div>
  );
}
