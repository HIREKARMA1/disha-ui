export type SectionSaveResult = 'saved' | 'skipped' | 'invalid'

type SectionSaveRunner = () => Promise<SectionSaveResult>

const runners = new Map<string, SectionSaveRunner>()

/** Register a profile section's save runner (Basic / Academic / etc.). */
export function registerSectionSaveRunner(
  sectionId: string,
  runner: SectionSaveRunner
): () => void {
  runners.set(sectionId, runner)
  return () => {
    if (runners.get(sectionId) === runner) {
      runners.delete(sectionId)
    }
  }
}

/** Run a registered section save (e.g. Basic before Academic on mobile). */
export async function runSectionSave(sectionId: string): Promise<SectionSaveResult> {
  const runner = runners.get(sectionId)
  if (!runner) return 'skipped'
  return runner()
}
