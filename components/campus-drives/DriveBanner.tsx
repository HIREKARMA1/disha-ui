'use client'

import { useState } from 'react'

const BOX_RATIO = 1600 / 440

export function DriveBanner({ src, alt, focus }: { src?: string; alt: string; focus?: string }) {
  const [pos, setPos] = useState('50% 50%')

  return (
    <div className="aspect-[1600/440] w-full overflow-hidden bg-slate-100">
      {src ? (
        <img
          src={src}
          alt={alt}
          className="h-full w-full object-cover"
          style={{ objectPosition: focus ?? pos }}
          onLoad={(e) => {
            const { naturalWidth: w, naturalHeight: h } = e.currentTarget
            setPos(w / h < BOX_RATIO ? '50% 25%' : '50% 50%')
          }}
        />
      ) : (
        <div className="h-full w-full bg-gradient-to-br from-[#12356f] via-[#1a4fa0] to-sky-500" />
      )}
    </div>
  )
}
