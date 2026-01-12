import React from 'react';
import { useFormContext, useFieldArray } from 'react-hook-form';
import { InvoiceFormData } from '@/lib/schemas';
import { Coins, AlertCircle } from 'lucide-react';

export function PaymentDetails() {
    const { register, control, formState: { errors } } = useFormContext<InvoiceFormData>();
    const { fields } = useFieldArray({
        control,
        name: "items"
    });

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">

            {/* SECTION 1: Item Pricing */}
            <div className="space-y-6 bg-white rounded-2xl p-8 shadow-sm border border-gray-100 relative overflow-hidden group hover:shadow-md transition-all">
                <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <h2 className="text-xl font-bold font-heading text-neutral-800 border-b border-gray-100 pb-4 mb-2 flex items-center gap-2">
                    <Coins size={20} className="text-emerald-600" />
                    Item Verification & Pricing
                </h2>

                {fields.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-neutral-500 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                        <AlertCircle size={24} className="mb-2 text-amber-500" />
                        <p className="text-sm font-medium">No items added yet.</p>
                        <p className="text-xs">Go back to Services to add items.</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {fields.map((field, index) => (
                            <div key={field.id} className="bg-gray-50/50 rounded-xl p-5 border border-gray-200 hover:border-emerald-200 hover:bg-white transition-all">
                                <div className="mb-4">
                                    <h3 className="font-bold text-neutral-800 text-sm">{field.serviceCategory}</h3>
                                    <p className="text-xs text-neutral-500 truncate">{field.description || "No description provided"}</p>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-neutral-500 uppercase tracking-widest pl-1">Quantity/Hrs</label>
                                        <input
                                            type="number"
                                            {...register(`items.${index}.quantity`, { valueAsNumber: true })}
                                            className="flex h-11 w-full rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-neutral-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                                        />
                                        {errors.items?.[index]?.quantity && <p className="text-red-500 text-xs pl-1">{errors.items[index]?.quantity?.message}</p>}
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-neutral-500 uppercase tracking-widest pl-1">Price & Currency</label>
                                        <div className="flex gap-3">
                                            <div className="w-24">
                                                <select
                                                    {...register(`items.${index}.currency`)}
                                                    className="flex h-11 w-full rounded-lg border border-gray-200 bg-white px-2 py-2 text-sm font-medium text-neutral-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all cursor-pointer"
                                                >
                                                    <option value="USD">USD</option>
                                                    <option value="EUR">EUR</option>
                                                    <option value="GBP">GBP</option>
                                                    <option value="INR">INR</option>
                                                </select>
                                            </div>
                                            <div className="relative flex-1">
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    {...register(`items.${index}.price`, { valueAsNumber: true })}
                                                    className="flex h-11 w-full rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-neutral-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                                                    placeholder="0.00"
                                                />
                                            </div>
                                        </div>
                                        {errors.items?.[index]?.price && <p className="text-red-500 text-xs pl-1">{errors.items[index]?.price?.message}</p>}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>


            {/* SECTION 2: Invoice Configuration */}
            <div className="space-y-6 bg-white rounded-2xl p-8 shadow-sm border border-gray-100 relative overflow-hidden group hover:shadow-md transition-all">
                <div className="absolute top-0 left-0 w-1.5 h-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <h2 className="text-xl font-bold font-heading text-neutral-800 border-b border-gray-100 pb-4 mb-2">Invoice Configuration</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-neutral-500 uppercase tracking-widest pl-1">Invoice Number</label>
                        <input
                            {...register('settings.invoiceNumber')}
                            placeholder="INV-2024-001"
                            className="flex h-11 w-full rounded-lg border border-gray-200 bg-gray-50/50 px-4 py-2 text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                        />
                        {errors.settings?.invoiceNumber && <p className="text-red-500 text-xs pl-1">{errors.settings.invoiceNumber.message}</p>}
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-neutral-500 uppercase tracking-widest pl-1">Date Issued</label>
                        <input
                            type="date"
                            {...register('settings.date')}
                            className="flex h-11 w-full rounded-lg border border-gray-200 bg-gray-50/50 px-4 py-2 text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-gray-600"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-neutral-500 uppercase tracking-widest pl-1">Due Date</label>
                        <input
                            type="date"
                            {...register('settings.dueDate')}
                            className="flex h-11 w-full rounded-lg border border-gray-200 bg-gray-50/50 px-4 py-2 text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-gray-600"
                        />
                        {errors.settings?.dueDate && <p className="text-red-500 text-xs pl-1">{errors.settings.dueDate.message}</p>}
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-neutral-500 uppercase tracking-widest pl-1">Tax Rate (%)</label>
                        <input
                            type="number"
                            {...register('settings.taxRate', { valueAsNumber: true })}
                            className="flex h-11 w-full rounded-lg border border-gray-200 bg-gray-50/50 px-4 py-2 text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-neutral-500 uppercase tracking-widest pl-1">Discount</label>
                        <input
                            type="number"
                            {...register('settings.discount', { valueAsNumber: true })}
                            className="flex h-11 w-full rounded-lg border border-gray-200 bg-gray-50/50 px-4 py-2 text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                        />
                    </div>

                    <div className="space-y-1.5 md:col-span-2">
                        <label className="text-xs font-bold text-neutral-500 uppercase tracking-widest pl-1">Payment Status</label>
                        <div className="flex items-center gap-3 bg-gray-50/50 p-2 rounded-lg border border-gray-200">
                            <input type="checkbox" {...register('settings.isPaid')} className="w-5 h-5 text-primary rounded border-gray-300 focus:ring-primary cursor-pointer accent-primary" />
                            <span className="text-sm font-medium text-neutral-700">Mark as Paid</span>
                        </div>
                    </div>
                </div>
            </div>
        </div >
    );
}
