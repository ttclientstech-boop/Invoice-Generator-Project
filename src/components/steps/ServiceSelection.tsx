import React from 'react';
import { useFormContext, useFieldArray } from 'react-hook-form';
import { InvoiceFormData } from '@/lib/schemas';
import { Plus, Trash2, List } from 'lucide-react';

export function ServiceSelection() {
    const { register, control, formState: { errors } } = useFormContext<InvoiceFormData>();
    const { fields, append, remove } = useFieldArray({
        control,
        name: "items"
    });

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="flex justify-between items-center">
                <div className="space-y-1">
                    <h2 className="text-2xl font-bold font-heading text-neutral-800">Services & Items</h2>
                    <p className="text-sm text-neutral-500">Add the services you provided.</p>
                </div>
                <button
                    type="button"
                    onClick={() => append({
                        serviceCategory: '',
                        description: '',
                        price: 0,
                        quantity: 1,
                        currency: 'USD',
                        details: {} // Initialize empty
                    })}
                    className="flex items-center gap-2 bg-neutral-900 text-white px-5 py-2.5 rounded-full font-bold text-sm hover:bg-black hover:shadow-lg hover:-translate-y-0.5 transition-all"
                >
                    <Plus size={16} strokeWidth={3} /> Add Item
                </button>
            </div>

            <div className="space-y-4">
                {fields.map((field, index) => {


                    return (
                        <div key={field.id} className="group bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all relative">
                            <button
                                type="button"
                                onClick={() => remove(index)}
                                className="absolute top-4 right-4 text-gray-300 hover:text-red-500 p-2 rounded-full hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
                                title="Remove Item"
                            >
                                <Trash2 size={18} />
                            </button>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                {/* Category */}
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-neutral-500 uppercase tracking-widest pl-1">Category</label>
                                    <input
                                        {...register(`items.${index}.serviceCategory`)}
                                        placeholder="e.g. Web Development"
                                        className="flex h-11 w-full rounded-lg border border-gray-200 bg-gray-50/50 px-4 py-2 text-sm font-medium text-neutral-800 placeholder:text-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                    />
                                </div>

                                {/* Description */}
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-neutral-500 uppercase tracking-widest pl-1">Description</label>
                                    <input
                                        {...register(`items.${index}.description`)}
                                        placeholder="Brief description of work"
                                        className="flex h-11 w-full rounded-lg border border-gray-200 bg-gray-50/50 px-4 py-2 text-sm font-medium text-neutral-800 placeholder:text-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                    />
                                    {errors.items?.[index]?.description && <p className="text-red-500 text-xs pl-1">{errors.items[index]?.description?.message}</p>}
                                </div>
                            </div>





                        </div>
                    );
                })}

                {fields.length === 0 && (
                    <div className="text-center py-16 border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50/50 hover:bg-gray-50 transition-colors">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                            <List size={32} />
                        </div>
                        <h3 className="text-lg font-bold text-gray-700">No Items Added</h3>
                        <p className="text-gray-500 text-sm mb-6">Start by adding a service or item to this invoice.</p>
                        <button
                            type="button"
                            onClick={() => append({
                                serviceCategory: '',
                                description: '',
                                price: 0,
                                quantity: 1,
                                currency: 'USD',
                                details: {}
                            })}
                            className="inline-flex items-center gap-2 bg-white border border-gray-300 text-gray-700 px-6 py-2 rounded-full font-bold text-sm hover:bg-gray-50 hover:border-gray-400 transition-all shadow-sm"
                        >
                            <Plus size={16} /> Add First Item
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
