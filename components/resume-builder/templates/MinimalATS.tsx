"use client";

import type { ReactNode } from "react";
import { ResumeTemplateProps } from "./shared/types";
import { filterEmpty, formatDateRange } from "./shared/utils";

export function MinimalATSTemplate({ resumeData }: ResumeTemplateProps) {
  const technical = filterEmpty(resumeData.skills?.technical);
  const soft = filterEmpty(resumeData.skills?.soft);
  const languages = filterEmpty(resumeData.skills?.languages);
  const allAchievements = (resumeData.education || []).flatMap(
    (edu) => filterEmpty(edu.achievements)
  );

  const SectionHeading = ({ children }: { children: ReactNode }) => (
    <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-black border-b border-black pb-1 mb-3 mt-6 first:mt-0">
      {children}
    </h2>
  );

  return (
    <div
      className="bg-white text-black p-10 pb-14 text-[11pt] leading-[1.5] max-w-[800px] mx-auto"
      style={{ fontFamily: "'Calibri', 'Arial', sans-serif" }}
    >
      {/* Header */}
      <header className="text-center mb-6 pb-4 border-b border-gray-300">
        <h1 className="text-2xl font-bold uppercase tracking-wide mb-2">
          {resumeData.header?.fullName || "Your Name"}
        </h1>
        <p className="text-sm text-gray-700">
          {[
            resumeData.header?.location,
            resumeData.header?.phone,
            resumeData.header?.email,
          ]
            .filter(Boolean)
            .join("  |  ")}
        </p>
        {(resumeData.header?.linkedin || resumeData.header?.website) && (
          <p className="text-sm text-gray-700 mt-1">
            {[
              resumeData.header?.linkedin && "LinkedIn",
              resumeData.header?.website && "Website",
            ]
              .filter(Boolean)
              .join("  |  ")}
          </p>
        )}
      </header>

      {resumeData.summary && (
        <section>
          <SectionHeading>Summary</SectionHeading>
          <p className="text-gray-800">{resumeData.summary}</p>
        </section>
      )}

      {resumeData.experience?.length > 0 && (
        <section>
          <SectionHeading>Experience</SectionHeading>
          <div className="space-y-4">
            {resumeData.experience.map((exp, index) => (
              <div key={exp.id || index}>
                <div className="flex justify-between items-baseline gap-4">
                  <h3 className="font-bold">
                    {exp.position}
                    {exp.company && `, ${exp.company}`}
                  </h3>
                  <span className="text-sm text-gray-600 whitespace-nowrap">
                    {formatDateRange(exp.startDate, exp.endDate, exp.current)}
                  </span>
                </div>
                {exp.location && (
                  <p className="text-sm text-gray-600">{exp.location}</p>
                )}
                {filterEmpty(exp.description).length > 0 && (
                  <ul className="list-disc list-outside ml-5 mt-1 text-gray-800 space-y-0.5">
                    {filterEmpty(exp.description).map((desc, i) => (
                      <li key={i}>{desc}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {resumeData.education?.length > 0 && (
        <section>
          <SectionHeading>Education</SectionHeading>
          <div className="space-y-3">
            {resumeData.education.map((edu, index) => (
              <div key={edu.id || index}>
                <div className="flex justify-between items-baseline gap-4">
                  <h3 className="font-bold">
                    {edu.institution}
                    {edu.degree && ` — ${edu.degree}`}
                    {edu.field && `, ${edu.field}`}
                  </h3>
                  <span className="text-sm text-gray-600 whitespace-nowrap">
                    {formatDateRange(edu.startDate, edu.endDate, edu.current)}
                  </span>
                </div>
                {edu.gpa && (
                  <p className="text-sm text-gray-700">GPA: {edu.gpa}</p>
                )}
                {filterEmpty(edu.achievements).length > 0 && (
                  <p className="text-sm text-gray-700">
                    {filterEmpty(edu.achievements).join("; ")}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {resumeData.projects?.length > 0 && (
        <section>
          <SectionHeading>Projects</SectionHeading>
          <div className="space-y-3">
            {resumeData.projects.map((project, index) => (
              <div key={project.id || index}>
                <h3 className="font-bold">{project.name}</h3>
                {project.description && (
                  <p className="text-gray-800">{project.description}</p>
                )}
                {filterEmpty(project.technologies).length > 0 && (
                  <p className="text-sm text-gray-600">
                    Technologies: {project.technologies.join(", ")}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {(technical.length > 0 || soft.length > 0) && (
        <section>
          <SectionHeading>Skills</SectionHeading>
          {technical.length > 0 && (
            <p>
              <span className="font-bold">Technical: </span>
              {technical.join(", ")}
            </p>
          )}
          {soft.length > 0 && (
            <p className="mt-1">
              <span className="font-bold">Soft Skills: </span>
              {soft.join(", ")}
            </p>
          )}
        </section>
      )}

      {languages.length > 0 && (
        <section>
          <SectionHeading>Languages</SectionHeading>
          <p>{languages.join(", ")}</p>
        </section>
      )}

      {resumeData.certifications?.length > 0 && (
        <section>
          <SectionHeading>Certifications</SectionHeading>
          <div className="space-y-2">
            {resumeData.certifications.map((cert, index) => (
              <div key={cert.id || index} className="flex justify-between gap-4">
                <div>
                  <span className="font-bold">{cert.name}</span>
                  {cert.issuer && (
                    <span className="text-gray-700"> — {cert.issuer}</span>
                  )}
                </div>
                {cert.date && (
                  <span className="text-sm text-gray-600 whitespace-nowrap">
                    {cert.date}
                  </span>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {allAchievements.length > 0 && (
        <section>
          <SectionHeading>Achievements</SectionHeading>
          <ul className="list-disc list-outside ml-5 space-y-0.5">
            {allAchievements.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
