'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, MessageSquare } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import SSOService from '@/services/ssoService';

interface SanghaSSOButtonProps {
    className?: string;
    variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'link' | 'destructive';
    size?: 'default' | 'sm' | 'lg' | 'icon';
    children?: React.ReactNode;
}

export const SanghaSSOButton: React.FC<SanghaSSOButtonProps> = ({
    className,
    variant = 'default',
    size = 'default',
    children
}) => {
    const [isLoading, setIsLoading] = useState(false);
    const { user, getToken } = useAuth();

    const handleSanghaSSO = async () => {
        const token = getToken();
        if (!user || !token) {
            console.error('User not authenticated');
            return;
        }

        setIsLoading(true);

        try {
            const ssoService = new SSOService(token);
            await ssoService.redirectToSangha();
        } catch (error) {
            console.error('SSO Error:', error);
            // You might want to show a toast notification here
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Button
            onClick={handleSanghaSSO}
            disabled={isLoading || !user}
            variant={variant}
            size={size}
            className={className}
        >
            {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
                <MessageSquare className="h-4 w-4" />
            )}
            {children || 'Join Community'}
        </Button>
    );
};

export default SanghaSSOButton;
