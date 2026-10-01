'use client'

import { CampusDrivePublicDetail } from '@/components/campus-drives/CampusDrivePublicDetail'

export default function CampusDriveSlugPage({ params }: { params: { slug: string } }) {
  return <CampusDrivePublicDetail slug={params.slug} />
}
