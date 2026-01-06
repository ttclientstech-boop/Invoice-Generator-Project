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

    return (
        <div className="bg-white text-neutral-900 shadow-paper min-h-[297mm] w-full p-8 md:p-12 relative scale-[0.8] origin-top-left md:scale-100 mx-auto transition-all duration-300">
            {/* Decorative top border */}
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-neutral-800 via-neutral-600 to-neutral-800"></div>
            {/* Header */}
            <div className="flex justify-between items-start mb-10">
                <div>
                    <h1 className="text-3xl font-bold text-neutral-800">Invoice</h1>
                    <p className="text-neutral-500 text-sm mt-1">Invoice number: {settings?.invoiceNumber || 'INV-001'}</p>
                    <p className="text-neutral-500 text-sm">Date of issue: {settings?.date ? new Date(settings.date).toLocaleDateString('en-US') : '-'}</p>
                    <p className="text-neutral-500 text-sm">Date due: {settings?.dueDate ? new Date(settings.dueDate).toLocaleDateString('en-US') : '-'}</p>
                </div>
                <div className="text-right">
                    {/* Logo Placeholder */}
                    {sender?.logo && <img src={sender.logo} alt="Logo" className="h-16 w-auto mb-2 ml-auto" />}
                    {!sender?.logo && <div className="h-16 w-16 bg-gray-100 mb-2 ml-auto rounded-sm" />}
                </div>
            </div>

            {/* Addresses */}
            <div className="grid grid-cols-2 gap-8 mb-10">
                {/* Sender */}
                <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="font-bold text-sm text-neutral-800 mb-1">From</p>
                    <p className="font-semibold text-neutral-700 text-sm">{sender?.name || 'Your Company Name'}</p>
                    <p className="text-neutral-500 text-xs whitespace-pre-line">{sender?.address || '123 Main Street\nCity, Country'}</p>
                    <p className="text-neutral-500 text-xs mt-1">{sender?.email}</p>
                    {sender?.gstVatId && <p className="text-neutral-500 text-xs">GST: {sender.gstVatId}</p>}
                </div>

                {/* Client */}
                <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="font-bold text-sm text-neutral-800 mb-1">Bill to</p>
                    <p className="font-semibold text-neutral-700 text-sm">{client?.name || 'Client Name'}</p>
                    <div className="text-neutral-500 text-xs mt-1 space-y-0.5">
                        <p>{client?.address || 'Street Address'}</p>
                        <p>{[client?.city, client?.state, client?.zip].filter(Boolean).join(', ') || 'City, State Zip'}</p>
                        <p>{client?.country || 'Country'}</p>
                    </div>
                    <div className="mt-2 text-neutral-500 text-xs space-y-0.5">
                        <p>{client?.email}</p>
                        <p>{client?.phone}</p>
                    </div>
                </div>
            </div>

            {/* Total Summary Header */}
            <div className="mb-8 flex justify-between items-center relative">
                <h2 className="text-xl font-bold text-neutral-800">
                    {settings?.currency} {total.toFixed(2)} {settings?.currency === 'USD' ? 'USD' : ''} due {settings?.dueDate ? new Date(settings.dueDate).toLocaleDateString('en-US') : ''}
                </h2>

                {/* PAID Stamp - visible only if settings.isPaid is true */}
                {settings?.isPaid && (
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 border-4 border-green-600 text-green-600 font-black text-6xl opacity-20 transform -rotate-12 px-4 py-1 select-none pointer-events-none z-0">
                        PAID
                    </div>
                )}
            </div>

            {/* Table */}
            <div className="border rounded-lg overflow-hidden mb-8">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                        <tr>
                            <th className="text-left py-3 px-4 font-semibold text-neutral-600 text-xs w-[40%]">Description</th>
                            <th className="text-right py-3 px-4 font-semibold text-neutral-600 text-xs">Qty</th>
                            <th className="text-right py-3 px-4 font-semibold text-neutral-600 text-xs">Unit price</th>
                            <th className="text-right py-3 px-4 font-semibold text-neutral-600 text-xs">Tax</th>
                            <th className="text-right py-3 px-4 font-semibold text-neutral-600 text-xs">Amount</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {items?.map((item, index) => (
                            <tr key={index}>
                                <td className="py-4 px-4">
                                    <p className="font-semibold text-neutral-800 text-sm">{item.serviceCategory}</p>
                                    <p className="text-xs text-neutral-500">{item.description}</p>
                                </td>
                                <td className="text-right py-4 px-4 text-sm">{Number(item.quantity || 1)}</td>
                                <td className="text-right py-4 px-4 text-sm">{settings?.currency} {Number(item.price || 0).toFixed(2)}</td>
                                <td className="text-right py-4 px-4 text-sm">{settings?.taxRate}%</td>
                                <td className="text-right py-4 px-4 text-sm font-medium">{settings?.currency} {(Number(item.price || 0) * Number(item.quantity || 1)).toFixed(2)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Footer Totals */}
            <div className="flex justify-end mb-8">
                <div className="w-1/2 space-y-2">
                    <div className="flex justify-between text-neutral-600 text-sm">
                        <span>Subtotal</span>
                        <span>{settings?.currency} {subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-neutral-600 text-sm">
                        {/* Simplified tax display for now as per image */}
                        <span>Tax ({settings?.taxRate}%)</span>
                        <span>{settings?.currency} {taxAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-neutral-600 text-sm">
                        <span>Discount</span>
                        <span>- {settings?.currency} {discountAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg pt-4 border-t border-neutral-200">
                        <span>Total</span>
                        <span>{settings?.currency} {total.toFixed(2)}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
