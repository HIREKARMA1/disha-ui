import { apiClient } from '@/lib/api'
import type { BlogListResponse, BlogRecord, BlogWritePayload } from '@/types/blog'

class BlogService {
  async listAdmin(params: Record<string, unknown> = {}): Promise<BlogListResponse> {
    const response = await apiClient.client.get('/blogs', { params })
    return response.data
  }

  async getAdmin(id: string): Promise<BlogRecord> {
    const response = await apiClient.client.get(`/blogs/${id}`)
    return response.data
  }

  async create(data: BlogWritePayload): Promise<BlogRecord> {
    const response = await apiClient.client.post('/blogs', data)
    return response.data
  }

  async update(id: string, data: BlogWritePayload): Promise<BlogRecord> {
    const response = await apiClient.client.put(`/blogs/${id}`, data)
    return response.data
  }

  async publish(id: string): Promise<BlogRecord> {
    const response = await apiClient.client.post(`/blogs/${id}/publish`)
    return response.data
  }

  async unpublish(id: string): Promise<BlogRecord> {
    const response = await apiClient.client.post(`/blogs/${id}/unpublish`)
    return response.data
  }

  async setListing(id: string, listingStatus: 'active' | 'inactive'): Promise<BlogRecord> {
    const response = await apiClient.client.post(`/blogs/${id}/listing`, null, {
      params: { listing_status: listingStatus },
    })
    return response.data
  }

  async remove(id: string): Promise<void> {
    await apiClient.client.delete(`/blogs/${id}`)
  }

  async uploadImage(file: File, fileType: 'cover' | 'author'): Promise<{ file_url: string }> {
    const formData = new FormData()
    formData.append('file', file)
    const response = await apiClient.client.post(`/blogs/upload?file_type=${fileType}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return response.data
  }
}

export const blogService = new BlogService()

export function blogErrorMessage(err: unknown, fallback: string) {
  const data = (err as { response?: { data?: { detail?: unknown; error?: unknown } } })?.response?.data
  if (typeof data?.detail === 'string' && data.detail.trim()) return data.detail
  if (typeof data?.error === 'string' && data.error.trim()) return data.error
  return fallback
}
