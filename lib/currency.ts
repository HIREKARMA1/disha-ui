/**
 * Indian Rupee display formatters for salary, compensation, and package UI.
 */

export function formatAmountINR(amount?: number | string | null): string {
    if (amount === undefined || amount === null || amount === '') return 'Not specified'
    const num = Number(amount)
    if (Number.isNaN(num)) return 'Not specified'
    return `₹${num.toLocaleString('en-IN')}`
}

export function formatSalaryRange(
    min?: number | string | null,
    max?: number | string | null,
    emptyLabel = 'Not specified'
): string {
    const minNum =
        min !== undefined && min !== null && min !== '' ? Number(min) : undefined
    const maxNum =
        max !== undefined && max !== null && max !== '' ? Number(max) : undefined

    const hasMin = minNum !== undefined && !Number.isNaN(minNum)
    const hasMax = maxNum !== undefined && !Number.isNaN(maxNum)

    if (!hasMin && !hasMax) return emptyLabel

    const formatNum = (n: number) => n.toLocaleString('en-IN')

    if (hasMin && hasMax) return `₹${formatNum(minNum!)} - ₹${formatNum(maxNum!)}`
    if (hasMin) return `₹${formatNum(minNum!)}+`
    if (hasMax) return `Up to ₹${formatNum(maxNum!)}`
    return emptyLabel
}

/** @deprecated Use formatSalaryRange — kept for call sites that pass currency from API (display is always INR). */
export function formatSalaryWithCurrency(
    _currency: string | undefined,
    min?: number | string | null,
    max?: number | string | null,
    emptyLabel = 'Not specified'
): string {
    return formatSalaryRange(min, max, emptyLabel)
}
