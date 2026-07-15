'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { AppProgressBar as ProgressBar } from 'next-nprogress-bar';

const withAuth = <P extends object>(WrappedComponent: React.ComponentType<P>) => {
    const AuthComponent = (props: P) => {
        const { user, loading } = useAuth();
        const router = useRouter();
        const pathname = usePathname();

        useEffect(() => {
            // If loading is finished and there's no user, redirect to login.
            if (!loading && !user) {
                router.push(`/login?callbackUrl=${pathname}`);
            }
        }, [user, loading, router, pathname]);

        // While loading, show a loader or return null
        if (loading) {
            return null; // Or a full-page loading spinner
        }

        // If user exists, render the wrapped component.
        if (user) {
            return <><ProgressBar height="4px" color="#4f46e5" options={{ showSpinner: false }} shallowRouting /> <WrappedComponent {...props} /></>;
        }

        return null; // Should be redirected by the useEffect
    };
    return AuthComponent;
};

export default withAuth;