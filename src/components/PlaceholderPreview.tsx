import React from 'react';
import { useFormContext } from 'react-hook-form';
import { Construction } from 'lucide-react';

export function PlaceholderPreview() {
    const { watch } = useFormContext();
    const documentType = watch('documentType') || 'Document';
    const title = documentType.charAt(0).toUpperCase() + documentType.slice(1);

    return (
        <div className="w-[794px] min-h-[1123px] bg-white p-12 shadow-lg relative flex flex-col justify-center items-center">
            <div className="flex flex-col items-center justify-center p-12 border-4 border-dashed border-gray-100 rounded-3xl bg-gray-50/50">
                <div className="w-24 h-24 bg-yellow-50 rounded-full flex items-center justify-center mb-6">
                    <Construction size={48} className="text-yellow-500" />
                </div>
                <h2 className="text-3xl font-bold text-slate-800 mb-4">{title} Template</h2>
                <p className="text-slate-500 text-lg text-center max-w-md leading-relaxed">
                    The preview template for <strong>{title}s</strong> is currently under development.
                </p>
                <div className="mt-8 px-6 py-3 bg-white rounded-full border border-gray-200 shadow-sm text-sm font-medium text-slate-400">
                    Example Preview Only
                </div>
            </div>
        </div>
    );
}
