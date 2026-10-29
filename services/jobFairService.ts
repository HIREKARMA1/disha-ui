import { apiClient } from '@/lib/api'

export type JobFairExportParams = {
  status?: string
  registration_status?: string
  application_status?: string
  source?: 'all' | 'manual' | 'disha'
  date_from?: string
  date_to?: string
}

async function downloadExport(path: string, filename: string, params: Record<string, string | undefined>) {
  const response = await apiClient.client.get(path, {
    params: Object.fromEntries(Object.entries(params).filter(([, value]) => value != null && value !== '')),
    responseType: 'blob',
  })
  const url = URL.createObjectURL(response.data)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.click()
  URL.revokeObjectURL(url)
}

export const jobFairService = {
  exportRegistrations(fairId: string, params: JobFairExportParams = {}) {
    return downloadExport(
      `/job-fairs/admin/${encodeURIComponent(fairId)}/analytics/export/registrations`,
      `job-fair-${fairId}-registrations.csv`,
      {
        status: params.registration_status || params.status,
        date_from: params.date_from,
        date_to: params.date_to,
      },
    )
  },
  exportApplicants(fairId: string, params: JobFairExportParams = {}) {
    return downloadExport(
      `/job-fairs/admin/${encodeURIComponent(fairId)}/analytics/export/applicants`,
      `job-fair-${fairId}-applicants.csv`,
      {
        status: params.application_status || params.status,
        source: params.source,
        date_from: params.date_from,
        date_to: params.date_to,
      },
    )
  },
  exportAll(fairId: string, params: JobFairExportParams = {}) {
    return downloadExport(
      `/job-fairs/admin/${encodeURIComponent(fairId)}/analytics/export/all`,
      `job-fair-${fairId}-all-data.csv`,
      {
        registration_status: params.registration_status,
        application_status: params.application_status,
        source: params.source,
        date_from: params.date_from,
        date_to: params.date_to,
      },
    )
  },
}
