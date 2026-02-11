import { useEffect } from 'react';
import { useAuthStore } from '../stores/useAuthStore';

const TokenValidator = () => {
    const validateToken = useAuthStore((state) => state.validateToken);
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

    useEffect(() => {
        if (!isAuthenticated()) return;

        // Check immediately on mount
        validateToken();

        // Check every 30 seconds
        const interval = setInterval(() => {
            validateToken();
        }, 30000);

        return () => clearInterval(interval);
    }, [validateToken, isAuthenticated]);

    return null; // This component handles logic only, no UI
};

export default TokenValidator;
