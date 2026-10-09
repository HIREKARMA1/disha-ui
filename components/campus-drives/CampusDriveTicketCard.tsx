'use client'

import { useState } from 'react'
import { CampusDriveCardActions } from '@/components/campus-drives/CampusDriveCardActions'
import { montserrat } from '@/lib/fonts/montserrat'

import styles from './CampusDriveTicketCard.module.css'

export type CampusDriveCardStatus = 'live' | 'open' | 'closed'

function driveDateParts(iso?: string) {
  if (!iso?.trim()) return null
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return null
  const day = String(date.getDate())
  const month = date
    .toLocaleDateString('en-GB', { month: 'short' })
    .replace('.', '')
    .toUpperCase()
  const year = String(date.getFullYear())
  return { day, month, year }
}

function PinIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden>
      <path d="M12 21s7-6.2 7-11.5A7 7 0 0 0 5 9.5C5 14.8 12 21 12 21z" />
      <circle cx="12" cy="9.5" r="2.5" />
    </svg>
  )
}

function ClockIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  )
}

function posterInitial(title: string) {
  const t = title.trim()
  return t ? t.charAt(0).toUpperCase() : 'H'
}

export function CampusDriveTicketCard({
  brandName,
  title,
  companyLine,
  imageSrc,
  imageAlt,
  dateIso,
  locationLabel,
  locationTooltip,
  modeLabel,
  status,
  detailHref,
  applyHref,
  showApply = true,
}: {
  brandName?: string
  title: string
  companyLine?: string
  imageSrc?: string
  imageAlt?: string
  dateIso?: string
  locationLabel?: string
  locationTooltip?: string
  modeLabel?: string
  status?: CampusDriveCardStatus | null
  detailHref: string
  applyHref: string
  showApply?: boolean
}) {
  const [imgFailed, setImgFailed] = useState(false)
  const showImg = Boolean(imageSrc?.trim()) && !imgFailed
  const dateParts = driveDateParts(dateIso)
  const isOpen = status === 'live' || status === 'open'
  const registerDisabled = status === 'closed'

  const dateAria = dateParts
    ? `Drive date ${dateParts.day} ${dateParts.month} ${dateParts.year}`
    : undefined

  const companyText = companyLine?.trim() ?? ''
  const modeText = modeLabel?.trim() ?? ''
  const locationText = locationLabel?.trim() ?? ''
  const showLocationPin =
    Boolean(locationText) && locationText.toLowerCase() !== modeText.toLowerCase()
  const hasMetaRow = showLocationPin || Boolean(modeText)

  return (
    <article className={`${styles.dt} ${montserrat.className}`}>
      <div className={styles.dtImg}>
        {showImg ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageSrc}
            alt={imageAlt || `${title} poster`}
            onError={() => setImgFailed(true)}
          />
        ) : (
          <div className={styles.dtImgPlaceholder} aria-hidden>
            {posterInitial(brandName || title)}
          </div>
        )}
        {status ? (
          <span className={`${styles.dtTag} ${isOpen ? styles.dtTagOpen : ''}`}>
            {isOpen ? 'OPEN' : 'CLOSED'}
          </span>
        ) : null}
      </div>

      <div className={styles.dtRow}>
        {dateParts ? (
          <div className={styles.dtDate} aria-label={dateAria}>
            <b>{dateParts.day}</b>
            <span>{dateParts.month}</span>
            <i />
            <em>{dateParts.year}</em>
          </div>
        ) : (
          <div className={styles.dtDate} aria-hidden>
            <b>—</b>
            <span>—</span>
            <i />
            <em>—</em>
          </div>
        )}

        <div className={styles.dtInfo}>
          <h2>{title}</h2>
          {companyText ? <p className={styles.dtCo}>{companyText}</p> : null}
          {hasMetaRow ? (
            <div className={styles.dtMeta}>
              {showLocationPin ? (
                <span className={styles.dtMetaLocation}>
                  <PinIcon />
                  <span
                    className={styles.dtMetaLocationText}
                    title={locationTooltip || locationText}
                  >
                    {locationText}
                  </span>
                </span>
              ) : null}
              {modeText ? (
                <span className={styles.dtMetaMode}>
                  <ClockIcon />
                  {modeText}
                </span>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>

      <div className={styles.dtActionsWrap}>
        <CampusDriveCardActions
          detailHref={detailHref}
          applyHref={applyHref}
          showApply={showApply}
          registerDisabled={registerDisabled}
        />
      </div>
    </article>
  )
}
