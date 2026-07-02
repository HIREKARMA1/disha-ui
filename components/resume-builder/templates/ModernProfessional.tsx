"use client";

import { ProfilePhoto } from "./shared/ProfilePhoto";
import { ResumeTemplateProps } from "./shared/types";
import {
  filterEmpty,
  formatDateRange,
  skillProgressValue,
} from "./shared/utils";

const ACCENT = "#1e40af";
const SIDEBAR = "#1e3a5f";

export function ModernProfessionalTemplate({ resumeData }: ResumeTemplateProps) {
  const technical = filterEmpty(resumeData.skills?.technical);
  const soft = filterEmpty(resumeData.skills?.soft);
  const languages = filterEmpty(resumeData.skills?.languages);
  const allAchievements = (resumeData.education || []).flatMap(
    (edu) => filterEmpty(edu.achievements)
  );

  return (
    <div
      className="bg-white text-gray-800 text-sm leading-relaxed max-w-[800px] mx-auto shadow-sm print:shadow-none"
      style={{ fontFamily: "'Segoe UI', 'Helvetica Neue', Arial, sans-serif" }}
    >
      <div className="flex min-h-[1050px]">
        {/* Left Sidebar */}
        <aside
          className="w-[32%] text-white p-6 flex flex-col gap-6"
          style={{ backgroundColor: SIDEBAR }}
        >
          <div className="flex flex-col items-center text-center">
            <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-white/30 bg-white/10 flex items-center justify-center mb-4">
              <ProfilePhoto
                src={resumeData.header?.profilePhoto}
                className="w-full h-full object-cover"
                placeholderClassName="text-white/70 text-xs"
              />
            </div>
            <h1 className="text-xl font-bold leading-tight">
              {resumeData.header?.fullName || "Your Name"}
            </h1>
          </div>

          <section>
            <h2
              className="text-xs font-bold uppercase tracking-widest mb-3 pb-1 border-b border-white/30"
              style={{ color: "#93c5fd" }}
            >
              Contact
            </h2>
            <ul className="space-y-2 text-xs text-white/90">
              {resumeData.header?.email && (
                <li className="break-all">{resumeData.header.email}</li>
              )}
              {resumeData.header?.phone && <li>{resumeData.header.phone}</li>}
              {resumeData.header?.location && (
                <li>{resumeData.header.location}</li>
              )}
              {resumeData.header?.linkedin && (
                <li>
                  <a
                    href={resumeData.header.linkedin}
                    className="underline text-blue-200"
                  >
                    LinkedIn
                  </a>
                </li>
              )}
              {resumeData.header?.website && (
                <li>
                  <a
                    href={resumeData.header.website}
                    className="underline text-blue-200"
                  >
                    Portfolio
                  </a>
                </li>
              )}
            </ul>
          </section>

          {(technical.length > 0 || soft.length > 0) && (
            <section>
              <h2
                className="text-xs font-bold uppercase tracking-widest mb-3 pb-1 border-b border-white/30"
                style={{ color: "#93c5fd" }}
              >
                Skills
              </h2>
              <div className="space-y-3">
                {[...technical, ...soft].map((skill, index, arr) => (
                  <div key={`${skill}-${index}`}>
                    <div className="flex justify-between text-xs mb-1">
                      <span>{skill}</span>
                    </div>
                    <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-blue-300"
                        style={{
                          width: `${skillProgressValue(index, arr.length)}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {languages.length > 0 && (
            <section>
              <h2
                className="text-xs font-bold uppercase tracking-widest mb-3 pb-1 border-b border-white/30"
                style={{ color: "#93c5fd" }}
              >
                Languages
              </h2>
              <div className="flex flex-wrap gap-1.5">
                {languages.map((lang, i) => (
                  <span
                    key={i}
                    className="text-xs px-2 py-0.5 rounded bg-white/15"
                  >
                    {lang}
                  </span>
                ))}
              </div>
            </section>
          )}

          {resumeData.certifications?.length > 0 && (
            <section>
              <h2
                className="text-xs font-bold uppercase tracking-widest mb-3 pb-1 border-b border-white/30"
                style={{ color: "#93c5fd" }}
              >
                Certifications
              </h2>
              <ul className="space-y-2 text-xs">
                {resumeData.certifications.map((cert, index) => (
                  <li key={cert.id || index}>
                    <div className="font-medium">{cert.name}</div>
                    {cert.issuer && (
                      <div className="text-white/70">{cert.issuer}</div>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          )}
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          {resumeData.summary && (
            <section className="mb-6">
              <h2
                className="text-sm font-bold uppercase tracking-wide mb-2"
                style={{ color: ACCENT }}
              >
                Professional Summary
              </h2>
              <p className="text-gray-700 leading-relaxed">
                {resumeData.summary}
              </p>
            </section>
          )}

          {resumeData.experience?.length > 0 && (
            <section className="mb-6">
              <h2
                className="text-sm font-bold uppercase tracking-wide mb-4 pb-1 border-b-2"
                style={{ color: ACCENT, borderColor: ACCENT }}
              >
                Experience
              </h2>
              <div className="space-y-5">
                {resumeData.experience.map((exp, index) => (
                  <div key={exp.id || index}>
                    <div className="flex justify-between items-start gap-2 mb-1">
                      <h3 className="font-bold text-gray-900">
                        {exp.position}
                        {exp.company && (
                          <span className="font-normal text-gray-600">
                            {" "}
                            · {exp.company}
                          </span>
                        )}
                      </h3>
                      <span className="text-xs text-gray-500 whitespace-nowrap">
                        {formatDateRange(
                          exp.startDate,
                          exp.endDate,
                          exp.current
                        )}
                      </span>
                    </div>
                    {exp.location && (
                      <p className="text-xs text-gray-500 mb-1">
                        {exp.location}
                      </p>
                    )}
                    {filterEmpty(exp.description).length > 0 && (
                      <ul className="list-disc list-outside ml-4 text-gray-600 space-y-0.5 text-xs">
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
            <section className="mb-6">
              <h2
                className="text-sm font-bold uppercase tracking-wide mb-4 pb-1 border-b-2"
                style={{ color: ACCENT, borderColor: ACCENT }}
              >
                Education
              </h2>
              <div className="space-y-4">
                {resumeData.education.map((edu, index) => (
                  <div key={edu.id || index}>
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <h3 className="font-bold text-gray-900">
                          {edu.degree}
                          {edu.field && ` in ${edu.field}`}
                        </h3>
                        <p className="text-gray-600 text-xs">
                          {edu.institution}
                          {edu.location && `, ${edu.location}`}
                        </p>
                      </div>
                      <span className="text-xs text-gray-500 whitespace-nowrap">
                        {formatDateRange(
                          edu.startDate,
                          edu.endDate,
                          edu.current
                        )}
                      </span>
                    </div>
                    {edu.gpa && (
                      <p className="text-xs text-gray-500 mt-0.5">
                        GPA: {edu.gpa}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {resumeData.projects?.length > 0 && (
            <section className="mb-6">
              <h2
                className="text-sm font-bold uppercase tracking-wide mb-4 pb-1 border-b-2"
                style={{ color: ACCENT, borderColor: ACCENT }}
              >
                Projects
              </h2>
              <div className="space-y-4">
                {resumeData.projects.map((project, index) => (
                  <div key={project.id || index}>
                    <div className="flex justify-between items-start">
                      <h3 className="font-bold text-gray-900">
                        {project.name}
                      </h3>
                      {(project.link || project.github) && (
                        <a
                          href={project.link || project.github}
                          className="text-xs"
                          style={{ color: ACCENT }}
                        >
                          View
                        </a>
                      )}
                    </div>
                    {project.description && (
                      <p className="text-gray-600 text-xs mt-1">
                        {project.description}
                      </p>
                    )}
                    {filterEmpty(project.technologies).length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {project.technologies.map((tech, i) => (
                          <span
                            key={i}
                            className="text-xs px-2 py-0.5 rounded bg-blue-50 text-blue-800"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {allAchievements.length > 0 && (
            <section>
              <h2
                className="text-sm font-bold uppercase tracking-wide mb-3 pb-1 border-b-2"
                style={{ color: ACCENT, borderColor: ACCENT }}
              >
                Achievements
              </h2>
              <ul className="list-disc list-outside ml-4 text-gray-600 text-xs space-y-1">
                {allAchievements.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </section>
          )}
        </main>
      </div>
    </div>
  );
}
