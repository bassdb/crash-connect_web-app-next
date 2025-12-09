'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

export default function NotFound() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div className="flex items-center justify-center px-4 py-8">
      <div className="max-w-md w-full text-center">
        {/* 404 Number with Animation */}
        <div className={`transition-all duration-1000 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <h1 className="text-6xl sm:text-8xl lg:text-9xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent mb-4">
            404
          </h1>
        </div>

        {/* Error Message */}
        <div className={`transition-all duration-1000 delay-300 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-2">
            Seite nicht gefunden
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6 sm:mb-8 leading-relaxed text-sm sm:text-base">
            Entschuldigung, die gesuchte Seite existiert nicht oder wurde verschoben.
          </p>
        </div>

        {/* Illustration */}
        <div className={`transition-all duration-1000 delay-500 ${mounted ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
          <div className="w-24 h-24 sm:w-32 sm:h-32 mx-auto mb-6 sm:mb-8 relative">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-purple-500 dark:from-blue-500 dark:to-purple-600 rounded-full opacity-20 animate-pulse"></div>
            <div className="absolute inset-2 bg-gradient-to-br from-blue-300 to-purple-400 dark:from-blue-400 dark:to-purple-500 rounded-full flex items-center justify-center">
              <svg className="w-12 h-12 sm:w-16 sm:h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.47-.881-6.08-2.33" />
              </svg>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className={`transition-all duration-1000 delay-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="space-y-3 sm:space-y-4">
            <Link 
              href="/"
              className="inline-block w-full bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-500 dark:to-purple-500 text-white font-medium py-3 px-6 rounded-lg hover:from-blue-700 hover:to-purple-700 dark:hover:from-blue-600 dark:hover:to-purple-600 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Zur Startseite
            </Link>
            
            <button 
              onClick={() => window.history.back()}
              className="w-full bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 font-medium py-3 px-6 rounded-lg border-2 border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700 transform hover:scale-105 transition-all duration-200"
            >
              Zurück zur vorherigen Seite
            </button>
          </div>
        </div>

        {/* Additional Help */}
        <div className={`transition-all duration-1000 delay-1000 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-6 sm:mt-8">
            Brauchen Sie Hilfe?{' '}
            <Link href="/kontakt" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 underline">
              Kontaktieren Sie uns
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
