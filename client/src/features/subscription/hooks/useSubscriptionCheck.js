import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import SubscriptionService from '../services/SubscriptionService';

export function useSubscriptionCheck(userId) {
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    // Fetch subscription status
    const { data: status } = useQuery({
        queryKey: ['subscription-status', userId],
        queryFn: () => SubscriptionService.getSubscriptionStatus(userId),
        enabled: !!userId,
        select: (response) => response.data,
    });

    // Prefetch subscription data in background
    useEffect(() => {
        if (userId) {
            SubscriptionService.prefetchSubscriptionData(userId, queryClient);
        }
    }, [userId, queryClient]);

    // Auto-redirect to subscription page if needed
    const checkAndRedirect = () => {
        if (status?.shouldShowSubscriptionPage) {
            navigate('/subscription');
            return true;
        }
        return false;
    };

    return {
        status,
        isPro: status?.isPro || false,
        credits: status?.credits || 0,
        isExpired: status?.isExpired || false,
        checkAndRedirect,
        hasEnoughCredits: (required = 1) =>
            SubscriptionService.hasEnoughCredits(status?.credits || 0, required)
    };
}