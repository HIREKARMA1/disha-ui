"use client";

interface ClassicATSTemplateProps {
  resumeData: any;
}

export function ClassicATSTemplate({ resumeData }: ClassicATSTemplateProps) {
  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div
      className="bg-white text-black p-8 pb-12 text-sm leading-relaxed max-w-[800px] mx-auto"
      style={{ fontFamily: "Arial, sans-serif" }}
    >
      {/* Header Section */}
      <div className="flex items-start mb-6">
        {/* Profile Photo - Increased size from w-20 h-20 to w-28 h-28 */}
        <div className="w-28 h-28 bg-blue-100 border-2 border-blue-300 rounded mr-6 flex items-center justify-center text-blue-600 text-xs font-medium overflow-hidden">
          {resumeData.header?.profilePhoto ? (
            <img
              src={resumeData.header.profilePhoto}
              alt="Profile"
              className="w-full h-full object-cover rounded"
              onError={(e) => {
                // Fallback to placeholder if image fails to load
                e.currentTarget.style.display = "none";
                e.currentTarget.nextElementSibling?.classList.remove("hidden");
              }}
            />
          ) : null}
          <span className={resumeData.header?.profilePhoto ? "hidden" : ""}>
            Photo
          </span>
        </div>

        {/* Name and Contact Info */}
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-blue-800 mb-4">
            {resumeData.header?.fullName || "Your Name"}
          </h1>

          <div className="grid grid-cols-2 gap-8">
            {/* Left Column - Address, Phone, Email with labels */}
            <div className="space-y-2">
              {resumeData.header?.location && (
                <div className="text-gray-700">
                  <span className="font-medium">Address:</span>{" "}
                  {resumeData.header.location}
                </div>
              )}
              {resumeData.header?.phone && (
                <div className="text-gray-700">
                  <span className="font-medium">Phone:</span>{" "}
                  {resumeData.header.phone}
                </div>
              )}
              {resumeData.header?.email && (
                <div className="text-gray-700">
                  <span className="font-medium">Email:</span>{" "}
                  {resumeData.header.email}
                </div>
              )}
            </div>

            {/* Right Column - Just the clickable links without labels */}
            <div className="space-y-2">
              {resumeData.header?.linkedin && (
                <a
                  href={resumeData.header.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 block"
                >
                  LinkedIn
                </a>
              )}
              {resumeData.header?.website && (
                <a
                  href={resumeData.header.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 block"
                >
                  GitHub
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Summary Section */}
      {resumeData.summary && (
        <div className="mb-6">
          <h2 className="text-lg font-bold text-blue-800 uppercase border-b-2 border-blue-800 pb-1 mb-3">
            SUMMARY
          </h2>
          <p className="text-gray-800 leading-relaxed">{resumeData.summary}</p>
        </div>
      )}

      {/* Work Experience Section */}
      {resumeData.experience && resumeData.experience.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-bold text-blue-800 uppercase border-b-2 border-blue-800 pb-1 mb-3">
            WORK EXPERIENCE
          </h2>
          <div className="space-y-4">
            {resumeData.experience.map((exp: any, index: number) => (
              <div key={exp.id || index} className="mb-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-black">
                    {exp.position || "Position"}, {exp.company || "Company"}
                  </h3>
                  <span className="text-gray-600 text-sm">
                    {exp.startDate && formatDate(exp.startDate)}
                    {exp.startDate && exp.endDate && !exp.current && " - "}
                    {exp.endDate && !exp.current && formatDate(exp.endDate)}
                    {exp.current && " - Present"}
                  </span>
                </div>
                {exp.description && exp.description.length > 0 && (
                  <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4">
                    {exp.description.map(
                      (desc: string, descIndex: number) =>
                        desc && <li key={descIndex}>{desc}</li>
                    )}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Projects Section - Moved to be right after Work Experience */}
      {resumeData.projects && resumeData.projects.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-bold text-blue-800 uppercase border-b-2 border-blue-800 pb-1 mb-3">
            PROJECTS
          </h2>
          <div className="space-y-4">
            {resumeData.projects.map((project: any, index: number) => (
              <div key={project.id || index} className="mb-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-black">
                    {project.name || "Project Name"}
                  </h3>
                  {project.link && (
                    <a
                      href={project.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline text-sm"
                    >
                      Link
                    </a>
                  )}
                </div>
                {project.description && (
                  <p className="text-gray-600 mb-2">{project.description}</p>
                )}
                {project.technologies && project.technologies.length > 0 && (
                  <p className="text-gray-600">
                    <span className="font-medium">Technologies:</span>{" "}
                    {project.technologies.join(", ")}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Education Section */}
      {resumeData.education && resumeData.education.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-bold text-blue-800 uppercase border-b-2 border-blue-800 pb-1 mb-3">
            EDUCATION
          </h2>
          <div className="space-y-4">
            {resumeData.education.map((edu: any, index: number) => (
              <div key={edu.id || index} className="mb-3">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-black">
                    {edu.degree || "Degree"}
                  </h3>
                  <span className="text-gray-600 text-sm">
                    {edu.startDate && formatDate(edu.startDate)}
                    {edu.startDate && edu.endDate && !edu.current && " - "}
                    {edu.endDate && !edu.current && formatDate(edu.endDate)}
                    {edu.current && " - Present"}
                  </span>
                </div>
                <div className="text-gray-700 font-medium mb-1">
                  {edu.institution || "Institution"}
                  {edu.location && `, ${edu.location}`}
                </div>

                <div className="flex gap-4 mb-1">
                  {edu.field && (
                    <div className="text-gray-600">Major: {edu.field}</div>
                  )}
                  {edu.gpa && (
                    <div className="text-gray-600">CGPA: {edu.gpa}</div>
                  )}
                </div>
                {edu.achievements && edu.achievements.length > 0 && (
                  <div className="text-gray-600 text-sm">
                    {edu.achievements.map(
                      (achievement: string, achievementIndex: number) =>
                        achievement && (
                          <span key={achievementIndex}>
                            {achievementIndex > 0 && " • "}
                            {achievement}
                          </span>
                        )
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Skills Section */}
      {resumeData.skills && (
        <div className="mb-6">
          <h2 className="text-lg font-bold text-blue-800 uppercase border-b-2 border-blue-800 pb-1 mb-3">
            SKILLS
          </h2>
          <div className="space-y-2">
            {resumeData.skills.technical &&
              resumeData.skills.technical.length > 0 && (
                <div>
                  <span className="font-bold text-black">
                    Technical Skills:
                  </span>{" "}
                  <span className="text-gray-600">
                    {resumeData.skills.technical.join(", ")}
                  </span>
                </div>
              )}

            {resumeData.skills.soft && resumeData.skills.soft.length > 0 && (
              <div>
                <span className="font-bold text-black">Soft Skills:</span>{" "}
                <span className="text-gray-600">
                  {resumeData.skills.soft.join(", ")}
                </span>
              </div>
            )}

            {resumeData.skills.languages &&
              resumeData.skills.languages.length > 0 && (
                <div>
                  <span className="font-bold text-black">Languages:</span>{" "}
                  <span className="text-gray-600">
                    {resumeData.skills.languages.join(", ")}
                  </span>
                </div>
              )}
          </div>
        </div>
      )}

      {/* Certifications Section */}
      {resumeData.certifications && resumeData.certifications.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-bold text-blue-800 uppercase border-b-2 border-blue-800 pb-1 mb-3">
            CERTIFICATIONS
          </h2>
          <div className="space-y-3">
            {resumeData.certifications.map((cert: any, index: number) => (
              <div
                key={cert.id || index}
                className="flex justify-between items-center"
              >
                <div>
                  <h3 className="font-medium text-black">
                    {cert.name || "Certification Name"}
                  </h3>
                  {cert.issuer && (
                    <div className="text-gray-600 text-sm">{cert.issuer}</div>
                  )}
                </div>
                <div className="text-right">
                  {cert.date && (
                    <div className="text-gray-600 text-sm">
                      {formatDate(cert.date)}
                    </div>
                  )}
                  {cert.link && (
                    <a
                      href={cert.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline text-sm"
                    >
                      Verify
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
