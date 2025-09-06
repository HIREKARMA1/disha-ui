"use client"

import { colors } from '@/lib/colors'

export function ColorPreview() {
  return (
    <div className="p-8 space-y-8">
      <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Color System Preview</h2>
      
      {/* Primary Colors */}
      <div>
        <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">Primary Colors</h3>
        <div className="grid grid-cols-10 gap-2">
          {Object.entries(colors.primary).map(([shade, color]) => (
            <div key={shade} className="text-center">
              <div 
                className="w-16 h-16 rounded-lg border border-gray-200 dark:border-gray-700 mb-2"
                style={{ backgroundColor: color }}
              />
              <p className="text-xs text-gray-600 dark:text-gray-400">{shade}</p>
              <p className="text-xs font-mono text-gray-500">{color}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Secondary Colors */}
      <div>
        <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">Secondary Colors</h3>
        <div className="grid grid-cols-10 gap-2">
          {Object.entries(colors.secondary).map(([shade, color]) => (
            <div key={shade} className="text-center">
              <div 
                className="w-16 h-16 rounded-lg border border-gray-200 dark:border-gray-700 mb-2"
                style={{ backgroundColor: color }}
              />
              <p className="text-xs text-gray-600 dark:text-gray-400">{shade}</p>
              <p className="text-xs font-mono text-gray-500">{color}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Accent Colors */}
      <div>
        <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">Accent Colors</h3>
        <div className="grid grid-cols-5 gap-6">
          {Object.entries(colors.accent).map(([name, shades]) => (
            <div key={name}>
              <h4 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-3 capitalize">{name}</h4>
              <div className="grid grid-cols-5 gap-1">
                {Object.entries(shades).map(([shade, color]) => (
                  <div key={shade} className="text-center">
                    <div 
                      className="w-8 h-8 rounded border border-gray-200 dark:border-gray-700 mb-1"
                      style={{ backgroundColor: color }}
                    />
                    <p className="text-xs text-gray-500">{shade}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Semantic Colors */}
      <div>
        <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">Semantic Colors</h3>
        <div className="grid grid-cols-4 gap-4">
          {Object.entries(colors.semantic).map(([name, color]) => (
            <div key={name} className="text-center">
              <div 
                className="w-20 h-20 rounded-lg border border-gray-200 dark:border-gray-700 mb-2"
                style={{ backgroundColor: color }}
              />
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">{name}</p>
              <p className="text-xs font-mono text-gray-500">{color}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Button Variants */}
      <div>
        <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">Button Variants</h3>
        <div className="flex flex-wrap gap-4">
          <button className="px-4 py-2 bg-primary-500 text-white rounded hover:bg-primary-600">
            Primary
          </button>
          <button className="px-4 py-2 bg-secondary-500 text-white rounded hover:bg-secondary-600">
            Secondary
          </button>
          <button className="px-4 py-2 bg-success text-white rounded hover:bg-accent-green-600">
            Success
          </button>
          <button className="px-4 py-2 bg-warning text-gray-900 rounded hover:bg-accent-yellow-600">
            Warning
          </button>
          <button className="px-4 py-2 bg-error text-white rounded hover:bg-accent-red-600">
            Error
          </button>
          <button className="px-4 py-2 bg-info text-white rounded hover:bg-secondary-600">
            Info
          </button>
        </div>
      </div>

      {/* Gradients */}
      <div>
        <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">Gradients</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="h-20 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-lg"></div>
          <div className="h-20 bg-gradient-to-r from-accent-green-500 to-accent-green-600 rounded-lg"></div>
          <div className="h-20 bg-gradient-to-r from-accent-orange-500 to-accent-orange-600 rounded-lg"></div>
        </div>
      </div>
    </div>
  )
}
