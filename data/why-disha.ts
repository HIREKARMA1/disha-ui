export type WhyDishaBenefit = {
  title: string
  description: string
}

export type WhyDishaAudience = {
  id: 'students' | 'colleges' | 'employers'
  label: string
  benefits: WhyDishaBenefit[]
}

export const WHY_DISHA = {
  title: 'Why Disha?',
  tagline: 'One Platform. From Campus to Career.',
  intro: [
    'Disha is a campus-to-career platform by HireKarma, built to bring students, colleges, placement teams, and employers together in one connected ecosystem.',
    'We created Disha to make the journey from discovering an opportunity to getting hired simpler, more transparent, and more accessible.',
    "Whether you're a student looking for your next opportunity, a college looking to strengthen placements, or an employer looking for the right talent — Disha brings everyone to the same table.",
  ],
  audiencesHeading: 'Why Do People Use Disha?',
  audiences: [
    {
      id: 'students',
      label: 'For Students',
      benefits: [
        {
          title: 'Discover More Opportunities',
          description:
            'Find jobs, career opportunities, events, and relevant opportunities in one place.',
        },
        {
          title: 'Build Your Career',
          description:
            'Access tools and resources that help you prepare, improve your profile, and become more career-ready.',
        },
        {
          title: 'Stay Connected',
          description:
            'Keep track of opportunities, applications, and your career journey without jumping between multiple platforms.',
        },
      ],
    },
    {
      id: 'colleges',
      label: 'For Colleges',
      benefits: [
        {
          title: 'Simplify Campus Recruitment',
          description:
            'Bring opportunities, students, recruiters, and placement activities into one connected platform.',
        },
        {
          title: 'Reach More Employers',
          description: 'Create stronger connections between your students and hiring organisations.',
        },
        {
          title: 'Improve Placement Outcomes',
          description:
            'Get better visibility into student engagement, applications, and recruitment activity.',
        },
      ],
    },
    {
      id: 'employers',
      label: 'For Employers',
      benefits: [
        {
          title: 'Find the Right Talent',
          description:
            'Connect with relevant student and graduate talent through a focused campus ecosystem.',
        },
        {
          title: 'Make Hiring Simpler',
          description:
            'Reduce the complexity of campus outreach, applications, shortlisting, and recruitment.',
        },
        {
          title: 'Build Your Talent Pipeline',
          description: 'Engage with emerging talent and build stronger connections with campuses.',
        },
      ],
    },
  ] as WhyDishaAudience[],
}
