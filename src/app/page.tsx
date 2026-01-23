"use client";

import React, { useState } from 'react';
import { useForm, FormProvider, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { invoiceFormSchema, InvoiceFormData } from '@/lib/schemas';
import { createInvoice, createQuotation } from '@/app/actions';
import { InvoiceStepper } from '@/components/InvoiceStepper';
import { ClientInfo } from '@/components/steps/ClientInfo';
import { ServiceSelection } from '@/components/steps/ServiceSelection';
import { PaymentDetails } from '@/components/steps/PaymentDetails';
import { Settings } from '@/components/steps/Settings';
import { DocumentTypeSelection } from '@/components/steps/DocumentTypeSelection';
import { PreviewAction } from '@/components/steps/PreviewAction';
import { InvoicePreview } from '@/components/InvoicePreview';
import { ScalableInvoicePreview } from '@/components/ScalableInvoicePreview';
import { ChevronRight, ChevronLeft } from 'lucide-react';

import { PlaceholderStep } from '@/components/steps/PlaceholderStep';
import { PlaceholderPreview } from '@/components/PlaceholderPreview';
import { ProposalUploadStep } from '@/components/steps/ProposalUploadStep';

// ... (other imports)

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

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
      // proposalDocument: null // Not in schema but handled by un-registered watch or we can register it manually
    }
  });

  const { trigger, handleSubmit, setValue, watch, register } = methods; // Add register
  const documentType = watch('documentType');

  // Dynamic Steps Definition
  const steps = React.useMemo(() => {
    if (documentType === 'invoice') {
      return ['Company', 'Type', 'Client', 'Services', 'Payment', 'Preview'];
    } else if (documentType === 'quotation') {
      // Keeping quotation flow same as invoice for now as per previous logic, or separate?
      // User asked for "Project proposal" specifically.
      return ['Company', 'Type', 'Client', 'Services', 'Payment', 'Preview'];
    } else {
      // Proposal
      // New Flow: 0:Company -> 1:Type -> 2:Upload -> 3:Client -> 4:Details -> 5:Preview
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
          // Only set if not already set or if empty? 
          // Better to always fetch new number if switching types, 
          // but we need to be careful not to overwrite user input if they typed something manual?
          // For now, let's just set it if the field is empty or if we are switching contexts heavily.
          // Simplified: Just set it.
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
      // Validate 'savedSenders' so the UI inputs show errors (since they are bound to savedSenders)
      // Validate 'sender' because that's the actual data needed
      const isSavedValid = await trigger('savedSenders');
      const isSenderValid = await trigger('sender');
      return isSavedValid && isSenderValid;
    }
    if (stepIndex === 1) return true; // Type selection

    // Step validation logic needs to align with new indices
    if (documentType === 'invoice' || documentType === 'quotation') {
      if (stepIndex === 2) return await trigger('client');
      if (stepIndex === 3) return await trigger('items');
      if (stepIndex === 4) return await trigger('settings');
    } else {
      // Proposal Flow
      if (stepIndex === 2) {
        // Upload Step - Check if file exists if required, or just allow skip?
        // User said "1st step will be user will upload... extract all data".
        // Ideally we should block if no file, but for now let's allow proceed.
        return true;
      }
      if (stepIndex === 3) return await trigger('client');
      if (stepIndex === 4) return true; // Details/Placeholder
    }
    return true;
  };

  // ... (nextStep, prevStep, handleStepClick)

  const nextStep = async () => {
    const isValid = await validateStep(currentStep);
    if (isValid) {
      setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
      window.scrollTo(0, 0);
    } else {
      console.warn("Validation failed for step:", currentStep);
      const errors = methods.formState.errors;
      console.log("Current errors:", errors);
      // Optional: alert to help user if they don't have console open (dev only?)
      // alert("Please fix the errors in the current step.");
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
    // Validate current step before jumping forward. 
    // Ideally we should validate ALL steps between current and target, 
    // but for now validating current is standard wizard behavior.
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
        // Use separate Quotation module
        result = await createQuotation(data);
      } else {
        // Use separate Invoice module
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

  if (!mounted) return null;

  // Render Step Content
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
          <PreviewAction onSave={handleSubmit(onSubmit)} />
        </div>
      );
    } else {
      // Proposal Flow
      if (currentStep === 2) return <ProposalUploadStep />;
      if (currentStep === 3) return <ClientInfo />;
      if (currentStep === 4) return <PlaceholderStep title={'Project Proposal Details'} />;
      if (currentStep === 5) return (
        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
          <div className="lg:hidden block rounded-xl overflow-hidden shadow-sm border border-gray-200 bg-gray-50">
            <PlaceholderPreview />
          </div>
          <PreviewAction onSave={handleSubmit(onSubmit)} />
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen">
      <FormProvider {...methods}>
        {/* Top Header */}
        <div className="text-center py-10 mb-8 animate-in fade-in slide-in-from-top-4 duration-700">
          <h1 className="text-5xl font-extrabold text-neutral-800 font-heading tracking-tight mb-2 drop-shadow-sm">Document Generator</h1>
          <p className="text-neutral-500 text-lg font-medium font-body max-w-2xl mx-auto">Create professional, beautifully designed invoices, proposals, and quotations.</p>
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



