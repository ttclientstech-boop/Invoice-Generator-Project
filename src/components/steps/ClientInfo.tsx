import React from 'react';
import { useFormContext } from 'react-hook-form';
import { InvoiceFormData } from '@/lib/schemas';

export function ClientInfo() {
    const { register, formState: { errors } } = useFormContext<InvoiceFormData>();

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            <h2 className="text-2xl font-bold mb-4 font-heading text-neutral-800">Client Information</h2>

            <div className="space-y-6">
                {/* Header */}
                <div className="space-y-1 mb-4">
                    <h2 className="text-2xl font-bold text-neutral-800 font-heading">Client Details</h2>
                    <p className="text-sm text-neutral-500">Who is this invoice for?</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Name */}
                    <div className="space-y-1.5 md:col-span-1">
                        <label htmlFor="client.name" className="text-xs font-bold text-neutral-500 uppercase tracking-widest pl-1">Client Name</label>
                        <input
                            {...register('client.name')}
                            placeholder="e.g. Acme Corp / John Doe"
                            className="flex w-full rounded-lg border border-gray-200 bg-gray-50/50 px-4 py-3 text-sm font-medium text-neutral-800 placeholder:text-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm hover:bg-white hover:shadow-md"
                        />
                        {errors.client?.name && <p className="text-red-500 text-xs pl-1">{errors.client.name.message}</p>}
                    </div>

                    {/* Email */}
                    <div className="space-y-1.5 md:col-span-1">
                        <label htmlFor="client.email" className="text-xs font-bold text-neutral-500 uppercase tracking-widest pl-1">Email Address</label>
                        <input
                            {...register('client.email')}
                            placeholder="client@company.com"
                            className="flex w-full rounded-lg border border-gray-200 bg-gray-50/50 px-4 py-3 text-sm font-medium text-neutral-800 placeholder:text-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm hover:bg-white hover:shadow-md"
                        />
                        {errors.client?.email && <p className="text-red-500 text-xs pl-1">{errors.client.email.message}</p>}
                    </div>
                </div>

                {/* Organization & GST */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1.5 md:col-span-1">
                        <label htmlFor="client.organizationName" className="text-xs font-bold text-neutral-500 uppercase tracking-widest pl-1">Organization Name</label>
                        <input
                            {...register('client.organizationName')}
                            placeholder="Optional Organization Name"
                            className="flex w-full rounded-lg border border-gray-200 bg-gray-50/50 px-4 py-3 text-sm font-medium text-neutral-800 placeholder:text-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm hover:bg-white hover:shadow-md"
                        />
                    </div>
                    <div className="space-y-1.5 md:col-span-1">
                        <label htmlFor="client.gstVatId" className="text-xs font-bold text-neutral-500 uppercase tracking-widest pl-1">GST/VAT ID</label>
                        <input
                            {...register('client.gstVatId')}
                            placeholder="Optional Tax ID"
                            className="flex w-full rounded-lg border border-gray-200 bg-gray-50/50 px-4 py-3 text-sm font-medium text-neutral-800 placeholder:text-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm hover:bg-white hover:shadow-md"
                        />
                    </div>
                </div>

                {/* Phone & Address Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                        <label htmlFor="client.phone" className="text-xs font-bold text-neutral-500 uppercase tracking-widest pl-1">Phone Number</label>
                        <input
                            {...register('client.phone')}
                            placeholder="+1 (555) 000-0000"
                            className="flex w-full rounded-lg border border-gray-200 bg-gray-50/50 px-4 py-3 text-sm font-medium text-neutral-800 placeholder:text-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm hover:bg-white hover:shadow-md"
                        />
                        {errors.client?.phone && <p className="text-red-500 text-xs pl-1">{errors.client.phone.message}</p>}
                    </div>
                    <div className="space-y-1.5">
                        <label htmlFor="client.address" className="text-xs font-bold text-neutral-500 uppercase tracking-widest pl-1">Street Address</label>
                        <input
                            {...register('client.address')}
                            placeholder="123 Business Rd"
                            className="flex w-full rounded-lg border border-gray-200 bg-gray-50/50 px-4 py-3 text-sm font-medium text-neutral-800 placeholder:text-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm hover:bg-white hover:shadow-md"
                        />
                        {errors.client?.address && <p className="text-red-500 text-xs pl-1">{errors.client.address.message}</p>}
                    </div>
                </div>

                {/* City/State */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                        <label htmlFor="client.city" className="text-xs font-bold text-neutral-500 uppercase tracking-widest pl-1">City</label>
                        <input
                            {...register('client.city')}
                            placeholder="New York"
                            className="flex w-full rounded-lg border border-gray-200 bg-gray-50/50 px-4 py-3 text-sm font-medium text-neutral-800 placeholder:text-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm hover:bg-white hover:shadow-md"
                        />
                        {errors.client?.city && <p className="text-red-500 text-xs pl-1">{errors.client.city.message}</p>}
                    </div>

                    <div className="space-y-1.5">
                        <label htmlFor="client.state" className="text-xs font-bold text-neutral-500 uppercase tracking-widest pl-1">State / Province</label>
                        <input
                            {...register('client.state')}
                            placeholder="NY"
                            className="flex w-full rounded-lg border border-gray-200 bg-gray-50/50 px-4 py-3 text-sm font-medium text-neutral-800 placeholder:text-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm hover:bg-white hover:shadow-md"
                        />
                        {errors.client?.state && <p className="text-red-500 text-xs pl-1">{errors.client.state.message}</p>}
                    </div>
                </div>

                {/* Zip/Country */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                        <label htmlFor="client.zip" className="text-xs font-bold text-neutral-500 uppercase tracking-widest pl-1">Zip / Postal Code</label>
                        <input
                            {...register('client.zip')}
                            placeholder="10001"
                            className="flex w-full rounded-lg border border-gray-200 bg-gray-50/50 px-4 py-3 text-sm font-medium text-neutral-800 placeholder:text-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm hover:bg-white hover:shadow-md"
                        />
                        {errors.client?.zip && <p className="text-red-500 text-xs pl-1">{errors.client.zip.message}</p>}
                    </div>

                    <div className="space-y-1.5">
                        <label htmlFor="client.country" className="text-xs font-bold text-neutral-500 uppercase tracking-widest pl-1">Country</label>
                        <input
                            {...register('client.country')}
                            placeholder="United States"
                            className="flex w-full rounded-lg border border-gray-200 bg-gray-50/50 px-4 py-3 text-sm font-medium text-neutral-800 placeholder:text-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm hover:bg-white hover:shadow-md"
                        />
                        {errors.client?.country && <p className="text-red-500 text-xs pl-1">{errors.client.country.message}</p>}
                    </div>
                </div>

            </div>
        </div>
    );
}
