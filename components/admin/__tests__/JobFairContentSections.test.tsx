import React from 'react'
import { fireEvent, render, screen, within } from '@testing-library/react'
import { JOB_FAIR_EDITOR_KEY, JobFairContentSections, type JobFairSectionState } from '../JobFairContentSections'

function Harness() {
  const [items, setItems] = React.useState<JobFairSectionState>({
    highlights: [{ [JOB_FAIR_EDITOR_KEY]: 'h1', title: 'Meet employers', description: 'Talk to hiring teams', retained: 'keep me' }],
    partners: [], testimonials: [], gallery: [], additional_sections: [],
  })
  const add = (key: keyof JobFairSectionState, defaults: Record<string, unknown>) => setItems(current => ({ ...current, [key]: [...current[key], { ...defaults, [JOB_FAIR_EDITOR_KEY]: `${key}-${Date.now()}` }] }))
  const remove = (key: keyof JobFairSectionState, editorKey: string) => setItems(current => ({ ...current, [key]: current[key].filter(item => item[JOB_FAIR_EDITOR_KEY] !== editorKey) }))
  const update = (key: keyof JobFairSectionState, editorKey: string, patch: Record<string, unknown>) => setItems(current => ({ ...current, [key]: current[key].map(item => item[JOB_FAIR_EDITOR_KEY] === editorKey ? { ...item, ...patch } : item) }))
  return <JobFairContentSections items={items} uploading={false} onAdd={add} onRemove={remove} onUpdate={update} onUpload={async () => {}}/>
}

describe('JobFairContentSections', () => {
  it('adds, edits, and removes items across each section without changing other saved item fields', () => {
    render(<Harness />)

    expect(screen.getByDisplayValue('Meet employers')).toBeTruthy()
    fireEvent.change(screen.getByDisplayValue('Meet employers'), { target: { value: 'Meet employers and founders' } })
    expect(screen.getByDisplayValue('Meet employers and founders')).toBeTruthy()

    fireEvent.click(screen.getByRole('button', { name: 'Add Program' }))
    fireEvent.click(screen.getByRole('button', { name: 'Add Partner' }))
    fireEvent.click(screen.getByRole('button', { name: 'Add Testimonial' }))
    fireEvent.click(screen.getByRole('button', { name: 'Add Image' }))
    fireEvent.click(screen.getByRole('button', { name: 'Add Section' }))

    expect(screen.getAllByLabelText('Program title')).toHaveLength(2)
    expect(screen.getByLabelText('Partner name')).toBeTruthy()
    expect(screen.getByLabelText("Person's name")).toBeTruthy()
    expect(screen.getByText('Gallery image')).toBeTruthy()
    expect(screen.getByLabelText('Section heading')).toBeTruthy()

    const programs = screen.getByRole('region', { name: 'Programs in Job Fair' })
    const removeButtons = within(programs).getAllByRole('button', { name: 'Remove' })
    fireEvent.click(removeButtons[0])
    expect(within(programs).queryByDisplayValue('Meet employers and founders')).toBeNull()
    expect((within(programs).getByLabelText('Program title') as HTMLInputElement).value).toBe('')
  })
})
