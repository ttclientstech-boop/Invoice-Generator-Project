import React from 'react';
import { useFormContext } from 'react-hook-form';
import { Save, Send, Download } from 'lucide-react';

export function PreviewAction({ onSave }: { onSave: () => void }) {
    const { register, watch } = useFormContext();
    const isPaid = watch('settings.isPaid');

    const handleSaveAndDownload = async () => {
        // 1. Trigger Save (Database)
        // We wrap this in a promise to ensure it fires, though onSave (handleSubmit) handles its own outcome
        try {
            await onSave();
        } catch (e) {
            console.error("Save failed", e);
        }

        // 2. Trigger Download (PDF)
        const { toPng } = await import('html-to-image');
        const jsPDF = (await import('jspdf')).default;

        const container = document.getElementById('invoice-pdf-capture-target');
        if (!container) {
            alert("Preview not found! Please ensure the preview is visible.");
            return;
        }

        // Find all page elements
        const pages = container.querySelectorAll('.invoice-page');
        if (pages.length === 0) {
            alert("No invoice pages found to generate.");
            return;
        }

        try {
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });

            for (let i = 0; i < pages.length; i++) {
                const page = pages[i] as HTMLElement;

                // Add new page for subsequent images
                if (i > 0) {
                    pdf.addPage();
                }

                // Capture page
                const imgData = await toPng(page, { quality: 0.95, backgroundColor: '#ffffff' });

                const imgProps = pdf.getImageProperties(imgData);
                const pdfWidth = pdf.internal.pageSize.getWidth();
                const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

                pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            }

            pdf.save(`invoice_${new Date().toISOString().split('T')[0]}.pdf`);
        } catch (error) {
            console.error("PDF Generation failed:", error);
            alert("Failed to generate PDF. Check console for details.");
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">

            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 mb-6">
                <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-700">Payment Due / Paid</span>
                    {/* Toggle Switch */}
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            className="sr-only peer"
                            {...register('settings.isPaid')}
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none ring-0 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                </div>
            </div>

            <div className="flex flex-col gap-4">
                <button
                    onClick={handleSaveAndDownload}
                    type="button"
                    className="flex items-center justify-center gap-2 bg-primary text-white px-6 py-4 rounded-full hover:bg-primary/90 shadow-lg hover:shadow-xl transition font-heading font-medium text-lg w-full"
                >
                    <Download size={22} /> Download & Save Invoice
                </button>

                <div className="flex gap-4">
                    <button className="flex-1 flex items-center justify-center gap-2 border border-gray-200 bg-white text-gray-700 px-6 py-4 rounded-full hover:bg-gray-50 hover:text-primary transition font-heading font-medium">
                        <Send size={20} /> Send by Email
                    </button>
                </div>
            </div>

        </div>
    );
}
