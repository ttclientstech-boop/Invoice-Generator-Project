"use client";

import React, { useState } from 'react';
import { useForm, FormProvider, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { invoiceFormSchema, InvoiceFormData } from '@/lib/schemas';
import { createInvoice, createQuotation, saveDraft, getDrafts, deleteDraft } from '@/app/actions';
import { InvoiceStepper } from '@/components/InvoiceStepper';
import { ClientInfo } from '@/components/steps/ClientInfo';
import { ServiceSelection } from '@/components/steps/ServiceSelection';
import { PaymentDetails } from '@/components/steps/PaymentDetails';
import { Settings } from '@/components/steps/Settings';
import { DocumentTypeSelection } from '@/components/steps/DocumentTypeSelection';
import { PreviewAction } from '@/components/steps/PreviewAction';
import { InvoicePreview } from '@/components/InvoicePreview';
import { ScalableInvoicePreview } from '@/components/ScalableInvoicePreview';
import { ChevronRight, ChevronLeft, Save, FolderOpen, Trash2, X } from 'lucide-react';

import { PlaceholderStep } from '@/components/steps/PlaceholderStep';
import { PlaceholderPreview } from '@/components/PlaceholderPreview';
import { ProposalUploadStep } from '@/components/steps/ProposalUploadStep';

export function Dashboard() {
    const [mounted, setMounted] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);

    // Draft State
    const [showDrafts, setShowDrafts] = useState(false);
    const [draftList, setDraftList] = useState<any[]>([]);
    const [currentDraftId, setCurrentDraftId] = useState<string | null>(null);
    const [isDraftLoading, setIsDraftLoading] = useState(false);

    // Prevent hydration mismatch
    React.useEffect(() => {
        setMounted(true);
    }, []);

    const methods = useForm<InvoiceFormData>({
        resolver: zodResolver(invoiceFormSchema) as any,
        mode: 'onChange',
        defaultValues: {
            documentType: 'invoice',
            sender: {
                name: '',
                email: '',
                address: '',
                phone: '',
                gstVatId: '',
                logo: '',
                stamp: '',
                bankDetails: {
                    accountName: '',
                    bankName: '',
                    bankAddress: '',
                    accountNumber: '',
                    ifscCode: '',
                    swiftCode: ''
                }
            },
            savedSenders: [],
            client: {
                name: '',
                organizationName: '',
                gstVatId: '',
                email: '',
                phone: '',
                address: '',
                city: '',
                state: '',
                zip: '',
                country: ''
            },
            items: [],
            settings: {
                invoiceNumber: '',
                date: new Date(),
                dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // +7 days default
                taxRate: 0,
                discount: 0,
                paymentTerms: '',
                notes: '',
                status: 'Draft',
                isPaid: false
            },
        }
    });

    const { trigger, handleSubmit, setValue, watch, register } = methods;
    const documentType = watch('documentType');

    // Dynamic Steps Definition
    const steps = React.useMemo(() => {
        if (documentType === 'invoice') {
            return ['Company', 'Type', 'Client', 'Services', 'Payment', 'Preview'];
        } else if (documentType === 'quotation') {
            return ['Company', 'Type', 'Client', 'Services', 'Payment', 'Preview'];
        } else {
            // Proposal
            return ['Company', 'Type', 'Upload', 'Client', 'Details', 'Preview'];
        }
    }, [documentType]);

    // Ensure valid step index when switching types
    React.useEffect(() => {
        if (currentStep >= steps.length) {
            setCurrentStep(steps.length - 1);
        }
    }, [documentType, steps.length, currentStep]);

    // Fetch initial invoice/quotation number
    React.useEffect(() => {
        let ignore = false;
        const fetchNumber = async () => {
            try {
                const type = documentType || 'invoice';
                const res = await fetch(`/api/invoices/generate-number?type=${type}`);
                const data = await res.json();

                if (!ignore && data.nextNumber) {
                    setValue('settings.invoiceNumber', data.nextNumber);
                }
            } catch (error) {
                console.error("Failed to fetch number:", error);
            }
        };

        fetchNumber();

        return () => {
            ignore = true;
        };
    }, [setValue, documentType]);

    // Helper validation function
    const validateStep = async (stepIndex: number) => {
        if (stepIndex === 0) {
            const isSavedValid = await trigger('savedSenders');
            const isSenderValid = await trigger('sender');
            return isSavedValid && isSenderValid;
        }
        if (stepIndex === 1) return true; // Type selection

        if (documentType === 'invoice' || documentType === 'quotation') {
            if (stepIndex === 2) return await trigger('client');
            if (stepIndex === 3) return await trigger('items');
            if (stepIndex === 4) return await trigger('settings');
        } else {
            if (stepIndex === 2) return true;
            if (stepIndex === 3) return await trigger('client');
            if (stepIndex === 4) return true; // Details/Placeholder
        }
        return true;
    };

    const nextStep = async () => {
        const isValid = await validateStep(currentStep);
        if (isValid) {
            setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
            window.scrollTo(0, 0);
        } else {
            console.warn("Validation failed for step:", currentStep);
            const errors = methods.formState.errors;
            console.log("Current errors:", errors);
        }
    };

    const prevStep = () => {
        setCurrentStep((prev) => Math.max(prev - 1, 0));
        window.scrollTo(0, 0);
    };

    const handleStepClick = async (index: number) => {
        if (index < currentStep) {
            setCurrentStep(index);
            return;
        }
        const isValid = await validateStep(currentStep);
        if (isValid) {
            setCurrentStep(index);
            window.scrollTo(0, 0);
        } else {
            console.warn("Cannot jump steps: Current step validation failed.");
        }
    };

    const onSubmit: SubmitHandler<InvoiceFormData> = async (data) => {
        console.log("Submitting:", data);
        try {
            let result;

            if (data.documentType === 'quotation' || data.documentType === 'proposal') {
                result = await createQuotation(data);
            } else {
                result = await createInvoice(data);
            }

            if (result.success) {
                const typeLabel = data.documentType === 'invoice' ? 'Invoice' : 'Quotation';
                alert(`${typeLabel} ${data.settings.invoiceNumber} saved successfully!`);
            } else {
                alert(`Error: ${result.error}`);
            }
        } catch (error) {
            alert("An unexpected error occurred.");
            console.error(error);
        }
    };

    // --- Draft Handlers ---

    const handleSaveDraft = async () => {
        const data = methods.getValues();
        console.log("Saving draft at step:", currentStep);
        // Basic check: at least have something? Optional
        setIsDraftLoading(true);
        try {
            const res = await saveDraft(data, currentStep, currentDraftId || undefined);
            if (res.success) {
                setCurrentDraftId(res.id);
                // alert("Draft saved successfully!"); 
                // Using a more subtle notification or just updating the UI? 
                // Alert is fine for now but maybe too intrusive if auto-saving?
                alert("Draft saved successfully!");
            } else {
                alert("Failed to save draft: " + res.error);
            }
        } catch (e) {
            console.error(e);
            alert("Error saving draft");
        } finally {
            setIsDraftLoading(false);
        }
    };

    const handleOpenDrafts = async () => {
        setIsDraftLoading(true);
        try {
            const drafts = await getDrafts();
            setDraftList(drafts);
            setShowDrafts(true);
        } catch (e) {
            console.error(e);
        } finally {
            setIsDraftLoading(false);
        }
    };

    const handleLoadDraft = (draft: any) => {
        if (confirm("Loading a draft will overwrite current form data. Continue?")) {
            console.log("Loading draft:", draft);
            // Reset form with draft data
            const { data } = draft;

            // Fix Date objects if they come back as strings
            if (data.settings?.date) data.settings.date = new Date(data.settings.date);
            if (data.settings?.dueDate) data.settings.dueDate = new Date(data.settings.dueDate);

            // Check for saved step in data (fallback for schema update issues)
            let savedStep = draft.currentStep;
            if (data.savedStep !== undefined) {
                savedStep = data.savedStep;
                delete data.savedStep; // Clean up before reset
            }

            methods.reset(data);
            setCurrentDraftId(draft._id);

            // Restore step with a slight delay to allow form reset and effects to settle
            setTimeout(() => {
                if (typeof savedStep === 'number') {
                    console.log("Restoring step to:", savedStep);
                    setCurrentStep(savedStep);
                } else {
                    console.warn("No step found in draft, resetting to 0");
                    setCurrentStep(0);
                }
                window.scrollTo(0, 0);
            }, 100);

            setShowDrafts(false);
        }
    };

    const handleDeleteDraft = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        if (confirm("Delete this draft permanently?")) {
            await deleteDraft(id);
            // Refresh list
            const drafts = await getDrafts();
            setDraftList(drafts);
        }
    };


    const handleResetForm = async () => {
        const currentData = methods.getValues();
        const startValues = {
            documentType: currentData.documentType,
            sender: currentData.sender,
            savedSenders: currentData.savedSenders,
            client: {
                name: '',
                organizationName: '',
                gstVatId: '',
                email: '',
                phone: '',
                address: '',
                city: '',
                state: '',
                zip: '',
                country: ''
            },
            items: [],
            settings: {
                invoiceNumber: '', // will update below
                date: new Date(),
                dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                taxRate: 0,
                discount: 0,
                paymentTerms: '',
                notes: '',
                status: 'Draft',
                isPaid: false,
                paidAmount: 0
            }
        };

        methods.reset(startValues as any);
        setCurrentDraftId(null);
        setCurrentStep(0);
        window.scrollTo(0, 0);

        // Fetch new number
        try {
            const type = currentData.documentType || 'invoice';
            const res = await fetch(`/api/invoices/generate-number?type=${type}`);
            const data = await res.json();
            if (data.nextNumber) {
                methods.setValue('settings.invoiceNumber', data.nextNumber);
            }
        } catch (error) {
            console.error("Failed to fetch new number:", error);
        }
    };

    if (!mounted) return null;

    const renderStepContent = () => {
        if (currentStep === 0) return <Settings />;
        if (currentStep === 1) return <DocumentTypeSelection />;

        if (documentType === 'invoice' || documentType === 'quotation') {
            if (currentStep === 2) return <ClientInfo />;
            if (currentStep === 3) return <ServiceSelection />;
            if (currentStep === 4) return <PaymentDetails />;
            if (currentStep === 5) return (
                <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                    <div className="lg:hidden block rounded-xl overflow-hidden shadow-sm border border-gray-200 bg-gray-50">
                        <ScalableInvoicePreview />
                    </div>
                    <PreviewAction onSave={handleSubmit(onSubmit)} onComplete={handleResetForm} />
                </div>
            );
        } else {
            if (currentStep === 2) return <ProposalUploadStep />;
            if (currentStep === 3) return <ClientInfo />;
            if (currentStep === 4) return <PlaceholderStep title={'Project Proposal Details'} />;
            if (currentStep === 5) return (
                <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                    <div className="lg:hidden block rounded-xl overflow-hidden shadow-sm border border-gray-200 bg-gray-50">
                        <PlaceholderPreview />
                    </div>
                    <PreviewAction onSave={handleSubmit(onSubmit)} onComplete={handleResetForm} />
                </div>
            );
        }
        return null;
    };

    return (
        <div className="min-h-screen relative">
            {/* Drafts Modal */}
            {showDrafts && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[80vh] flex flex-col overflow-hidden">
                        <div className="p-4 border-b flex justify-between items-center bg-gray-50">
                            <h3 className="font-bold text-lg text-gray-800">My Drafts</h3>
                            <button onClick={() => setShowDrafts(false)} className="p-1 hover:bg-gray-200 rounded-full transition-colors">
                                <X size={20} className="text-gray-500" />
                            </button>
                        </div>
                        <div className="overflow-y-auto p-2 space-y-2 flex-1 custom-scrollbar">
                            {draftList.length === 0 ? (
                                <div className="text-center py-8 text-gray-400">No drafts found.</div>
                            ) : (
                                draftList.map((draft) => (
                                    <div
                                        key={draft._id}
                                        onClick={() => handleLoadDraft(draft)}
                                        className="group flex items-center justify-between p-4 rounded-xl border border-gray-100 bg-white hover:border-primary/30 hover:shadow-md cursor-pointer transition-all"
                                    >
                                        <div>
                                            <p className="font-bold text-gray-800 text-sm">{draft.name}</p>
                                            <p className="text-xs text-gray-500 mt-1">Saved: {new Date(draft.updatedAt).toLocaleDateString()} {new Date(draft.updatedAt).toLocaleTimeString()}</p>
                                        </div>
                                        <button
                                            onClick={(e) => handleDeleteDraft(e, draft._id)}
                                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}

            <FormProvider {...methods}>
                {/* Top Header */}
                <div className="text-center py-10 mb-8 animate-in fade-in slide-in-from-top-4 duration-700 relative group px-4">
                    <h1 className="text-5xl font-extrabold text-neutral-800 font-heading tracking-tight mb-2 drop-shadow-sm">Document Generator</h1>
                    <p className="text-neutral-500 text-lg font-medium font-body max-w-2xl mx-auto mb-6">Create professional, beautifully designed invoices, proposals, and quotations.</p>

                    <div className="flex justify-center gap-3">
                        <button
                            type="button"
                            onClick={handleOpenDrafts}
                            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-full text-sm font-semibold text-gray-600 shadow-sm hover:shadow hover:text-primary transition-all"
                        >
                            <FolderOpen size={16} /> My Drafts
                        </button>
                    </div>

                    <button
                        onClick={async () => {
                            await fetch('/api/auth/logout', { method: 'POST' });
                            window.location.href = '/login';
                        }}
                        className="absolute top-4 right-4 md:right-8 text-xs font-bold text-white bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg shadow-sm transition-all flex items-center gap-1"
                    >
                        Logout
                    </button>
                </div>

                <div className="w-full px-4 md:px-8 lg:px-12 xl:px-16 min-h-[calc(100vh-200px)]">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start h-full pb-20">

                        {/* LEFT COLUMN: FORM WIZARD */}
                        <div className="lg:col-span-7 xl:col-span-7 space-y-8">
                            <InvoiceStepper currentStep={currentStep} steps={steps} onStepClick={handleStepClick} />

                            <div className="glass-panel rounded-3xl p-8 min-h-[600px] flex flex-col transition-all duration-300">
                                <form onSubmit={handleSubmit(onSubmit)} className="flex-1 flex flex-col">
                                    <div className="flex-1">
                                        {renderStepContent()}
                                    </div>
                                </form>
                            </div>

                            <div className="flex justify-between items-center px-2">
                                <button
                                    type="button"
                                    onClick={prevStep}
                                    disabled={currentStep === 0}
                                    className="flex items-center px-6 py-3 rounded-full font-medium text-gray-600 bg-white/50 border border-white/60 hover:bg-white hover:shadow-md hover:text-primary disabled:opacity-40 disabled:cursor-not-allowed transition-all backdrop-blur-sm"
                                >
                                    <ChevronLeft size={20} className="mr-2" /> Back
                                </button>

                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        onClick={handleSaveDraft}
                                        disabled={isDraftLoading}
                                        className="flex items-center gap-2 px-6 py-3 rounded-full font-bold text-gray-600 bg-white/50 border border-white/60 hover:bg-white hover:shadow-md hover:text-primary transition-all backdrop-blur-sm"
                                    >
                                        <Save size={18} /> {currentDraftId ? 'Update' : 'Save Draft'}
                                    </button>

                                    {currentStep < steps.length - 1 ? (
                                        <button
                                            type="button"
                                            onClick={nextStep}
                                            className="flex items-center px-10 py-3 rounded-full font-bold text-white bg-primary hover:bg-primary/90 shadow-lg hover:shadow-primary/30 hover:-translate-y-0.5 transition-all font-heading"
                                        >
                                            Next: {steps[currentStep + 1]} <ChevronRight size={20} className="ml-2" />
                                        </button>
                                    ) : null}
                                </div>
                            </div>
                        </div>

                        {/* RIGHT COLUMN: LIVE PREVIEW */}
                        <div className="lg:col-span-5 xl:col-span-5 sticky top-8 block h-[600px] lg:h-[calc(100vh-4rem)]">
                            <div className="flex flex-col h-full bg-white/30 backdrop-blur-sm rounded-3xl border border-white/40 p-6 shadow-sm">
                                <div className="mb-6 flex justify-between items-center px-2">
                                    <h3 className="font-bold text-gray-700 font-heading text-xl">Live Preview</h3>
                                    {(documentType === 'invoice' || documentType === 'quotation') && (
                                        <span className="text-xs font-bold text-primary bg-red-50 px-3 py-1 rounded-full border border-red-100 uppercase tracking-wide">
                                            #{methods.watch('settings.invoiceNumber')}
                                        </span>
                                    )}
                                </div>
                                <div className="flex-1 overflow-y-auto custom-scrollbar rounded-2xl bg-gray-100/50 inner-shadow-sm border border-black/5 p-4">
                                    <div className="min-h-full flex justify-center">
                                        {(documentType === 'invoice' || documentType === 'quotation') ? <ScalableInvoicePreview /> : <PlaceholderPreview />}
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>

                <div style={{ position: 'absolute', top: 0, left: '-9999px', width: '794px' }}>
                    <div id="invoice-pdf-capture-target">
                        {(documentType === 'invoice' || documentType === 'quotation') && <InvoicePreview />}
                    </div>
                </div>

            </FormProvider >
        </div >
    );
}
