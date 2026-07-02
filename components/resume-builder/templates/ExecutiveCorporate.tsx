"use client";

import type { ReactNode } from "react";
import { ResumeTemplateProps } from "./shared/types";
import { filterEmpty, formatDateRange } from "./shared/utils";

const NAVY = "#1a365d";
const GOLD = "#b8860b";

export function ExecutiveCorporateTemplate({ resumeData }: ResumeTemplateProps) {
  const technical = filterEmpty(resumeData.skills?.technical);
  const soft = filterEmpty(resumeData.skills?.soft);
  const languages = filterEmpty(resumeData.skills?.languages);
  const allAchievements = (resumeData.education || []).flatMap(
    (edu) => filterEmpty(edu.achievements)
  );

  const SectionTitle = ({ children }: { children: ReactNode }) => (
    <h2
      className="text-sm font-bold uppercase tracking-[0.15em] mb-4 pb-2 border-b-2"
      style={{ color: NAVY, borderColor: GOLD }}
    >
      {children}
    </h2>
  );

  return (
    <div
      className="bg-white text-gray-800 text-sm leading-relaxed max-w-[800px] mx-auto"
      style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}
    >
      {/* Elegant Header */}
      <header
        className="px-10 pt-10 pb-8 text-center border-b-4"
        style={{ borderColor: NAVY }}
      >
        <h1
          className="text-4xl font-bold tracking-wide mb-2"
          style={{ color: NAVY }}
        >
          {resumeData.header?.fullName || "Your Name"}
        </h1>
        <div
          className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs mt-3"
          style={{ color: "#4a5568", fontFamily: "Arial, sans-serif" }}
        >
          {resumeData.header?.email && <span>{resumeData.header.email}</span>}
          {resumeData.header?.phone && (
            <>
              <span style={{ color: GOLD }}>|</span>
              <span>{resumeData.header.phone}</span>
            </>
          )}
          {resumeData.header?.location && (
            <>
              <span style={{ color: GOLD }}>|</span>
              <span>{resumeData.header.location}</span>
            </>
          )}
          {resumeData.header?.linkedin && (
            <>
              <span style={{ color: GOLD }}>|</span>
              <a href={resumeData.header.linkedin} style={{ color: NAVY }}>
                LinkedIn
              </a>
            </>
          )}
          {resumeData.header?.website && (
            <>
              <span style={{ color: GOLD }}>|</span>
              <a href={resumeData.header.website} style={{ color: NAVY }}>
                Website
              </a>
            </>
          )}
        </div>
      </header>

      <div className="px-10 py-8">
        {resumeData.summary && (
          <section className="mb-8">
            <SectionTitle>Executive Summary</SectionTitle>
            <p
              className="text-gray-700 leading-relaxed italic"
              style={{ fontFamily: "Arial, sans-serif" }}
            >
              {resumeData.summary}
            </p>
          </section>
        )}

        <div className="grid grid-cols-1 md:grid-cols-[1fr_240px] gap-8">
          {/* Left Column - Main Content */}
          <div>
            {resumeData.experience?.length > 0 && (
              <section className="mb-8">
                <SectionTitle>Professional Experience</SectionTitle>
                <div className="relative pl-6 border-l-2" style={{ borderColor: GOLD }}>
                  {resumeData.experience.map((exp, index) => (
                    <div key={exp.id || index} className="relative mb-6 last:mb-0">
                      <div
                        className="absolute -left-[25px] top-1 w-3 h-3 rounded-full border-2 bg-white"
                        style={{ borderColor: NAVY }}
                      />
                      <div className="flex justify-between items-start gap-2 mb-1">
                        <h3 className="font-bold" style={{ color: NAVY }}>
                          {exp.position}
                        </h3>
                        <span
                          className="text-xs whitespace-nowrap"
                          style={{
                            color: "#718096",
                            fontFamily: "Arial, sans-serif",
                          }}
                        >
                          {formatDateRange(
                            exp.startDate,
                            exp.endDate,
                            exp.current
                          )}
                        </span>
                      </div>
                      <p
                        className="font-semibold text-sm mb-1"
                        style={{ color: GOLD, fontFamily: "Arial, sans-serif" }}
                      >
                        {exp.company}
                        {exp.location && ` · ${exp.location}`}
                      </p>
                      {filterEmpty(exp.description).length > 0 && (
                        <ul
                          className="list-disc list-outside ml-4 text-gray-600 space-y-1 text-xs"
                          style={{ fontFamily: "Arial, sans-serif" }}
                        >
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
              <section className="mb-8">
                <SectionTitle>Education</SectionTitle>
                <div className="space-y-4">
                  {resumeData.education.map((edu, index) => (
                    <div key={edu.id || index}>
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <h3 className="font-bold" style={{ color: NAVY }}>
                            {edu.degree}
                            {edu.field && `, ${edu.field}`}
                          </h3>
                          <p
                            className="text-sm text-gray-600"
                            style={{ fontFamily: "Arial, sans-serif" }}
                          >
                            {edu.institution}
                          </p>
                        </div>
                        <span
                          className="text-xs text-gray-500 whitespace-nowrap"
                          style={{ fontFamily: "Arial, sans-serif" }}
                        >
                          {formatDateRange(
                            edu.startDate,
                            edu.endDate,
                            edu.current
                          )}
                        </span>
                      </div>
                      {edu.gpa && (
                        <p
                          className="text-xs text-gray-500 mt-0.5"
                          style={{ fontFamily: "Arial, sans-serif" }}
                        >
                          GPA: {edu.gpa}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {resumeData.projects?.length > 0 && (
              <section>
                <SectionTitle>Key Projects</SectionTitle>
                <div className="space-y-4">
                  {resumeData.projects.map((project, index) => (
                    <div key={project.id || index}>
                      <h3 className="font-bold" style={{ color: NAVY }}>
                        {project.name}
                      </h3>
                      {project.description && (
                        <p
                          className="text-gray-600 text-xs mt-1"
                          style={{ fontFamily: "Arial, sans-serif" }}
                        >
                          {project.description}
                        </p>
                      )}
                      {filterEmpty(project.technologies).length > 0 && (
                        <p
                          className="text-xs mt-1 text-gray-500"
                          style={{ fontFamily: "Arial, sans-serif" }}
                        >
                          {project.technologies.join(" · ")}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Right Column - Sidebar */}
          <aside
            className="space-y-6"
            style={{ fontFamily: "Arial, sans-serif" }}
          >
            {(technical.length > 0 || soft.length > 0) && (
              <section>
                <SectionTitle>Core Competencies</SectionTitle>
                <ul className="space-y-1.5 text-xs text-gray-700">
                  {[...technical, ...soft].map((skill, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span style={{ color: GOLD }}>▪</span>
                      {skill}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {languages.length > 0 && (
              <section>
                <SectionTitle>Languages</SectionTitle>
                <ul className="space-y-1 text-xs text-gray-700">
                  {languages.map((lang, i) => (
                    <li key={i}>{lang}</li>
                  ))}
                </ul>
              </section>
            )}

            {resumeData.certifications?.length > 0 && (
              <section>
                <SectionTitle>Certifications</SectionTitle>
                <ul className="space-y-3 text-xs">
                  {resumeData.certifications.map((cert, index) => (
                    <li key={cert.id || index}>
                      <div className="font-semibold text-gray-800">
                        {cert.name}
                      </div>
                      {cert.issuer && (
                        <div className="text-gray-500">{cert.issuer}</div>
                      )}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {allAchievements.length > 0 && (
              <section>
                <SectionTitle>Achievements</SectionTitle>
                <ul className="space-y-1 text-xs text-gray-700">
                  {allAchievements.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </section>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}
