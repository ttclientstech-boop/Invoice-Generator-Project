import React from 'react';
import { useFormContext } from 'react-hook-form';
import { Save, Send, Download } from 'lucide-react';

export function PreviewAction({ onSave }: { onSave: () => void }) {
    const { register, watch } = useFormContext();
    const isPaid = watch('settings.isPaid');

    const handleDownload = async () => {
        const { toPng } = await import('html-to-image');
        const jsPDF = (await import('jspdf')).default;

        const element = document.getElementById('invoice-preview-container');
        if (!element) {
            alert("Preview not found! Please ensure the preview is visible.");
            return;
        }

        try {
            // Using html-to-image which handles modern CSS (like Tailwind 4's oklch) better than html2canvas
            const imgData = await toPng(element, { quality: 0.95, backgroundColor: '#ffffff' });

            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });

            const imgProps = pdf.getImageProperties(imgData);
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
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
                    onClick={handleDownload}
                    type="button"
                    className="flex items-center justify-center gap-2 bg-primary text-white px-6 py-4 rounded-full hover:bg-primary/90 shadow-lg hover:shadow-xl transition font-heading font-medium"
                >
                    <Download size={20} /> Download PDF
                </button>

                <div className="flex gap-4">
                    <button onClick={onSave} className="flex-1 flex items-center justify-center gap-2 bg-gray-900 text-white px-6 py-4 rounded-full hover:bg-gray-800 transition font-heading font-medium">
                        <Save size={20} /> Store in Database
                    </button>
                    <button className="flex-1 flex items-center justify-center gap-2 border border-gray-200 bg-white text-gray-700 px-6 py-4 rounded-full hover:bg-gray-50 hover:text-primary transition font-heading font-medium">
                        <Send size={20} /> Send by Email
                    </button>
                </div>
            </div>

        </div>
    );
}
