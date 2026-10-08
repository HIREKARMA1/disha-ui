'use client'

import type { ReactNode } from 'react'
import Link from 'next/link'

import styles from './CampusDriveCardActions.module.css'

function ActionLink({
  href,
  className,
  children,
}: {
  href: string
  className: string
  children: ReactNode
}) {
  if (href.startsWith('http')) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
        {children}
      </a>
    )
  }
  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  )
}

export function CampusDriveCardActions({
  detailHref,
  applyHref,
  detailLabel = 'View Details',
  applyLabel = 'Register',
  showApply = true,
  registerDisabled = false,
}: {
  detailHref: string
  applyHref: string
  detailLabel?: string
  applyLabel?: string
  showApply?: boolean
  registerDisabled?: boolean
}) {
  return (
    <div className={`${styles.dtActions}${showApply ? '' : ` ${styles.dtActionsSingle}`}`}>
      <ActionLink href={detailHref} className={styles.dtView}>
        {detailLabel}
      </ActionLink>
      {showApply ? (
        registerDisabled ? (
          <button type="button" className={styles.dtRegister} disabled>
            {applyLabel}
          </button>
        ) : (
          <ActionLink href={applyHref} className={styles.dtRegister}>
            {applyLabel}
          </ActionLink>
        )
      ) : null}
    </div>
  )
}
