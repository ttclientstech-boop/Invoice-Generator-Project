import React from 'react';
import { useFormContext } from 'react-hook-form';
import { InvoiceFormData } from '@/lib/schemas';
import { Upload } from 'lucide-react';

export function Settings() {
    const { register, setValue, formState: { errors } } = useFormContext<InvoiceFormData>();

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">

            {/* SECTION 1: Company Settings (Sender) */}
            <div className="space-y-6 bg-white rounded-2xl p-8 shadow-sm border border-gray-100 relative overflow-hidden group hover:shadow-md transition-all">
                <div className="absolute top-0 left-0 w-1.5 h-full bg-neutral-800 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <h2 className="text-xl font-bold font-heading text-neutral-800 border-b border-gray-100 pb-4 mb-2">Company Settings</h2>

                {/* Logo Upload */}
                {/* Logo Upload */}
                <div className="border-2 border-dashed border-gray-200 bg-gray-50/50 rounded-xl p-8 flex flex-col items-center justify-center text-center hover:bg-white hover:border-primary/50 transition-all cursor-pointer group/upload relative">
                    <input
                        type="file"
                        accept="image/*"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                                const reader = new FileReader();
                                reader.onloadend = () => {
                                    setValue('sender.logo', reader.result as string);
                                };
                                reader.readAsDataURL(file);
                            }
                        }}
                    />
                    <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center text-gray-400 group-hover/upload:text-primary group-hover/upload:scale-110 transition-all mb-3 pointer-events-none">
                        <Upload size={20} />
                    </div>
                    <p className="text-sm font-bold text-gray-700 group-hover/upload:text-primary transition-colors pointer-events-none">Click to Upload Logo</p>
                    <p className="text-xs text-gray-400 mt-1 pointer-events-none">Recommended: 300x150 px (PNG/JPG)</p>
                    {/* Hidden input to store the actual value */}
                    <input type="hidden" {...register('sender.logo')} />
                </div>

                <div className="space-y-4">
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-neutral-500 uppercase tracking-widest pl-1">Company Name</label>
                        <input {...register('sender.name')} className="flex h-11 w-full rounded-lg border border-gray-200 bg-gray-50/50 px-4 py-2 text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" placeholder="Your Company Name" />
                        {errors.sender?.name && <p className="text-red-500 text-xs pl-1">{errors.sender.name.message}</p>}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-neutral-500 uppercase tracking-widest pl-1">Company Email</label>
                            <input {...register('sender.email')} className="flex h-11 w-full rounded-lg border border-gray-200 bg-gray-50/50 px-4 py-2 text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" placeholder="contact@company.com" />
                            {errors.sender?.email && <p className="text-red-500 text-xs pl-1">{errors.sender.email.message}</p>}
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-neutral-500 uppercase tracking-widest pl-1">Phone Number</label>
                            <input {...register('sender.phone')} className="flex h-11 w-full rounded-lg border border-gray-200 bg-gray-50/50 px-4 py-2 text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" placeholder="+1 234 567 890" />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-neutral-500 uppercase tracking-widest pl-1">GST / Tax ID</label>
                        <input {...register('sender.gstVatId')} className="flex h-11 w-full rounded-lg border border-gray-200 bg-gray-50/50 px-4 py-2 text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" placeholder="Tax ID" />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-neutral-500 uppercase tracking-widest pl-1">Address</label>
                        <input {...register('sender.address')} className="flex h-11 w-full rounded-lg border border-gray-200 bg-gray-50/50 px-4 py-2 text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" placeholder="Company Address" />
                        {errors.sender?.address && <p className="text-red-500 text-xs pl-1">{errors.sender.address.message}</p>}
                    </div>
                </div>
            </div>

            {/* SECTION 2: Invoice Settings */}
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
                            {...register('settings.taxRate')}
                            className="flex h-11 w-full rounded-lg border border-gray-200 bg-gray-50/50 px-4 py-2 text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-neutral-500 uppercase tracking-widest pl-1">Discount</label>
                        <input
                            type="number"
                            {...register('settings.discount')}
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

        </div>
    );
}
