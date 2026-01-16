import React from 'react';
import { useFormContext } from 'react-hook-form';
import { InvoiceFormData } from '@/lib/schemas';
import { FileText, FileSpreadsheet, FileCheck } from 'lucide-react';

export function DocumentTypeSelection() {
    const { register, watch, setValue, formState: { errors } } = useFormContext<InvoiceFormData>();
    const currentType = watch('documentType');

    const types = [
        {
            id: 'proposal',
            label: 'Project Proposal',
            description: 'Detailed proposal outlining project scope, timeline, and costs.',
            icon: FileSpreadsheet
        },
        {
            id: 'quotation',
            label: 'Project Quotation',
            description: 'Formal price estimate for specific services or products.',
            icon: FileText
        },
        {
            id: 'invoice',
            label: 'Project Invoice',
            description: 'Request for payment for completed work or services.',
            icon: FileCheck
        }
    ];

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                <h2 className="text-xl font-bold font-heading text-neutral-800 flex items-center gap-2">
                    <FileText size={24} className="text-primary" />
                    Select Document Type
                </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {types.map((type) => {
                    const Icon = type.icon;
                    const isSelected = currentType === type.id;

                    return (
                        <div
                            key={type.id}
                            onClick={() => setValue('documentType', type.id as any)}
                            className={`cursor-pointer rounded-2xl p-6 border-2 transition-all duration-300 relative overflow-hidden group hover:shadow-md
                                ${isSelected
                                    ? 'border-primary bg-primary/5 shadow-primary/10'
                                    : 'border-gray-100 bg-white hover:border-primary/50'
                                }`}
                        >
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-colors
                                ${isSelected ? 'bg-primary text-white' : 'bg-gray-100 text-gray-500 group-hover:bg-primary/10 group-hover:text-primary'}
                            `}>
                                <Icon size={24} />
                            </div>

                            <h3 className={`font-bold text-lg mb-2 ${isSelected ? 'text-primary' : 'text-neutral-800'}`}>
                                {type.label}
                            </h3>
                            <p className="text-sm text-neutral-500 leading-relaxed">
                                {type.description}
                            </p>

                            {/* Selection Indicator */}
                            <div className={`absolute top-4 right-4 w-4 h-4 rounded-full border-2 transition-colors
                                ${isSelected ? 'border-primary bg-primary' : 'border-gray-200'}
                            `}>
                                {isSelected && (
                                    <div className="w-2 h-2 bg-white rounded-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
            {errors.documentType && (
                <p className="text-red-500 text-sm font-medium text-center">Please select a document type to proceed.</p>
            )}
        </div>
    );
}
