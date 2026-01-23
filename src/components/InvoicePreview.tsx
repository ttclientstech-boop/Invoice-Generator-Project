import React, { useMemo, useState, useRef, useLayoutEffect, useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { InvoiceFormData } from '@/lib/schemas';
import { cn } from '@/lib/utils';

export function InvoicePreview() {
    const { watch } = useFormContext<InvoiceFormData>();
    const formData = watch(); // Watch all form data

    // Ensure items is always an array for calculations
    const items = formData.items || [];
    const { client, settings, sender, documentType } = formData;

    const documentTitle = documentType === 'quotation' ? 'Quotation' : 'Invoice';
    const numberLabel = documentType === 'quotation' ? 'Quotation number' : 'Invoice number';

    // Calculations
    const subtotal = items.reduce((acc, item) => acc + (Number(item.price || 0) * Number(item.quantity || 1)), 0);
    const taxRate = Number(settings?.taxRate || 0);
    const taxAmount = (subtotal * taxRate) / 100;
    const discountAmount = Number(settings?.discount || 0);
    const total = subtotal + taxAmount - discountAmount;

    // Determine display currency
    const displayCurrency = items?.[0]?.currency || 'USD';

    // --- Dynamic Pagination State ---
    const [paginatedItems, setPaginatedItems] = useState<any[][]>([[]]);
    const containerRef = useRef<HTMLDivElement>(null);
    const [pageCount, setPageCount] = useState(1); // Track total pages for "Page X of Y"
    const [isMeasuring, setIsMeasuring] = useState(true);

    // Constants for A4 page (in pixels at 96 DPI)
    const PAGE_HEIGHT = 1123;
    const PADDING_TOP = 48; // p-12 = 3rem = 48px
    const PADDING_BOTTOM = 80;
    // We use safe content height. The div has p-12, so content starts at 48px and ends at 1123-48px.
    // But we need to account for "Page X of Y" footprint at the bottom if it's absolute.
    // The previous code had `bottom-4` (1rem = 16px).

    // Let's define the Safe Usable Vertical Space strictly.
    const USABLE_HEIGHT = PAGE_HEIGHT - PADDING_TOP - PADDING_BOTTOM;

    // Header Spacer Height for Pages > 1
    const HEADER_SPACER_HEIGHT = 60; // "Invoice X - Page X of Y" bar approx height

    useLayoutEffect(() => {
        if (!containerRef.current) return;

        const calculatePages = () => {
            const container = containerRef.current;
            if (!container) return;

            // 1. Measure Header (Page 1 only)
            const headerEl = container.querySelector('.measure-header') as HTMLElement;
            const headerHeight = headerEl ? headerEl.offsetHeight : 450;

            // 2. Measure Footer (Totals + Signatures)
            const footerEl = container.querySelector('.measure-footer') as HTMLElement;
            const footerHeight = footerEl ? footerEl.offsetHeight : 300;

            // 3. Measure Table Header
            const tableHeaderEl = container.querySelector('.measure-table-header') as HTMLElement;
            const tableHeaderHeight = tableHeaderEl ? tableHeaderEl.offsetHeight : 60;

            // 4. Measure Table Rows
            const rowElements = container.querySelectorAll('.measure-row');
            const rowHeights = Array.from(rowElements || []).map(el => (el as HTMLElement).offsetHeight);

            // --- Pagination Loop ---
            const newPages: any[][] = [];
            let currentPageItems: any[] = [];
            let currentHeight = 0;

            // Initial Space on Page 1
            // Space = Usable - Header - TableHeader
            // We also need some buffer for margins between sections (mb-16 etc).
            // The measured header includes its margins if we wrap it in a div with formatting.
            // We will wrap the measure-header in the same classes as the real header.
            let availableHeight = USABLE_HEIGHT - headerHeight - tableHeaderHeight;

            // Safety buffer - increased to ensure we don't accidentally overflow
            availableHeight -= 100;

            // Track if we are on page 1 or subsequent
            let isFirstPage = true;

            items.forEach((item, index) => {
                const rowHeight = rowHeights[index] || 60;

                // Check if it fits
                if (currentHeight + rowHeight > availableHeight) {
                    // Finish current page
                    newPages.push(currentPageItems);
                    currentPageItems = [];
                    currentHeight = 0;

                    // Next Page Settings
                    isFirstPage = false;
                    // New Page Space: Usable - One-time-header-spacer - TableHeader
                    availableHeight = USABLE_HEIGHT - HEADER_SPACER_HEIGHT - tableHeaderHeight - 20;
                }

                currentPageItems.push(item);
                currentHeight += rowHeight;
            });

            // Final Check: Does the Footer fit on the last page?
            // Remaining space on the current page
            let remainingSpace = availableHeight - currentHeight;

            // We need to account for the margin-top of the footer (mt-8 = 32px) + potential expansion
            // Adding specific buffer for footer margin
            const FOOTER_MARGIN = 60;

            if (remainingSpace < footerHeight + FOOTER_MARGIN) {
                // Footer doesn't fit.
                // Push current items to page.
                newPages.push(currentPageItems);
                // Create a new empty page for the footer.
                newPages.push([]);
            } else {
                // Fits.
                newPages.push(currentPageItems);
            }

            setPaginatedItems(newPages);
            setPageCount(newPages.length);
            setIsMeasuring(false);
        };

        // Delay slightly to allow fonts/images to settle? 
        // RequestAnimationFrame is good for "next paint"
        requestAnimationFrame(() => {
            calculatePages();
        });

    }, [items, settings, sender, client]);

    return (
        <div className="flex flex-col gap-8 items-center bg-gray-50/50 py-8">

            {/* --- Hidden Measurement Container --- */}
            {/* We render a COMPLETE fake page 1 to measure components in their real environment */}
            <div
                ref={containerRef}
                className="absolute left-0 top-0 opacity-0 pointer-events-none w-[794px] bg-white p-12"
                aria-hidden="true"
                style={{ visibility: 'hidden' }} // Ensure it's hidden but rendered
            >
                {/* Measure Header: Same structure as Page 1 Header */}
                <div className="measure-header pb-4">
                    {/* Header */}
                    <div className="flex justify-between items-start mb-16">
                        <div className="space-y-1">
                            <div className="flex items-center gap-4 mb-4">
                                <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">{documentTitle}</h1>
                                {settings?.isPaid && (
                                    <span className="text-2xl font-bold text-slate-400 border-2 border-slate-300 px-3 py-1 rounded">PAID</span>
                                )}
                            </div>
                            <div className="space-y-1 text-slate-500 text-sm font-medium">
                                <p>{numberLabel}: <span className="text-slate-700">{settings?.invoiceNumber || (documentType === 'quotation' ? 'QTN-001' : 'INV-001')}</span></p>
                                <p>Date of issue: <span className="text-slate-700">{settings?.date ? new Date(settings.date).toLocaleDateString('en-US') : '-'}</span></p>
                                {!settings?.isPaid && (
                                    <p>Date due: <span className="text-slate-700">{settings?.dueDate ? new Date(settings.dueDate).toLocaleDateString('en-US') : '-'}</span></p>
                                )}
                            </div>
                        </div>
                        <div className="text-right">
                            {sender?.logo ? (
                                <div className="h-24 w-auto relative">
                                    <img src={sender.logo} alt="Logo" className="h-full w-auto object-contain" />
                                </div>
                            ) : (
                                <div className="h-20 w-20 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400">Logo</div>
                            )}
                        </div>
                    </div>
                    {/* Addresses */}
                    <div className="grid grid-cols-2 gap-12 mb-16">
                        <div className="bg-slate-50/80 p-6 rounded-2xl">
                            <p className="font-bold text-slate-900 mb-3">From</p>
                            <div className="space-y-1">
                                <p className="font-bold text-slate-800 text-sm">{sender?.name || 'Your Company Name'}</p>
                                <p className="text-slate-500 text-sm whitespace-pre-line leading-relaxed">{sender?.address || '123 Main Street\nCity, Country'}</p>
                                <p className="text-slate-500 text-sm">{sender?.email}</p>
                            </div>
                        </div>
                        <div className="bg-slate-50/80 p-6 rounded-2xl">
                            {/* Client Details */}
                            <div className="text-sm text-slate-600 space-y-1">
                                <p className="font-bold text-slate-800 text-lg mb-2">Bill To:</p>
                                {client.organizationName && <p className="font-bold text-slate-700">{client.organizationName}</p>}
                                <p className="font-medium text-slate-800">{client.name}</p>
                                {client.gstVatId && <p className="text-xs">GST/VAT: {client.gstVatId}</p>}
                                {[client.address, client.city, client.state, client.zip, client.country].filter(Boolean).map((line, i) => (
                                    <p key={i}>{line}</p>
                                ))}
                                {client.phone && <p>{client.phone}</p>}
                                {client.email && <p>{client.email}</p>}
                            </div>
                        </div>
                    </div>
                    {/* Table Header Intro */}
                    <div className="flex justify-between items-end mb-4 relative">
                        <h2 className="text-xl font-bold text-slate-800">Services</h2>
                    </div>
                </div>

                {/* Measure Table Header */}
                <div className="measure-table-header">
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
                    </table>
                </div>

                {/* Measure Rows */}
                <div className="measure-rows-container">
                    <table className="w-full">
                        {/* Crucial: Maintain Column Widths for text wrapping */}
                        <thead className="opacity-0 h-0 overflow-hidden">
                            <tr>
                                <th className="w-[45%]"></th>
                                <th></th>
                                <th></th>
                                <th></th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((item, index) => (
                                <tr key={index} className="measure-row">
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
                        </tbody>
                    </table>
                </div>

                {/* Measure Footer */}
                <div className="measure-footer mt-8 pt-8">
                    {/* Totals Section - Moved Above Footer */}
                    <div className="flex justify-end mb-8">
                        <div className="w-80 space-y-3">
                            <div className="flex justify-between text-slate-600 font-medium"><span>Subtotal</span><span>0.00</span></div>
                            <div className="flex justify-between text-slate-600 font-medium"><span>Tax</span><span>0.00</span></div>
                            <div className="border-t pt-3 mt-3 flex justify-between text-xl font-bold text-slate-800"><span>Total</span><span>0.00</span></div>
                        </div>
                    </div>

                    {/* Divider */}
                    <div className="border-t border-slate-200 mb-8" />

                    {/* Footer Bottom: Bank & Signatures */}
                    <div className="flex justify-between items-end">
                        {/* Left: Bank Details */}
                        <div className="flex-1">
                            {sender?.bankDetails?.accountNumber && (
                                <div className="text-xs text-slate-600 space-y-1">
                                    <p className="font-bold text-slate-800 mb-2">Bank Details:</p>
                                    <p><span className="font-semibold">Company Name:</span> {sender.bankDetails.accountName || sender.name}</p>
                                    <p><span className="font-semibold">Bank Name:</span> {sender.bankDetails.bankName}</p>
                                    {sender.bankDetails.bankAddress && <p><span className="font-semibold">Bank Address:</span> {sender.bankDetails.bankAddress}</p>}
                                    <p><span className="font-semibold">Bank Account No:</span> {sender.bankDetails.accountNumber}</p>
                                    <p><span className="font-semibold">IFSC Code:</span> {sender.bankDetails.ifscCode}</p>
                                    {sender.bankDetails.swiftCode && <p><span className="font-semibold">Swift Code:</span> {sender.bankDetails.swiftCode}</p>}
                                </div>
                            )}
                        </div>

                        {/* Right: Stamp & Signature */}
                        <div className="flex flex-col items-center justify-center ml-10 max-w-[200px]">
                            {sender?.stamp && (
                                <div className="w-24 h-24 relative mb-2">
                                    <img src={sender.stamp} alt="Stamp" className="w-full h-full object-contain" />
                                    <p className="font-bold text-slate-800 text-sm text-center pt-1 w-full mt-1">{sender?.name}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>


            {/* --- Visible Pages --- */}
            {paginatedItems.map((pageItems, pageIndex) => {
                const isFirstPage = pageIndex === 0;
                const isLastPage = pageIndex === paginatedItems.length - 1;

                return (
                    <div
                        key={pageIndex}
                        id={`invoice-page-${pageIndex}`}
                        className="invoice-page w-[794px] min-h-[1123px] bg-white p-12 shadow-lg relative flex flex-col justify-between"
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
                                                <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">{documentTitle}</h1>
                                                {settings?.isPaid && (
                                                    <span className="text-2xl font-bold text-slate-400 border-2 border-slate-300 px-3 py-1 rounded">
                                                        PAID
                                                    </span>
                                                )}
                                            </div>
                                            <div className="space-y-1 text-slate-500 text-sm font-medium">
                                                <p>{numberLabel}: <span className="text-slate-700">{settings?.invoiceNumber || (documentType === 'quotation' ? 'QTN-001' : 'INV-001')}</span></p>
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
                                            {/* Client Details */}
                                            <div className="text-sm text-slate-600 space-y-1">
                                                <p className="font-bold text-slate-800 text-lg mb-2">Bill To:</p>
                                                {client.organizationName && <p className="font-bold text-slate-700">{client.organizationName}</p>}
                                                <p className="font-medium text-slate-800">{client.name}</p>
                                                {client.gstVatId && <p className="text-xs">GST/VAT: {client.gstVatId}</p>}
                                                {[client.address, client.city, client.state, client.zip, client.country].filter(Boolean).map((line, i) => (
                                                    <p key={i}>{line}</p>
                                                ))}
                                                {client.phone && <p>{client.phone}</p>}
                                                {client.email && <p>{client.email}</p>}
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
                                    <span className="text-sm font-bold text-slate-400">{documentTitle} {settings?.invoiceNumber || (documentType === 'quotation' ? 'QTN-001' : 'INV-001')}</span>
                                    <span className="text-sm font-bold text-slate-400">Page {pageIndex + 1} of {pageCount}</span>
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
                                        {pageItems.map((item: any, index: number) => (
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
                                        {pageItems.length === 0 && !isFirstPage && (
                                            <tr>
                                                <td colSpan={5} className="py-8 text-center text-slate-400 text-sm italic">
                                                    (Continued from previous page)
                                                </td>
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

                        {/* Footer - Only on Last Page */}
                        {
                            isLastPage && (
                                <div className="mt-8 pt-8">
                                    {/* Totals Section - Moved Above Footer */}
                                    <div className="flex justify-end mb-8">
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

                                    {/* Divider */}
                                    <div className="border-t border-slate-200 mb-8" />

                                    {/* Footer Bottom: Bank & Signatures */}
                                    <div className="flex justify-between items-end">
                                        {/* Left: Bank Details */}
                                        <div className="flex-1">
                                            {sender?.bankDetails?.accountNumber && (
                                                <div className="text-xs text-slate-600 space-y-1">
                                                    <p className="font-bold text-slate-800 mb-2">Bank Details:</p>
                                                    <p><span className="font-semibold">Company Name:</span> {sender.bankDetails.accountName || sender.name}</p>
                                                    <p><span className="font-semibold">Bank Name:</span> {sender.bankDetails.bankName}</p>
                                                    {sender.bankDetails.bankAddress && <p><span className="font-semibold">Bank Address:</span> {sender.bankDetails.bankAddress}</p>}
                                                    <p><span className="font-semibold">Bank Account No:</span> {sender.bankDetails.accountNumber}</p>
                                                    <p><span className="font-semibold">IFSC Code:</span> {sender.bankDetails.ifscCode}</p>
                                                    {sender.bankDetails.swiftCode && <p><span className="font-semibold">Swift Code:</span> {sender.bankDetails.swiftCode}</p>}
                                                </div>
                                            )}
                                        </div>

                                        {/* Right: Stamp & Signature */}
                                        <div className="flex flex-col items-center justify-center ml-10 max-w-[200px]">
                                            {sender?.stamp && (
                                                <>
                                                    <div className="w-24 h-24 relative mb-2">
                                                        <img
                                                            src={sender.stamp}
                                                            alt="Company Stamp"
                                                            className="w-full h-full object-contain opacity-90 mix-blend-multiply"
                                                            style={{ transform: 'rotate(-5deg)' }}
                                                        />
                                                    </div>
                                                    <p className="font-bold text-slate-800 text-sm text-center border-t border-slate-300 pt-1 w-full mt-1">
                                                        {sender.name}
                                                    </p>
                                                    <p className="text-[10px] text-slate-500 uppercase tracking-wider">Authorized Signatory</p>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )
                        }

                        {/* Page Numbers Bottom */}
                        <div className="absolute bottom-4 right-8 text-[10px] text-slate-300">
                            Page {pageIndex + 1} of {pageCount}
                        </div>
                    </div>
                );
            })}
        </div >
    );
}
