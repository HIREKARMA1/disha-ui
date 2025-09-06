import { ColorPreview } from '@/components/ui/color-preview'
import { Navbar } from '@/components/ui/navbar'

export default function ColorsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-secondary-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Navbar variant="solid" />
      <div className="pt-20">
        <ColorPreview />
      </div>
    </div>
  )
}
