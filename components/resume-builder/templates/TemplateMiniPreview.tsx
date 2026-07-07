"use client";

import { useEffect, useRef, useState } from "react";
import { getTemplateComponent, TemplateSlug } from "./TemplateRegistry";
import { sampleResumeData } from "../sampleResumeData";

// The templates are designed at an 800px content width. We render the real
// template component at that width and scale it down to fit the card, so each
// card shows a true, finished-looking miniature of the resume (not a wireframe).
const DESIGN_WIDTH = 800;

interface TemplateMiniPreviewProps {
  templateId: TemplateSlug;
  /** A4-like aspect ratio (height / width) for the card. Defaults to a page. */
  aspectRatio?: number;
  className?: string;
}

export function TemplateMiniPreview({
  templateId,
  aspectRatio = 1.414,
  className = "",
}: TemplateMiniPreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.32);
  const TemplateComponent = getTemplateComponent(templateId);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const update = () => {
      const width = el.clientWidth;
      if (width > 0) {
        setScale(width / DESIGN_WIDTH);
      }
    };

    update();

    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={containerRef}
      className={`relative w-full overflow-hidden bg-white rounded-lg shadow-inner ${className}`}
      style={{ paddingBottom: `${aspectRatio * 100}%` }}
    >
      <div className="absolute inset-0 overflow-hidden">
        <div
          className="absolute top-0 left-0 pointer-events-none origin-top-left"
          style={{ width: DESIGN_WIDTH, transform: `scale(${scale})` }}
        >
          <TemplateComponent resumeData={sampleResumeData as any} />
        </div>
      </div>
    </div>
  );
}
