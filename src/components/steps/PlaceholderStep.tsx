import React from 'react';
import { Construction } from 'lucide-react';
import { useFormContext } from 'react-hook-form';

export function PlaceholderStep({ title }: { title: string }) {
    const { watch } = useFormContext();
    const documentType = watch('documentType');

    // Capitalize first letter
    const typeLabel = documentType.charAt(0).toUpperCase() + documentType.slice(1);

    return (
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="w-24 h-24 bg-yellow-50 rounded-full flex items-center justify-center mb-4">
                <Construction size={48} className="text-yellow-500" />
            </div>

            <div className="space-y-2 max-w-lg mx-auto">
                <h2 className="text-3xl font-bold font-heading text-neutral-800">
                    {title} Feature Coming Soon
                </h2>
                <p className="text-neutral-500 text-lg leading-relaxed">
                    We are currently building the specialized tools for <strong>{typeLabel}s</strong>.
                    <br />
                    You can still preview the generated document in the next step.
                </p>
            </div>
        </div>
    );
}
