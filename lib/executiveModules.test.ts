import {
  EXECUTIVE_MODULES,
  canUseExecutiveModule,
  executiveHasModule,
  executiveModuleForPath,
} from './executiveModules'

describe('Executive module access map', () => {
  it('maps exactly the 11 requested existing Admin routes', () => {
    expect(EXECUTIVE_MODULES).toHaveLength(11)
    expect(EXECUTIVE_MODULES.map(({ key }) => key)).toEqual([
      'corporate', 'partner_logo', 'jobs', 'university_approval', 'job_request',
      'event', 'campus_drive', 'blogs', 'bulk_mail', 'bulk_whatsapp', 'support',
    ])
  })

  it('requires an explicit module assignment for Executive route access', () => {
    const executive = { user_type: 'executive', role: 'executive', permissions: { modules: ['jobs'] } }
    expect(executiveModuleForPath('/dashboard/admin/jobs/123/edit')).toBe('jobs')
    expect(canUseExecutiveModule(executive, 'jobs')).toBe(true)
    expect(canUseExecutiveModule(executive, 'support')).toBe(false)
    expect(executiveHasModule({ permissions: { modules: [] } }, 'jobs')).toBe(false)
  })
})
