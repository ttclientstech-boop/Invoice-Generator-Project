
import React, { useMemo } from 'react';
import { useFormContext } from 'react-hook-form';
import { InvoiceFormData } from '@/lib/schemas';

export function InvoicePreview() {
    const { watch } = useFormContext<InvoiceFormData>();
    const formData = watch(); // Watch all form data

    // Ensure items is always an array for calculations
    const items = formData.items || [];
    const { client, settings, sender } = formData;

    // Calculations (based on all items, not just page items)
    const subtotal = items.reduce((acc, item) => acc + (Number(item.price || 0) * Number(item.quantity || 1)), 0);
    const taxRate = Number(settings?.taxRate || 0);
    const taxAmount = (subtotal * taxRate) / 100;
    const discountAmount = Number(settings?.discount || 0);
    const total = subtotal + taxAmount - discountAmount;

    // Determine display currency (use first item's currency or default to USD)
    const displayCurrency = items?.[0]?.currency || 'USD';

    // --- Pagination Logic ---
    // Safe limits to ensure content fits within A4 page height (1123px)
    // These numbers are estimates and might need fine-tuning based on actual content height.
    const ITEMS_PER_FIRST_PAGE = 5; // Fewer items on first page due to header, addresses, etc.
    const ITEMS_PER_OTHER_PAGE = 10; // More items on subsequent pages

    const pages = useMemo(() => {
        if (!items || items.length === 0) {
            // If no items, return a single page with no items to render the basic invoice structure
            return [[]];
        }

        const allPages = [];
        let currentItemIndex = 0;

        // First page
        const firstPageItems = items.slice(currentItemIndex, currentItemIndex + ITEMS_PER_FIRST_PAGE);
        allPages.push(firstPageItems);
        currentItemIndex += ITEMS_PER_FIRST_PAGE;

        // Subsequent pages
        while (currentItemIndex < items.length) {
            const subsequentPageItems = items.slice(currentItemIndex, currentItemIndex + ITEMS_PER_OTHER_PAGE);
            allPages.push(subsequentPageItems);
            currentItemIndex += ITEMS_PER_OTHER_PAGE;
        }

        return allPages;
    }, [items]);

    return (
        <div className="flex flex-col gap-8 items-center bg-gray-50/50 py-8">
            {pages.map((pageItems, pageIndex) => {
                const isFirstPage = pageIndex === 0;
                const isLastPage = pageIndex === pages.length - 1;

                return (
                    <div
                        key={pageIndex}
                        id={`invoice - page - ${pageIndex} `}
                        className="invoice-page w-[794px] min-h-[1123px] bg-white p-12 shadow-lg relative flex flex-col justify-between"
                        // Explicitly setting width and height for consistent A4 dimensions for PDF generation
                        style={{ width: '794px', height: '1123px' }}
                    >
                        {/* Top Section: Header & Content */}
                        <div className="flex-1">

                            {/* --- HEADER (Only Page 1) --- */}
                            {isFirstPage && (
                                <>
                                    {/* Header */}
                                    <div className="flex justify-between items-start mb-16">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-4 mb-4">
                                                <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Invoice</h1>
                                                {settings?.isPaid && (
                                                    <span className="text-2xl font-bold text-slate-400 border-2 border-slate-300 px-3 py-1 rounded">
                                                        PAID
                                                    </span>
                                                )}
                                            </div>
                                            <div className="space-y-1 text-slate-500 text-sm font-medium">
                                                <p>Invoice number: <span className="text-slate-700">{settings?.invoiceNumber || 'INV-001'}</span></p>
                                                <p>Date of issue: <span className="text-slate-700">{settings?.date ? new Date(settings.date).toLocaleDateString('en-US') : '-'}</span></p>
                                                {!settings?.isPaid && (
                                                    <p>Date due: <span className="text-slate-700">{settings?.dueDate ? new Date(settings.dueDate).toLocaleDateString('en-US') : '-'}</span></p>
                                                )}
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
                                        {!settings?.isPaid && (
                                            <p className="text-slate-500 font-medium">
                                                Due date: <span className="text-slate-800">{settings?.dueDate ? new Date(settings.dueDate).toLocaleDateString('en-US') : '-'}</span>
                                            </p>
                                        )}
                                    </div>
                                </>
                            )}

                            {/* --- HEADER SPACER (Subsequent Pages) --- */}
                            {!isFirstPage && (
                                <div className="mb-8 border-b pb-4 flex justify-between items-center opacity-50">
                                    <span className="text-sm font-bold text-slate-400">Invoice {settings?.invoiceNumber || 'INV-001'}</span>
                                    <span className="text-sm font-bold text-slate-400">Page {pageIndex + 1} of {pages.length}</span>
                                </div>
                            )}

                            {/* --- TABLE --- */}
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
                                        {pageItems.map((item, index) => (
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
                                        {pageItems.length === 0 && !isFirstPage && ( // Only show "No items" if it's an empty page and not the first one (which has other content)
                                            <tr>
                                                <td colSpan={5} className="py-8 text-center text-slate-400 text-sm">No items on this page</td>
                                            </tr>
                                        )}
                                        {isFirstPage && items.length === 0 && (
                                            <tr>
                                                <td colSpan={5} className="py-8 text-center text-slate-400 text-sm">No items added</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* --- FOOTER (Only Last Page) --- */}
                        {isLastPage && (
                            <div className="flex justify-between items-end mt-8 border-t pt-8">

                                {/* Left: Stamp & Signature */}
                                <div className="flex flex-col items-center justify-center ml-4 md:ml-10 max-w-[200px]">
                                    {sender?.stamp && (
                                        <>
                                            <div className="w-24 h-24 relative mb-2">
                                                <img
                                                    src={sender.stamp}
                                                    alt="Company Stamp"
                                                    className="w-full h-full object-contain opacity-90 mix-blend-multiply"
                                                    style={{ transform: 'rotate(-5deg)' }} // Slight rotation for realism
                                                />
                                            </div>
                                            <p className="font-bold text-slate-800 text-sm text-center border-t border-slate-300 pt-1 w-full mt-1">
                                                {sender.name}
                                            </p>
                                            <p className="text-[10px] text-slate-500 uppercase tracking-wider">Authorized Signatory</p>
                                        </>
                                    )}
                                </div>

                                {/* Right: Totals */}
                                <div className="w-80 space-y-3">
                                    <div className="flex justify-between text-slate-600 font-medium">
                                        <span>Subtotal</span>
                                        <span>{displayCurrency} {subtotal.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-slate-600 font-medium">
                                        <span>Tax ({settings?.taxRate}%)</span>
                                        <span>{displayCurrency} {taxAmount.toFixed(2)}</span>
                                    </div>
                                    {discountAmount > 0 && (
                                        <div className="flex justify-between text-green-600 font-medium">
                                            <span>Discount</span>
                                            <span>- {displayCurrency} {discountAmount.toFixed(2)}</span>
                                        </div>
                                    )}
                                    <div className="border-t pt-3 mt-3 flex justify-between text-xl font-bold text-slate-800">
                                        <span>Total</span>
                                        <span>{displayCurrency} {total.toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Page Numbers Bottom */}
                        <div className="absolute bottom-4 right-8 text-[10px] text-slate-300">
                            Page {pageIndex + 1} of {pages.length}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

