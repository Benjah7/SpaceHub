import { Shield } from 'lucide-react';

interface VerifiedBadgeProps {
    size?: 'sm' | 'md' | 'lg';
    showLabel?: boolean;
}

export const VerifiedBadge: React.FC<VerifiedBadgeProps> = ({
    size = 'md',
    showLabel = true
}) => {
    const sizes = {
        sm: 'w-4 h-4',
        md: 'w-5 h-5',
        lg: 'w-6 h-6'
    };

    return (
        <div className="inline-flex items-center gap-1 px-2 py-1 bg-brand-primary/10 text-brand-primary rounded-full">
            <Shield className={sizes[size]} />
            {showLabel && <span className="text-xs font-medium">Verified</span>}
        </div>
    );
};