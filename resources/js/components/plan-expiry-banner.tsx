import { usePage } from '@inertiajs/react';
import { AlertTriangle } from 'lucide-react';

interface PlanExpiry {
    expireDate: string;
    daysRemaining: number;
    isActive: boolean;
}

export function PlanExpiryBanner() {
    const { planExpiry } = usePage().props as { planExpiry?: PlanExpiry | null };

    if (!planExpiry || !planExpiry.isActive || planExpiry.daysRemaining > 7) {
        return null;
    }

    const isExpired = planExpiry.daysRemaining < 0;
    const formattedDate = new Date(planExpiry.expireDate).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });

    const message = isExpired
        ? `Votre abonnement a expiré le ${formattedDate}. Renouvelez-le pour continuer à utiliser toutes les fonctionnalités.`
        : planExpiry.daysRemaining === 0
            ? `Votre abonnement expire aujourd'hui (${formattedDate}).`
            : `Votre abonnement expire dans ${planExpiry.daysRemaining} jour${planExpiry.daysRemaining > 1 ? 's' : ''} (${formattedDate}).`;

    return (
        <div
            className={`flex flex-wrap items-center gap-2 border-b px-4 py-2.5 text-sm ${
                isExpired
                    ? 'border-red-200 bg-red-50 text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200'
                    : 'border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200'
            }`}
        >
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span className="flex-1">{message}</span>
            <a
                href={route('plans.index')}
                className={`shrink-0 rounded-md px-3 py-1 text-xs font-semibold text-white ${
                    isExpired ? 'bg-red-600 hover:bg-red-700' : 'bg-amber-600 hover:bg-amber-700'
                }`}
            >
                Renouveler
            </a>
        </div>
    );
}
