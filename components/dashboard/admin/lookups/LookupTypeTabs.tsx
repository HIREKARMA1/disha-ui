"use client"

export interface LookupTypeTabItem {
    id: string
    label: string
    description: string
    enabled: boolean
}

interface LookupTypeTabsProps {
    items: LookupTypeTabItem[]
    activeId: string
    onChange: (id: string) => void
}

export function LookupTypeTabs({ items, activeId, onChange }: LookupTypeTabsProps) {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-2">
            <div className="flex flex-col sm:flex-row gap-2">
                {items.map((item) => {
                    const isActive = item.id === activeId
                    return (
                        <button
                            key={item.id}
                            type="button"
                            disabled={!item.enabled}
                            onClick={() => item.enabled && onChange(item.id)}
                            className={`flex-1 text-left rounded-lg px-4 py-3 transition-all duration-200 border ${
                                !item.enabled
                                    ? 'opacity-50 cursor-not-allowed border-transparent bg-gray-50 dark:bg-gray-900/40 text-gray-500'
                                    : isActive
                                      ? 'border-primary-500 bg-gradient-to-r from-primary-500 to-secondary-500 text-white shadow-md'
                                      : 'border-transparent hover:bg-gray-50 dark:hover:bg-gray-700/50 text-gray-800 dark:text-gray-200'
                            }`}
                        >
                            <div className="font-semibold text-sm">{item.label}</div>
                            <div
                                className={`text-xs mt-0.5 ${
                                    isActive && item.enabled ? 'text-white/90' : 'text-gray-600 dark:text-gray-400'
                                }`}
                            >
                                {item.description}
                            </div>
                        </button>
                    )
                })}
            </div>
        </div>
    )
}
