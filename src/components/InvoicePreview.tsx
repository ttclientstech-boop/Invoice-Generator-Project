import React from 'react';
import { useFormContext } from 'react-hook-form';
import { InvoiceFormData } from '@/lib/schemas';

export function InvoicePreview() {
    const { watch } = useFormContext<InvoiceFormData>();
    const formData = watch(); // Watch all form data

    const { client, items, settings, sender } = formData;

    // Calculations
    const subtotal = items?.reduce((acc, item) => acc + (Number(item.price || 0) * Number(item.quantity || 1)), 0) || 0;
    const taxRate = Number(settings?.taxRate || 0);
    const taxAmount = (subtotal * taxRate) / 100;
    const discountAmount = Number(settings?.discount || 0);
    const total = subtotal + taxAmount - discountAmount;

    // Determine display currency (use first item's currency or default to USD)
    const displayCurrency = items?.[0]?.currency || 'USD';

    return (
        <div className="bg-white text-neutral-900 shadow-xl min-h-[297mm] w-[210mm] p-12 md:p-16 relative mx-auto font-sans">

            {/* Header */}
            <div className="flex justify-between items-start mb-16">
                <div className="space-y-1">
                    <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-4">Invoice</h1>
                    <div className="space-y-1 text-slate-500 text-sm font-medium">
                        <p>Invoice number: <span className="text-slate-700">{settings?.invoiceNumber || 'INV-001'}</span></p>
                        <p>Date of issue: <span className="text-slate-700">{settings?.date ? new Date(settings.date).toLocaleDateString('en-US') : '-'}</span></p>
                        <p>Date due: <span className="text-slate-700">{settings?.dueDate ? new Date(settings.dueDate).toLocaleDateString('en-US') : '-'}</span></p>
                    </div>
                </div>
                <div className="text-right">
                    {/* Logo Placeholder */}
                    {sender?.logo ? (
                        <div className="h-24 w-auto relative">
                            <img src={sender.logo} alt="Logo" className="h-full w-auto object-contain" />
                        </div>
                    ) : (
                        <div className="h-20 w-20 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400">
                            Logo
                        </div>
                    )}
                </div>
            </div>

            {/* Addresses */}
            <div className="grid grid-cols-2 gap-12 mb-16">
                {/* Sender */}
                <div className="bg-slate-50/80 p-6 rounded-2xl">
                    <p className="font-bold text-slate-900 mb-3">From</p>
                    <div className="space-y-1">
                        <p className="font-bold text-slate-800 text-sm">{sender?.name || 'Your Company Name'}</p>
                        <p className="text-slate-500 text-sm whitespace-pre-line leading-relaxed">{sender?.address || '123 Main Street\nCity, Country'}</p>
                        <p className="text-slate-500 text-sm">{sender?.email}</p>
                        {sender?.gstVatId && <p className="text-slate-500 text-sm mt-2">GST: {sender.gstVatId}</p>}
                    </div>
                </div>

                {/* Client */}
                <div className="bg-slate-50/80 p-6 rounded-2xl">
                    <p className="font-bold text-slate-900 mb-3">Bill to</p>
                    <div className="space-y-1">
                        <p className="font-bold text-slate-800 text-sm">{client?.name || 'Client Name'}</p>
                        <p className="text-slate-500 text-sm whitespace-pre-line leading-relaxed">
                            {[client?.address, client?.city, client?.state, client?.zip, client?.country].filter(Boolean).join(', ') || 'Address not provided'}
                        </p>
                        <p className="text-slate-500 text-sm">{client?.email}</p>
                        <p className="text-slate-500 text-sm">{client?.phone}</p>
                    </div>
                </div>
            </div>

            {/* Table Header & Due Date */}
            <div className="flex justify-between items-end mb-4 relative">
                <h2 className="text-xl font-bold text-slate-800">Services</h2>
                <p className="text-slate-500 font-medium">
                    Due date: <span className="text-slate-800">{settings?.dueDate ? new Date(settings.dueDate).toLocaleDateString('en-US') : '-'}</span>
                </p>

                {/* PAID Stamp - Repositioned */}
                {settings?.isPaid && (
                    <div className="absolute right-0 top-[-40px] border-[5px] border-green-500/40 text-green-500/40 font-black text-6xl uppercase tracking-widest transform -rotate-12 px-10 py-2 select-none pointer-events-none z-0 mix-blend-multiply opacity-80">
                        PAID
                    </div>
                )}
            </div>

            {/* Table */}
            <div className="border border-slate-200 rounded-xl overflow-hidden mb-12">
                <table className="w-full">
                    <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                            <th className="text-left py-4 px-6 font-semibold text-slate-500 text-xs uppercase tracking-wider w-[45%]">Description</th>
                            <th className="text-center py-4 px-6 font-semibold text-slate-500 text-xs uppercase tracking-wider">Qty</th>
                            <th className="text-right py-4 px-6 font-semibold text-slate-500 text-xs uppercase tracking-wider">Unit price</th>
                            <th className="text-right py-4 px-6 font-semibold text-slate-500 text-xs uppercase tracking-wider">Tax</th>
                            <th className="text-right py-4 px-6 font-semibold text-slate-500 text-xs uppercase tracking-wider">Amount</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {items?.map((item, index) => (
                            <tr key={index}>
                                <td className="py-5 px-6">
                                    <p className="font-bold text-slate-800 text-sm mb-1">{item.serviceCategory || 'Service'}</p>
                                    <p className="text-xs text-slate-500">{item.description}</p>
                                </td>
                                <td className="text-center py-5 px-6 text-sm font-medium text-slate-700">{Number(item.quantity || 1)}</td>
                                <td className="text-right py-5 px-6 text-sm font-medium text-slate-700">{item.currency || displayCurrency} {Number(item.price || 0).toFixed(2)}</td>
                                <td className="text-right py-5 px-6 text-sm text-slate-500">{settings?.taxRate}%</td>
                                <td className="text-right py-5 px-6 text-sm font-bold text-slate-900">{item.currency || displayCurrency} {(Number(item.price || 0) * Number(item.quantity || 1)).toFixed(2)}</td>
                            </tr>
                        ))}
                        {(!items || items.length === 0) && (
                            <tr>
                                <td colSpan={5} className="py-8 text-center text-slate-400 text-sm">No items added</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Footer Totals */}
            <div className="flex justify-end mb-16">
                <div className="w-5/12 space-y-3">
                    <div className="flex justify-between text-slate-500 text-sm">
                        <span>Subtotal</span>
                        <span className="font-medium text-slate-700">{displayCurrency} {subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-slate-500 text-sm">
                        <span>Tax ({settings?.taxRate}%)</span>
                        <span className="font-medium text-slate-700">{displayCurrency} {taxAmount.toFixed(2)}</span>
                    </div>
                    {discountAmount > 0 && (
                        <div className="flex justify-between text-slate-500 text-sm">
                            <span>Discount</span>
                            <span className="text-green-600">- {displayCurrency} {discountAmount.toFixed(2)}</span>
                        </div>
                    )}
                    <div className="flex justify-between items-center pt-4 mt-2 border-t border-slate-200">
                        <span className="font-bold text-slate-900 text-lg">Total</span>
                        <span className="font-bold text-slate-900 text-xl">{displayCurrency} {total.toFixed(2)}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
