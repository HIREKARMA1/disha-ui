'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, MessageSquare, AlertCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import SSOService from '@/services/ssoService';

export const SSOTestButton: React.FC = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { user, getToken } = useAuth();

    const handleTestSSO = async () => {
        setIsLoading(true);
        setError(null);

        const token = getToken();
        console.log('=== SSO Test Started ===');
        console.log('User:', user);
        console.log('Token:', token ? 'Present' : 'Missing');

        if (!user || !token) {
            setError('User not authenticated');
            setIsLoading(false);
            return;
        }

        try {
            console.log('Creating SSO service...');
            const ssoService = new SSOService(token);

            console.log('Calling redirectToSangha...');
            await ssoService.redirectToSangha();

            console.log('SSO redirect initiated successfully');
        } catch (error: any) {
            console.error('SSO Test Error:', error);
            setError(error.message || 'Failed to initiate SSO');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="p-4 border rounded-lg space-y-4">
            <div className="flex items-center space-x-2">
                <MessageSquare className="w-5 h-5 text-violet-600" />
                <h3 className="font-semibold">SSO Test</h3>
            </div>

            <div className="space-y-2">
                <p className="text-sm text-gray-600">
                    <strong>User Status:</strong> {user ? 'Authenticated' : 'Not authenticated'}
                </p>
                <p className="text-sm text-gray-600">
                    <strong>Token Status:</strong> {getToken() ? 'Present' : 'Missing'}
                </p>
                <p className="text-sm text-gray-600">
                    <strong>User Type:</strong> {user?.user_type || 'Unknown'}
                </p>
            </div>

            {error && (
                <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <AlertCircle className="w-4 h-4 text-red-600" />
                    <p className="text-sm text-red-600">{error}</p>
                </div>
            )}

            <Button
                onClick={handleTestSSO}
                disabled={isLoading || !user}
                className="w-full"
                variant="outline"
            >
                {isLoading ? (
                    <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Testing SSO...
                    </>
                ) : (
                    <>
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Test Sangha SSO
                    </>
                )}
            </Button>

            <p className="text-xs text-gray-500">
                Check the browser console for detailed logs
            </p>
        </div>
    );
};

export default SSOTestButton;
