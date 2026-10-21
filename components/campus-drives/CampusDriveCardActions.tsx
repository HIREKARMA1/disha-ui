'use client'

import type { MouseEvent, ReactNode } from 'react'
import Link from 'next/link'

import styles from './CampusDriveCardActions.module.css'

function ActionLink({
  href,
  className,
  children,
  onClick,
}: {
  href: string
  className: string
  children: ReactNode
  onClick?: (event: MouseEvent<HTMLAnchorElement>) => void
}) {
  if (href.startsWith('http')) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={className} onClick={onClick}>
        {children}
      </a>
    )
  }
  return (
    <Link href={href} className={className} onClick={onClick}>
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
  onDetailClick,
  onApplyClick,
}: {
  detailHref: string
  applyHref: string
  detailLabel?: string
  applyLabel?: string
  showApply?: boolean
  registerDisabled?: boolean
  onDetailClick?: (event: MouseEvent<HTMLAnchorElement>) => void
  onApplyClick?: (event: MouseEvent<HTMLAnchorElement>) => void
}) {
  return (
    <div className={`${styles.dtActions}${showApply ? '' : ` ${styles.dtActionsSingle}`}`}>
      <ActionLink href={detailHref} className={styles.dtView} onClick={onDetailClick}>
        {detailLabel}
      </ActionLink>
      {showApply ? (
        registerDisabled ? (
          <button type="button" className={styles.dtRegister} disabled>
            {applyLabel}
          </button>
        ) : (
          <ActionLink href={applyHref} className={styles.dtRegister} onClick={onApplyClick}>
            {applyLabel}
          </ActionLink>
        )
      ) : null}
    </div>
  )
}
