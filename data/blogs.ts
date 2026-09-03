export type BlogSection = {
  heading?: string
  paragraphs: string[]
}

export type BlogPost = {
  slug: string
  title: string
  metaTitle: string
  metaDescription: string
  primaryKeyword: string
  category: string
  featured: boolean
  readTime: string
  sections?: BlogSection[]
  faqs?: { q: string; a: string }[]
}

export const BLOGS: BlogPost[] = [
  {
    slug: 'top-10-high-paying-career-opportunities-in-2026',
    title: 'Top 10 High-Paying Career Opportunities in 2026',
    metaTitle: 'Top 10 High-Paying Career Opportunities in 2026',
    metaDescription:
      "Discover the top 10 high-paying careers in 2026, in-demand skills, and expert tips to succeed in today's job market and boost your earning potential.",
    primaryKeyword: 'High-Paying Career Opportunities in 2026',
    category: 'Careers',
    featured: true,
    readTime: '8 min read',
    sections: [
      {
        paragraphs: [
          'As we look ahead to 2026, the landscape of career opportunities is evolving at an unprecedented pace, driven by technological advancements, demographic shifts, and changing economic dynamics. With many industries experiencing growth and transformation, it is crucial for job seekers and professionals to identify which careers not only promise high salaries but also align with emerging trends.',
          'This article explores the top high-paying career opportunities anticipated for 2026, the industries leading the charge, and the skills required to thrive in these roles—whether you are entering the workforce or considering a career change.',
        ],
      },
      {
        heading: 'Introduction to High-Paying Career Trends in 2026',
        paragraphs: [
          'With advancements in technology, evolving workplace dynamics, and an ever-changing economy, the need for skilled professionals is more pronounced than ever. Lucrative opportunities await those ready to align with these trends.',
        ],
      },
      {
        heading: 'Economic Factors Influencing Salaries',
        paragraphs: [
          'By 2026, inflation rates, economic recovery from global disturbances, and shifts in consumer spending will shape salary trends. Industries that adapt quickly will offer the highest pay to attract top talent—making economic awareness essential for job seekers.',
        ],
      },
      {
        heading: 'Shifts in Workforce Demographics',
        paragraphs: [
          'With Gen Z entering the workforce alongside an aging population, companies will seek diverse talent and unique perspectives. That shift creates new roles—and higher salaries—for professionals who can bridge generational gaps.',
        ],
      },
      {
        heading: 'Top Industries Driving Salaries',
        paragraphs: [
          'Technology and information services continue to lead with roles such as data scientists, cybersecurity experts, and AI specialists. Healthcare and biotech remain strong—from telemedicine to genetic engineering—while finance and investment roles in fintech, asset management, and analysis stay critical amid economic uncertainty.',
        ],
      },
      {
        heading: 'In-Demand Skills and Qualifications',
        paragraphs: [
          'High-paying roles in 2026 need both technical skills (coding, data analysis, cybersecurity) and soft skills (adaptability, communication, emotional intelligence). Continuous learning—courses, workshops, and structured practice—is no longer optional.',
        ],
      },
      {
        heading: 'The Role of Technology in Career Growth',
        paragraphs: [
          'Automation and AI will remove some tasks while creating roles that still need a human touch. Remote and flexible work remains a major opportunity, especially in tech and digital careers.',
        ],
      },
      {
        heading: 'Tips for Landing a High-Paying Position',
        paragraphs: [
          'Network at industry events and on LinkedIn, tailor every resume with role-specific keywords, and practice interviews with measurable achievements. Set clear career goals and stay adaptable as the market shifts.',
        ],
      },
      {
        heading: 'Conclusion',
        paragraphs: [
          'As 2026 approaches, high-paying opportunities favor people who invest in skills, understand growing industries, and stay proactive. Embrace the future—and take the steps that secure a rewarding career.',
        ],
      },
    ],
    faqs: [
      {
        q: 'What industries are expected to have the highest-paying jobs in 2026?',
        a: 'Technology, healthcare, finance, and renewable energy are expected to lead, driven by ongoing demand and advancement in these sectors.',
      },
      {
        q: 'What skills will be most in-demand for high-paying careers?',
        a: 'Technical skills such as data analysis, programming, and cybersecurity, plus soft skills like problem-solving, communication, and adaptability.',
      },
      {
        q: 'How can I prepare for a high-paying job in the future?',
        a: 'Build relevant qualifications, gain practical experience through internships or projects, network with professionals, and continuously update your skills.',
      },
      {
        q: 'Are remote jobs included in high-paying career opportunities?',
        a: 'Yes. Remote roles are increasingly part of high-paying opportunities, especially in tech and digital fields, as companies embrace flexible work.',
      },
    ],
  },
  {
    slug: 'most-in-demand-jobs-in-india-for-2026',
    title: 'Most In-Demand Jobs in India for 2026',
    metaTitle: 'Most In-Demand Jobs in India for 2026 | Top Career Guide',
    metaDescription:
      'Explore the most in-demand jobs in India for 2026, the skills each role needs, and how to prepare for a future-proof, high-paying career.',
    primaryKeyword: 'Most In-Demand Jobs in India for 2026',
    category: 'Jobs in India',
    featured: true,
    readTime: '10 min read',
    sections: [
      {
        heading: 'Most In-Demand Jobs in India for 2026: What Every Job Seeker Should Know',
        paragraphs: [
          "The Indian job market in 2026 does not look like it did even three or four years ago. Degrees still matter, but they are no longer the whole story. Companies want practical skill, adaptability, and proof you can do the job on day one.",
          'Here is what is actually in demand—in plain language—and how students and freshers can prepare.',
        ],
      },
      {
        heading: 'AI and Machine Learning Are Running the Show',
        paragraphs: [
          'Companies across every sector are building AI into products and workflows. They need people who can train models, clean data, and build applications that work in the real world. Python, TensorFlow/PyTorch, NLP basics, prompt engineering, and data handling are high-value skills.',
          'Certificates alone are not enough—real project work is what gets noticed.',
        ],
      },
      {
        heading: 'Cybersecurity Is Not Optional Anymore',
        paragraphs: [
          'Hospitals, banks, e-commerce, and startups all face sophisticated threats. Cybersecurity has moved from a niche specialty to a core budget item. Network security, ethical hacking, cloud security, compliance, and incident response are strong skills to build.',
        ],
      },
      {
        heading: 'Data Scientists and Data Analysts Remain Essential',
        paragraphs: [
          'Data is the backbone of business decisions. Someone still has to ask the right questions, validate findings, and connect numbers to strategy. Python, R, SQL, statistics, and visualization tools remain essential.',
        ],
      },
      {
        heading: 'Product Managers, Digital Marketing, Cloud & Full Stack',
        paragraphs: [
          'Product managers increasingly own revenue and retention outcomes—not just feature roadmaps. Digital marketing has grown into a revenue function needing SEO, performance marketing, content strategy, and funnel design. Cloud (AWS/Azure/GCP) and full-stack development remain highly valuable across Indian startups and enterprises.',
        ],
      },
      {
        heading: 'Supply Chain and Renewable Energy',
        paragraphs: [
          'Not every in-demand role is screen-based. Supply chain leadership and renewable energy careers are growing with government push and business necessity.',
        ],
      },
      {
        heading: 'How HireKarma and DISHA Help You Get There',
        paragraphs: [
          'Knowing which jobs are hot is easy. Becoming a strong candidate is harder. HireKarma connects skill development, SolviqAI interview practice, DISHA campus placement drives, Pre-Placement Training, and Shortlisted matching—so learning leads to real opportunity, not just another certificate.',
          'On the employer side, Lakshya helps companies run faster, more transparent hiring—shrinking the gap between in-demand skills and actual offers.',
        ],
      },
      {
        heading: 'Conclusion',
        paragraphs: [
          'AI, cybersecurity, data, product, marketing, and cloud roles all point to the same shift: businesses want people who learn fast, adapt faster, and prove skills through real work. The job market rewards preparation—not panic.',
        ],
      },
    ],
    faqs: [
      {
        q: 'What is the most in-demand job in India for 2026?',
        a: 'AI and Machine Learning roles currently top the list, followed closely by cybersecurity and data science.',
      },
      {
        q: 'Do I need a computer science degree to get into these roles?',
        a: 'Not always. Many companies hire based on demonstrated skills and project work rather than the degree alone.',
      },
      {
        q: 'How can HireKarma help me get one of these jobs?',
        a: 'HireKarma supports every stage—from Skill Development and SolviqAI practice to DISHA campus drives, Pre-Placement Training, and Shortlisted matching.',
      },
      {
        q: 'Are non-tech jobs also in demand in 2026?',
        a: 'Yes. Supply chain, renewable energy, and product management are growing steadily alongside tech roles.',
      },
    ],
  },
  {
    slug: 'how-ai-is-transforming-recruitment-in-2026',
    title: 'How AI Is Transforming Recruitment in 2026',
    metaTitle: 'How AI Is Transforming Recruitment in 2026 | Hiring Trends Guide',
    metaDescription:
      'Discover how AI is transforming recruitment in 2026, from resume screening to voice agents, and how job seekers and recruiters can adapt and stay ahead.',
    primaryKeyword: 'How AI Is Transforming Recruitment in 2026',
    category: 'Recruitment',
    featured: true,
    readTime: '9 min read',
    sections: [
      {
        paragraphs: [
          'If you have applied for a job recently, an algorithm may have looked at your resume before a human did. Recruitment in 2026 looks fundamentally different from even two or three years ago—and AI is the reason.',
          'AI now helps with sourcing, screening, scheduling, success prediction, and bias flagging. For job seekers and employers, understanding this shift is part of navigating the market itself.',
        ],
      },
      {
        heading: 'From Task Automation to Full Workflow Automation',
        paragraphs: [
          'Recruitment platforms have moved toward applied and agentic AI—systems that execute entire workflows, not just keyword matching. Sourcing, screening, and scheduling can run as one continuous process, so candidates move faster without falling through tool gaps.',
        ],
      },
      {
        heading: 'AI Is Speeding Up Hiring',
        paragraphs: [
          'Industry data shows AI-powered hiring can cut time-to-hire roughly in half, with recruiters reviewing far more applications without losing quality. Companies get lower cost-per-hire; candidates wait less in the dark.',
        ],
      },
      {
        heading: 'Generative AI and Voice Agents',
        paragraphs: [
          'Generative AI drafts clearer job descriptions, personalizes outreach, and simulates interview practice. AI voice agents handle early outreach, phone screens, and scheduling—especially valuable for high-volume roles.',
        ],
      },
      {
        heading: "The Recruiter's Role Is Shifting, Not Disappearing",
        paragraphs: [
          'AI handles admin and first-pass screening. Recruiters focus on judgment, relationships, and cultural fit—and need skills to manage AI tools as collaborators, not optional add-ons.',
        ],
      },
      {
        heading: 'Bias, Fairness, and Oversight',
        paragraphs: [
          'AI is only as fair as its data and design. Responsible teams audit decisions, stay transparent with candidates, and keep humans in the loop for final hires.',
        ],
      },
      {
        heading: 'What This Means If You Are Job Hunting',
        paragraphs: [
          'Build applications for both machines and humans: clear keyword-relevant skills, quantifiable achievements, and ATS-friendly formatting. Prepare before you apply—AI pipelines move fast.',
        ],
      },
      {
        heading: 'How HireKarma Fits In',
        paragraphs: [
          'SolviqAI mirrors intelligent evaluation so candidates practice with AI-driven assessments. Lakshya gives recruiters and campuses a connected hiring ecosystem. Shortlisted curates opportunities so students are not competing blindly against invisible algorithms. DISHA connects campus placement engagement so opportunity is not left to chance.',
        ],
      },
      {
        heading: 'Conclusion',
        paragraphs: [
          'AI in recruitment is the new operating model. Organizations and candidates who adapt—rather than resist—will consistently come out ahead.',
        ],
      },
    ],
    faqs: [
      {
        q: 'How is AI changing recruitment in 2026?',
        a: 'AI handles resume screening, sourcing, scheduling, and early-stage phone screening so recruiters can focus on relationships and final decisions.',
      },
      {
        q: 'Will AI replace human recruiters completely?',
        a: 'No. AI automates repetitive work, but final decisions, cultural fit, and relationship management still need human judgment.',
      },
      {
        q: 'How can job seekers prepare for AI-driven hiring?',
        a: 'Use an ATS-friendly resume, practice with AI interview simulations, and be ready to move quickly when pipelines advance.',
      },
      {
        q: 'How does HireKarma help with AI-driven recruitment?',
        a: 'SolviqAI prepares candidates with realistic AI assessments, while Lakshya and Shortlisted support efficient matching and hiring for campuses and companies.',
      },
    ],
  },
  {
    slug: 'best-career-options-after-graduation-in-2026',
    title: 'Best Career Options After Graduation in 2026',
    metaTitle: 'Best Career Options After Graduation in 2026',
    metaDescription: 'Explore the best career options after graduation in 2026, with skills, industries, and practical steps for fresh graduates in India.',
    primaryKeyword: 'Best Career Options After Graduation in 2026',
    category: 'Careers',
    featured: true,
    readTime: '6 min read',
  },
  {
    slug: 'top-skills-recruiters-are-looking-for-in-freshers',
    title: 'Top Skills Recruiters Are Looking for in Freshers',
    metaTitle: 'Top Skills Recruiters Are Looking for in Freshers',
    metaDescription: 'Learn the top technical and soft skills recruiters want from freshers in 2026—and how to show them on your resume and in interviews.',
    primaryKeyword: 'Top Skills Recruiters Are Looking for in Freshers',
    category: 'Skills',
    featured: true,
    readTime: '6 min read',
  },
  {
    slug: 'future-proof-careers-for-students-through-2030',
    title: 'Future-Proof Careers for Students: Top Opportunities Through 2030',
    metaTitle: 'Future-Proof Careers for Students Through 2030',
    metaDescription: 'Discover future-proof career paths for students through 2030, from AI and cybersecurity to green jobs and digital roles.',
    primaryKeyword: 'Future-Proof Careers for Students',
    category: 'Careers',
    featured: true,
    readTime: '7 min read',
  },
  {
    slug: 'campus-placement-preparation-guide-for-students',
    title: 'Campus Placement Preparation Guide for Students',
    metaTitle: 'Campus Placement Preparation Guide for Students',
    metaDescription: 'A practical campus placement preparation guide for students—resume, aptitude, interviews, and how to use platforms like DISHA effectively.',
    primaryKeyword: 'Campus Placement Preparation Guide for Students',
    category: 'Campus',
    featured: false,
    readTime: '7 min read',
  },
  {
    slug: 'resume-writing-tips-that-increase-interview-calls',
    title: 'Resume Writing Tips That Increase Interview Calls',
    metaTitle: 'Resume Writing Tips That Increase Interview Calls',
    metaDescription: 'Proven resume writing tips that help freshers get more interview calls, with keyword strategy and achievement-focused formatting.',
    primaryKeyword: 'Resume Writing Tips That Increase Interview Calls',
    category: 'Resume',
    featured: false,
    readTime: '5 min read',
  },
  {
    slug: 'ats-friendly-resume-format-for-freshers',
    title: 'ATS-Friendly Resume Format for Freshers',
    metaTitle: 'ATS-Friendly Resume Format for Freshers',
    metaDescription: 'Use an ATS-friendly resume format designed for freshers so your application passes screening systems and reaches recruiters.',
    primaryKeyword: 'ATS-Friendly Resume Format for Freshers',
    category: 'Resume',
    featured: false,
    readTime: '5 min read',
  },
  {
    slug: 'top-interview-questions-and-best-answers-for-freshers',
    title: 'Top Interview Questions and Best Answers for Freshers',
    metaTitle: 'Top Interview Questions and Best Answers for Freshers',
    metaDescription: 'Practice the top interview questions for freshers with strong sample answers and tips to stay confident under pressure.',
    primaryKeyword: 'Top Interview Questions and Best Answers for Freshers',
    category: 'Interview',
    featured: false,
    readTime: '8 min read',
  },
  {
    slug: 'linkedin-profile-optimization-for-job-seekers',
    title: 'LinkedIn Profile Optimization for Job Seekers',
    metaTitle: 'LinkedIn Profile Optimization for Job Seekers',
    metaDescription: 'Optimize your LinkedIn profile for job search success with headline, about section, and networking tips that attract recruiters.',
    primaryKeyword: 'LinkedIn Profile Optimization for Job Seekers',
    category: 'Job Search',
    featured: false,
    readTime: '5 min read',
  },
  {
    slug: 'highest-paying-skills-to-learn-in-2026',
    title: 'Highest Paying Skills to Learn in 2026',
    metaTitle: 'Highest Paying Skills to Learn in 2026',
    metaDescription: 'Find the highest paying skills to learn in 2026—from AI and cloud to analytics—and how to build them as a student or fresher.',
    primaryKeyword: 'Highest Paying Skills to Learn in 2026',
    category: 'Skills',
    featured: false,
    readTime: '6 min read',
  },
  {
    slug: 'digital-skills-every-student-should-learn',
    title: 'Digital Skills Every Student Should Learn',
    metaTitle: 'Digital Skills Every Student Should Learn',
    metaDescription: 'Essential digital skills every student should learn to stay employable in a skill-based hiring market.',
    primaryKeyword: 'Digital Skills Every Student Should Learn',
    category: 'Skills',
    featured: false,
    readTime: '5 min read',
  },
  {
    slug: 'best-certifications-to-get-a-job-faster',
    title: 'Best Certifications to Get a Job Faster',
    metaTitle: 'Best Certifications to Get a Job Faster',
    metaDescription: 'Best certifications that help students and freshers get hired faster, with guidance on which ones recruiters actually value.',
    primaryKeyword: 'Best Certifications to Get a Job Faster',
    category: 'Skills',
    featured: false,
    readTime: '6 min read',
  },
  {
    slug: 'top-it-jobs-for-freshers-in-india',
    title: 'Top IT Jobs for Freshers in India',
    metaTitle: 'Top IT Jobs for Freshers in India',
    metaDescription: 'Explore the top IT jobs for freshers in India, required skills, and how to prepare for campus and off-campus hiring.',
    primaryKeyword: 'Top IT Jobs for Freshers in India',
    category: 'Jobs in India',
    featured: false,
    readTime: '6 min read',
  },
  {
    slug: 'remote-job-opportunities-for-freshers-in-2026',
    title: 'Remote Job Opportunities for Freshers in 2026',
    metaTitle: 'Remote Job Opportunities for Freshers in 2026',
    metaDescription: 'Discover remote job opportunities for freshers in 2026 and how to stand out when applying to distributed teams.',
    primaryKeyword: 'Remote Job Opportunities for Freshers in 2026',
    category: 'Jobs in India',
    featured: false,
    readTime: '5 min read',
  },
  {
    slug: 'private-companies-hiring-freshers-in-india',
    title: 'Private Companies Hiring Freshers in India',
    metaTitle: 'Private Companies Hiring Freshers in India',
    metaDescription: 'Learn how private companies hire freshers in India and how to prepare for drives, assessments, and interviews.',
    primaryKeyword: 'Private Companies Hiring Freshers in India',
    category: 'Jobs in India',
    featured: false,
    readTime: '5 min read',
  },
  {
    slug: 'how-recruiters-shortlist-resumes-in-2026',
    title: 'How Recruiters Shortlist Resumes in 2026',
    metaTitle: 'How Recruiters Shortlist Resumes in 2026',
    metaDescription: 'Understand how recruiters shortlist resumes in 2026—with ATS, AI screening, and what makes a profile stand out.',
    primaryKeyword: 'How Recruiters Shortlist Resumes in 2026',
    category: 'Recruitment',
    featured: false,
    readTime: '6 min read',
  },
  {
    slug: 'skill-based-hiring-the-future-of-recruitment',
    title: 'Skill-Based Hiring: The Future of Recruitment',
    metaTitle: 'Skill-Based Hiring: The Future of Recruitment',
    metaDescription: 'Why skill-based hiring is reshaping recruitment and how students can prove job-ready skills beyond degrees.',
    primaryKeyword: 'Skill-Based Hiring: The Future of Recruitment',
    category: 'Recruitment',
    featured: false,
    readTime: '6 min read',
  },
  {
    slug: 'campus-hiring-trends-every-hr-team-should-know',
    title: 'Campus Hiring Trends Every HR Team Should Know',
    metaTitle: 'Campus Hiring Trends Every HR Team Should Know',
    metaDescription: 'Campus hiring trends HR teams should know for 2026—speed, AI screening, and better university partnerships.',
    primaryKeyword: 'Campus Hiring Trends Every HR Team Should Know',
    category: 'Campus',
    featured: false,
    readTime: '6 min read',
  },
  {
    slug: 'best-career-options-after-btech',
    title: 'Best Career Options After B.Tech',
    metaTitle: 'Best Career Options After B.Tech',
    metaDescription: 'Best career options after B.Tech—software, data, product, core engineering, and emerging tech paths.',
    primaryKeyword: 'Best Career Options After B.Tech',
    category: 'Careers',
    featured: false,
    readTime: '6 min read',
  },
  {
    slug: 'best-career-options-after-mba',
    title: 'Best Career Options After MBA',
    metaTitle: 'Best Career Options After MBA',
    metaDescription: 'Explore the best career options after MBA across product, consulting, marketing, finance, and operations.',
    primaryKeyword: 'Best Career Options After MBA',
    category: 'Careers',
    featured: false,
    readTime: '6 min read',
  },
  {
    slug: 'top-government-jobs-for-graduates-in-2026',
    title: 'Top Government Jobs for Graduates in 2026',
    metaTitle: 'Top Government Jobs for Graduates in 2026',
    metaDescription: 'Top government job paths for graduates in 2026 and how to prepare alongside private-sector opportunities.',
    primaryKeyword: 'Top Government Jobs for Graduates in 2026',
    category: 'Careers',
    featured: false,
    readTime: '6 min read',
  },
  {
    slug: 'top-ai-powered-job-roles-students-should-know-in-2026',
    title: 'Top AI-Powered Job Roles Students Should Know in 2026',
    metaTitle: 'Top AI-Powered Job Roles Students Should Know in 2026',
    metaDescription: 'Top AI-powered job roles students should know in 2026—and the skills that make you hireable for them.',
    primaryKeyword: 'Top AI-Powered Job Roles Students Should Know in 2026',
    category: 'Careers',
    featured: false,
    readTime: '6 min read',
  },
  {
    slug: 'salary-trends-for-freshers-in-2026',
    title: 'Salary Trends for Freshers in 2026',
    metaTitle: 'Salary Trends for Freshers in 2026',
    metaDescription: 'Salary trends for freshers in 2026 across key industries, plus tips to negotiate your first offer.',
    primaryKeyword: 'Salary Trends for Freshers in 2026',
    category: 'Careers',
    featured: false,
    readTime: '5 min read',
  },
  {
    slug: 'job-market-trends-every-graduate-should-know',
    title: 'Job Market Trends Every Graduate Should Know',
    metaTitle: 'Job Market Trends Every Graduate Should Know',
    metaDescription: 'Key job market trends every graduate should know before placement season and first-job applications.',
    primaryKeyword: 'Job Market Trends Every Graduate Should Know',
    category: 'Careers',
    featured: false,
    readTime: '5 min read',
  },
  {
    slug: 'soft-skills-that-improve-employability',
    title: 'Soft Skills That Improve Employability',
    metaTitle: 'Soft Skills That Improve Employability',
    metaDescription: 'Soft skills that improve employability for students and freshers—communication, adaptability, and more.',
    primaryKeyword: 'Soft Skills That Improve Employability',
    category: 'Skills',
    featured: false,
    readTime: '5 min read',
  },
  {
    slug: 'common-interview-mistakes-freshers-make',
    title: 'Common Interview Mistakes Freshers Make',
    metaTitle: 'Common Interview Mistakes Freshers Make',
    metaDescription: 'Avoid common interview mistakes freshers make and improve your shortlist-to-offer conversion.',
    primaryKeyword: 'Common Interview Mistakes Freshers Make',
    category: 'Interview',
    featured: false,
    readTime: '5 min read',
  },
  {
    slug: 'career-planning-roadmap-for-college-students',
    title: 'Career Planning Roadmap for College Students',
    metaTitle: 'Career Planning Roadmap for College Students',
    metaDescription: 'A practical career planning roadmap for college students—from skills to placements and first roles.',
    primaryKeyword: 'Career Planning Roadmap for College Students',
    category: 'Campus',
    featured: false,
    readTime: '7 min read',
  },
  {
    slug: 'how-to-get-your-first-job-without-experience',
    title: 'How to Get Your First Job Without Experience',
    metaTitle: 'How to Get Your First Job Without Experience',
    metaDescription: 'How to get your first job without experience using projects, internships, skills proof, and smart applications.',
    primaryKeyword: 'How to Get Your First Job Without Experience',
    category: 'Job Search',
    featured: false,
    readTime: '6 min read',
  },
]

export function getFeaturedBlogs(limit = 6): BlogPost[] {
  const featured = BLOGS.filter((b) => b.featured)
  if (featured.length >= limit) return featured.slice(0, limit)
  return BLOGS.slice(0, limit)
}

export function getBlogBySlug(slug: string): BlogPost | undefined {
  return BLOGS.find((b) => b.slug === slug)
}

export function getAllBlogSlugs(): string[] {
  return BLOGS.map((b) => b.slug)
}
