"use client";

import { ProfilePhoto } from "./shared/ProfilePhoto";
import { ResumeTemplateProps } from "./shared/types";
import { filterEmpty, formatDateRange } from "./shared/utils";

const TEAL = "#0d9488";
const LAVENDER = "#7c3aed";
const CORAL = "#f97316";

const IconMail = () => (
  <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

const IconPhone = () => (
  <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
  </svg>
);

const IconPin = () => (
  <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const IconLink = () => (
  <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
  </svg>
);

export function CreativePremiumTemplate({ resumeData }: ResumeTemplateProps) {
  const technical = filterEmpty(resumeData.skills?.technical);
  const soft = filterEmpty(resumeData.skills?.soft);
  const languages = filterEmpty(resumeData.skills?.languages);
  const allAchievements = (resumeData.education || []).flatMap(
    (edu) => filterEmpty(edu.achievements)
  );

  const SectionDivider = ({
    title,
    color,
  }: {
    title: string;
    color: string;
  }) => (
    <div className="flex items-center gap-3 mb-4 mt-6 first:mt-0">
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold"
        style={{ backgroundColor: color }}
      >
        {title.charAt(0)}
      </div>
      <h2
        className="text-sm font-bold uppercase tracking-widest flex-1"
        style={{ color }}
      >
        {title}
      </h2>
      <div className="flex-1 h-px" style={{ backgroundColor: `${color}40` }} />
    </div>
  );

  return (
    <div
      className="bg-white text-gray-800 text-sm leading-relaxed max-w-[800px] mx-auto overflow-hidden"
      style={{ fontFamily: "'Inter', 'Segoe UI', sans-serif" }}
    >
      {/* Stylish Header */}
      <header
        className="relative px-8 pt-8 pb-6"
        style={{
          background: `linear-gradient(135deg, ${TEAL}15 0%, ${LAVENDER}10 50%, ${CORAL}08 100%)`,
        }}
      >
        <div className="flex items-center gap-6">
          <div
            className="w-24 h-24 rounded-2xl overflow-hidden flex items-center justify-center shrink-0 shadow-md"
            style={{ backgroundColor: `${TEAL}20` }}
          >
            <ProfilePhoto
              src={resumeData.header?.profilePhoto}
              className="w-full h-full object-cover"
              placeholderClassName="text-teal-600 text-xs font-medium"
              placeholderText="Photo"
            />
          </div>
          <div className="flex-1 min-w-0">
            <h1
              className="text-3xl font-extrabold tracking-tight mb-1"
              style={{
                background: `linear-gradient(90deg, ${TEAL}, ${LAVENDER})`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              {resumeData.header?.fullName || "Your Name"}
            </h1>
            {resumeData.summary && (
              <p className="text-gray-600 text-xs leading-relaxed line-clamp-2">
                {resumeData.summary}
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-4 mt-4 text-xs text-gray-600">
          {resumeData.header?.email && (
            <span className="flex items-center gap-1.5">
              <span style={{ color: TEAL }}>
                <IconMail />
              </span>
              {resumeData.header.email}
            </span>
          )}
          {resumeData.header?.phone && (
            <span className="flex items-center gap-1.5">
              <span style={{ color: LAVENDER }}>
                <IconPhone />
              </span>
              {resumeData.header.phone}
            </span>
          )}
          {resumeData.header?.location && (
            <span className="flex items-center gap-1.5">
              <span style={{ color: CORAL }}>
                <IconPin />
              </span>
              {resumeData.header.location}
            </span>
          )}
          {resumeData.header?.linkedin && (
            <a
              href={resumeData.header.linkedin}
              className="flex items-center gap-1.5 hover:underline"
              style={{ color: TEAL }}
            >
              <IconLink />
              LinkedIn
            </a>
          )}
          {resumeData.header?.website && (
            <a
              href={resumeData.header.website}
              className="flex items-center gap-1.5 hover:underline"
              style={{ color: LAVENDER }}
            >
              <IconLink />
              Website
            </a>
          )}
        </div>
      </header>

      <div className="px-8 py-6">
        {resumeData.summary && (
          <section>
            <SectionDivider title="About Me" color={TEAL} />
            <p className="text-gray-700 leading-relaxed pl-11">
              {resumeData.summary}
            </p>
          </section>
        )}

        {resumeData.experience?.length > 0 && (
          <section>
            <SectionDivider title="Experience" color={LAVENDER} />
            <div className="space-y-5 pl-11">
              {resumeData.experience.map((exp, index) => (
                <div
                  key={exp.id || index}
                  className="relative pl-4 border-l-2"
                  style={{ borderColor: `${LAVENDER}50` }}
                >
                  <div className="flex justify-between items-start gap-2 mb-1">
                    <div>
                      <h3 className="font-bold text-gray-900">
                        {exp.position}
                      </h3>
                      <p className="text-sm font-medium" style={{ color: LAVENDER }}>
                        {exp.company}
                      </p>
                    </div>
                    <span className="text-xs text-gray-500 whitespace-nowrap bg-gray-50 px-2 py-0.5 rounded">
                      {formatDateRange(exp.startDate, exp.endDate, exp.current)}
                    </span>
                  </div>
                  {filterEmpty(exp.description).length > 0 && (
                    <ul className="list-none space-y-1 text-xs text-gray-600 mt-2">
                      {filterEmpty(exp.description).map((desc, i) => (
                        <li key={i} className="flex gap-2">
                          <span style={{ color: CORAL }}>›</span>
                          {desc}
                        </li>
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
            <SectionDivider title="Education" color={CORAL} />
            <div className="space-y-3 pl-11">
              {resumeData.education.map((edu, index) => (
                <div key={edu.id || index}>
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <h3 className="font-bold">{edu.degree}</h3>
                      <p className="text-sm text-gray-600">
                        {edu.institution}
                        {edu.field && ` · ${edu.field}`}
                      </p>
                    </div>
                    <span className="text-xs text-gray-500">
                      {formatDateRange(edu.startDate, edu.endDate, edu.current)}
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
          <section>
            <SectionDivider title="Projects" color={TEAL} />
            <div className="grid grid-cols-1 gap-3 pl-11">
              {resumeData.projects.map((project, index) => (
                <div
                  key={project.id || index}
                  className="p-3 rounded-lg border"
                  style={{ borderColor: `${TEAL}30`, backgroundColor: `${TEAL}05` }}
                >
                  <h3 className="font-bold text-gray-900">{project.name}</h3>
                  {project.description && (
                    <p className="text-xs text-gray-600 mt-1">
                      {project.description}
                    </p>
                  )}
                  {filterEmpty(project.technologies).length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {project.technologies.map((tech, i) => (
                        <span
                          key={i}
                          className="text-xs px-2 py-0.5 rounded-full text-white"
                          style={{ backgroundColor: TEAL }}
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

        {(technical.length > 0 || soft.length > 0) && (
          <section>
            <SectionDivider title="Skills" color={LAVENDER} />
            <div className="pl-11 space-y-2">
              {technical.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {technical.map((skill, i) => (
                    <span
                      key={i}
                      className="text-xs px-3 py-1 rounded-full border"
                      style={{ borderColor: LAVENDER, color: LAVENDER }}
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              )}
              {soft.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {soft.map((skill, i) => (
                    <span
                      key={i}
                      className="text-xs px-3 py-1 rounded-full border"
                      style={{ borderColor: CORAL, color: CORAL }}
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}

        {languages.length > 0 && (
          <section>
            <SectionDivider title="Languages" color={TEAL} />
            <p className="pl-11 text-gray-700">{languages.join(" · ")}</p>
          </section>
        )}

        {resumeData.certifications?.length > 0 && (
          <section>
            <SectionDivider title="Certifications" color={CORAL} />
            <div className="pl-11 space-y-2">
              {resumeData.certifications.map((cert, index) => (
                <div key={cert.id || index} className="flex justify-between gap-2">
                  <div>
                    <span className="font-semibold">{cert.name}</span>
                    {cert.issuer && (
                      <span className="text-gray-500 text-xs ml-2">
                        {cert.issuer}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {allAchievements.length > 0 && (
          <section>
            <SectionDivider title="Achievements" color={LAVENDER} />
            <ul className="pl-11 space-y-1 text-sm text-gray-700">
              {allAchievements.map((item, i) => (
                <li key={i} className="flex gap-2">
                  <span style={{ color: CORAL }}>★</span>
                  {item}
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </div>
  );
}
