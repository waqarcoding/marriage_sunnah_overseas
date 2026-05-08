import { useQuery } from '@tanstack/react-query';
import { Zap } from 'lucide-react';
import SubscriptionService from '../services/SubscriptionService';

export default function CreditsDisplay({ userId }) {
    const { data: status } = useQuery({
        queryKey: ['subscription-status', userId],
        queryFn: () => SubscriptionService.getSubscriptionStatus(userId),
        enabled: !!userId,
        select: (response) => response.data,
    });

    const badge = SubscriptionService.getStatusBadge(status);

    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '8px 16px',
            background: badge.bgColor,
            borderRadius: '12px',
        }}>
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
            }}>
                <Zap size={16} style={{ color: badge.color }} />
                <span style={{
                    fontSize: '14px',
                    fontWeight: 600,
                    color: badge.color
                }}>
                    {status?.credits || 0} Credits
                </span>
            </div>
            <div style={{
                padding: '2px 8px',
                background: badge.color,
                color: '#ffffff',
                fontSize: '10px',
                fontWeight: 700,
                borderRadius: '6px',
                textTransform: 'uppercase',
            }}>
                {badge.text}
            </div>
        </div>
    );
}