'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, MessageSquare, FileText, GraduationCap, LogOut, ExternalLink } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import SSOService, { SSOStatus } from '@/services/ssoService';

interface SSODashboardProps {
    className?: string;
}

export const SSODashboard: React.FC<SSODashboardProps> = ({ className }) => {
    const [ssoStatus, setSsoStatus] = useState<SSOStatus | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [loadingService, setLoadingService] = useState<string | null>(null);
    const { user, getToken } = useAuth();
    const token = getToken();

    const ssoService = token ? new SSOService(token) : null;

    useEffect(() => {
        if (ssoService) {
            loadSSOStatus();
        }
    }, [ssoService]);

    const loadSSOStatus = async () => {
        if (!ssoService) return;

        try {
            const status = await ssoService.getSSOStatus();
            setSsoStatus(status);
        } catch (error) {
            console.error('Failed to load SSO status:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSSORedirect = async (service: string) => {
        if (!ssoService) return;

        setLoadingService(service);

        try {
            switch (service) {
                case 'sangha':
                    await ssoService.redirectToSangha();
                    break;
                case 'resume_builder':
                    await ssoService.redirectToResumeBuilder();
                    break;
                case 'sadhana':
                    await ssoService.redirectToSadhana();
                    break;
                default:
                    console.error('Unknown service:', service);
            }
        } catch (error) {
            console.error(`Failed to redirect to ${service}:`, error);
        } finally {
            setLoadingService(null);
        }
    };

    const handleDisconnect = async (service: string) => {
        if (!ssoService) return;

        try {
            await ssoService.disconnectSSO(service);
            await loadSSOStatus(); // Reload status
        } catch (error) {
            console.error(`Failed to disconnect ${service}:`, error);
        }
    };

    if (!user || !token) {
        return (
            <Card className={className}>
                <CardHeader>
                    <CardTitle>SSO Integrations</CardTitle>
                    <CardDescription>Connect your accounts to access integrated services</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">Please log in to manage your SSO integrations.</p>
                </CardContent>
            </Card>
        );
    }

    if (isLoading) {
        return (
            <Card className={className}>
                <CardHeader>
                    <CardTitle>SSO Integrations</CardTitle>
                    <CardDescription>Loading your connected services...</CardDescription>
                </CardHeader>
                <CardContent className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin" />
                </CardContent>
            </Card>
        );
    }

    const services = [
        {
            id: 'sangha',
            name: 'Sangha Community',
            description: 'Join discussions and connect with the community',
            icon: MessageSquare,
            color: 'bg-blue-500',
            connected: ssoStatus?.sangha.connected || false,
            lastSync: ssoStatus?.sangha.last_sync,
            profileUrl: ssoStatus?.sangha.profile_url
        },
        {
            id: 'resume_builder',
            name: 'Resume Builder',
            description: 'Create and manage your professional resume',
            icon: FileText,
            color: 'bg-green-500',
            connected: ssoStatus?.resume_builder.connected || false,
            lastSync: ssoStatus?.resume_builder.last_sync,
            profileUrl: ssoStatus?.resume_builder.profile_url
        },
        {
            id: 'sadhana',
            name: 'Sadhana Learning',
            description: 'Access courses and track your learning progress',
            icon: GraduationCap,
            color: 'bg-purple-500',
            connected: ssoStatus?.sadhana.connected || false,
            lastSync: ssoStatus?.sadhana.last_sync,
            profileUrl: ssoStatus?.sadhana.profile_url
        }
    ];

    return (
        <Card className={className}>
            <CardHeader>
                <CardTitle>SSO Integrations</CardTitle>
                <CardDescription>
                    Connect your accounts to access integrated services seamlessly
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {services.map((service) => {
                    const Icon = service.icon;
                    const isLoading = loadingService === service.id;

                    return (
                        <div
                            key={service.id}
                            className="flex items-center justify-between p-4 border rounded-lg"
                        >
                            <div className="flex items-center space-x-4">
                                <div className={`p-2 rounded-lg ${service.color} text-white`}>
                                    <Icon className="h-5 w-5" />
                                </div>
                                <div>
                                    <h3 className="font-semibold">{service.name}</h3>
                                    <p className="text-sm text-muted-foreground">{service.description}</p>
                                    {service.connected && service.lastSync && (
                                        <p className="text-xs text-muted-foreground">
                                            Last synced: {new Date(service.lastSync).toLocaleDateString()}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center space-x-2">
                                <Badge variant={service.connected ? 'default' : 'secondary'}>
                                    {service.connected ? 'Connected' : 'Not Connected'}
                                </Badge>

                                {service.connected ? (
                                    <div className="flex space-x-2">
                                        {service.profileUrl && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => window.open(service.profileUrl!, '_blank')}
                                            >
                                                <ExternalLink className="h-4 w-4" />
                                            </Button>
                                        )}
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleDisconnect(service.id)}
                                        >
                                            <LogOut className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ) : (
                                    <Button
                                        onClick={() => handleSSORedirect(service.id)}
                                        disabled={isLoading}
                                        size="sm"
                                    >
                                        {isLoading ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            'Connect'
                                        )}
                                    </Button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </CardContent>
        </Card>
    );
};

export default SSODashboard;
