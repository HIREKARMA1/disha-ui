'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Home, ArrowLeft, Search } from 'lucide-react';

export default function NotFound() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
            <div className="max-w-md w-full space-y-8 text-center">
                <div>
                    <div className="mx-auto h-24 w-24 text-gray-400 dark:text-gray-600">
                        <svg
                            className="h-full w-full"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            aria-hidden="true"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1}
                                d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.47-.881-6.08-2.33M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                        </svg>
                    </div>
                    <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white">
                        Page Not Found
                    </h2>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        Sorry, we couldn't find the page you're looking for.
                    </p>
                </div>

                <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <Link href="/">
                            <Button className="w-full sm:w-auto">
                                <Home className="w-4 h-4 mr-2" />
                                Go Home
                            </Button>
                        </Link>
                        <Button
                            variant="outline"
                            onClick={() => window.history.back()}
                            className="w-full sm:w-auto"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Go Back
                        </Button>
                    </div>

                    <div className="text-center">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Or try searching for what you need
                        </p>
                        <Link href="/dashboard">
                            <Button variant="ghost" size="sm" className="mt-2">
                                <Search className="w-4 h-4 mr-2" />
                                Browse Dashboard
                            </Button>
                        </Link>
                    </div>
                </div>

                <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        Error 404 - Page not found
                    </p>
                </div>
            </div>
        </div>
    );
}
