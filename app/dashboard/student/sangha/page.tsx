'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageSquare, ExternalLink, Users, BookOpen } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import SSOService from '@/services/ssoService';
import { SSOTestButton } from '@/components/sso/SSOTestButton';

export default function SanghaPage() {
    const { user, getToken } = useAuth();

    const handleSSORedirect = async () => {
        const token = getToken();
        if (!user || !token) {
            console.error('User not authenticated');
            return;
        }

        try {
            const ssoService = new SSOService(token);
            await ssoService.redirectToSangha();
        } catch (error) {
            console.error('SSO Error:', error);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center space-x-3">
                <div className="p-3 bg-gradient-to-r from-violet-500 to-purple-600 rounded-xl">
                    <MessageSquare className="w-8 h-8 text-white" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                        Sangha Community
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Join discussions and connect with the community
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                            <Users className="w-5 h-5 text-violet-600" />
                            <span>Community Access</span>
                        </CardTitle>
                        <CardDescription>
                            Access the Sangha community platform with your existing account
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Click the button below to seamlessly access the Sangha community platform.
                            You'll be automatically logged in with your Disha account.
                        </p>
                        <Button
                            onClick={handleSSORedirect}
                            className="w-full bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700"
                            disabled={!user}
                        >
                            <MessageSquare className="w-4 h-4 mr-2" />
                            Join Sangha Community
                        </Button>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                            <BookOpen className="w-5 h-5 text-blue-600" />
                            <span>What is Sangha?</span>
                        </CardTitle>
                        <CardDescription>
                            Learn about the community platform
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-3">
                            <div className="flex items-start space-x-3">
                                <div className="w-2 h-2 bg-violet-500 rounded-full mt-2"></div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    <strong>Discussion Forums:</strong> Participate in topic-based discussions
                                </p>
                            </div>
                            <div className="flex items-start space-x-3">
                                <div className="w-2 h-2 bg-violet-500 rounded-full mt-2"></div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    <strong>Career Guidance:</strong> Get advice from industry professionals
                                </p>
                            </div>
                            <div className="flex items-start space-x-3">
                                <div className="w-2 h-2 bg-violet-500 rounded-full mt-2"></div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    <strong>Networking:</strong> Connect with peers and mentors
                                </p>
                            </div>
                            <div className="flex items-start space-x-3">
                                <div className="w-2 h-2 bg-violet-500 rounded-full mt-2"></div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    <strong>Resources:</strong> Access shared learning materials
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Quick Access</CardTitle>
                    <CardDescription>
                        You can also access Sangha directly from the sidebar navigation
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <MessageSquare className="w-6 h-6 text-violet-600" />
                        <div className="flex-1">
                            <p className="font-medium">Sangha Community</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Available in the left sidebar for quick access
                            </p>
                        </div>
                        <ExternalLink className="w-4 h-4 text-gray-400" />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Debug & Test</CardTitle>
                    <CardDescription>
                        Test the SSO integration and debug any issues
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <SSOTestButton />
                </CardContent>
            </Card>
        </div>
    );
}
