'use client'

import { useState } from 'react'

export function CompanyLogo({ src, name }: { src?: string; name: string }) {
  const [fit, setFit] = useState<'cover' | 'contain'>('cover')
  const [broken, setBroken] = useState(!src)

  return (
    <div className="h-24 w-24 shrink-0 overflow-hidden rounded-2xl border-4 border-white bg-white shadow-md">
      {!broken && src ? (
        <img
          src={src}
          alt={`${name} logo`}
          className={fit === 'cover' ? 'h-full w-full object-cover object-center' : 'h-full w-full object-contain p-2'}
          onError={() => setBroken(true)}
          onLoad={(e) => {
            const { naturalWidth: w, naturalHeight: h } = e.currentTarget
            const r = w / h
            setFit(r > 0.8 && r < 1.25 ? 'contain' : 'cover')
          }}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-sky-50 text-3xl font-extrabold text-[#1a4fa0]">
          {name.trim()[0]?.toUpperCase()}
        </div>
      )}
    </div>
  )
}
