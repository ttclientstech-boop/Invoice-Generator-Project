"use client";

import React, { useState } from 'react';
import { useForm, FormProvider, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { InvoiceFormData, invoiceFormSchema } from '@/lib/schemas';
import { saveInvoice } from '@/app/actions';
import { InvoiceStepper } from '@/components/InvoiceStepper';
import { ClientInfo } from '@/components/steps/ClientInfo';
import { ServiceSelection } from '@/components/steps/ServiceSelection';
import { Settings } from '@/components/steps/Settings';
import { PreviewAction } from '@/components/steps/PreviewAction';
import { InvoicePreview } from '@/components/InvoicePreview';
import { ChevronRight, ChevronLeft } from 'lucide-react';

const steps = ['Client', 'Services', 'Settings', 'Preview'];

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const methods = useForm<InvoiceFormData>({
    resolver: zodResolver(invoiceFormSchema),
    mode: 'onChange',
    defaultValues: {
      sender: { name: 'Talentronaut Technologies Pvt. Ltd.', email: 'connecttalentronaut@gmail.com', address: 'Fab Lab, SRM, Bharathi Salai,\nRamapuram, Chennai, Tamil Nadu 600089', phone: '+91 82203 24802', gstVatId: '27AA...' }, // Default sender for demo
      client: {
        name: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        zip: '',
        country: 'India'
      },
      items: [{ serviceCategory: 'Web & Software Dev', description: 'Friendly Mentor Meet', price: 800, quantity: 2, currency: 'USD', details: {} }],
      settings: {
        taxRate: 18,
        discount: 0,
        status: 'Draft',
        date: new Date(),
        dueDate: new Date(new Date().setDate(new Date().getDate() + 7)), // 7 days from now
        invoiceNumber: '', // Will be populated by API
        isPaid: false
      }
    }
  });

  const { trigger, handleSubmit, setValue } = methods;

  // Fetch next invoice number on mount
  React.useEffect(() => {
    const fetchInvoiceNumber = async () => {
      try {
        const response = await fetch('/api/invoices/generate-number');
        if (response.ok) {
          const data = await response.json();
          if (data.nextNumber) {
            setValue('settings.invoiceNumber', data.nextNumber);
          }
        }
      } catch (error) {
        console.error('Failed to fetch invoice number', error);
      }
    };

    fetchInvoiceNumber();
  }, [setValue]);

  const nextStep = async () => {
    let valid = false;

    // Validate current step fields before moving
    if (currentStep === 0) valid = await trigger('client');
    else if (currentStep === 1) valid = await trigger('items');
    else if (currentStep === 2) valid = await trigger('settings') && await trigger('sender');
    else valid = true;

    if (valid) {
      setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
      window.scrollTo(0, 0);
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
    window.scrollTo(0, 0);
  };

  const handleStepClick = async (index: number) => {
    // If clicking a previous step, just go there
    if (index < currentStep) {
      setCurrentStep(index);
      return;
    }

    // If clicking a future step, validate the current step first
    let valid = false;
    if (currentStep === 0) valid = await trigger('client');
    else if (currentStep === 1) valid = await trigger('items');
    else if (currentStep === 2) valid = await trigger('settings') && await trigger('sender');
    else valid = true;

    if (valid) {
      setCurrentStep(index);
      window.scrollTo(0, 0);
    }
  };



  const onSubmit: SubmitHandler<InvoiceFormData> = async (data) => {
    console.log("Submitting:", data);

    try {
      const result = await saveInvoice(data);
      if (result.success) {
        alert(`Invoice ${data.settings.invoiceNumber} saved successfully!`);
      } else {
        alert(`Error: ${result.error}`);
      }
    } catch (error) {
      alert("An unexpected error occurred while saving.");
      console.error(error);
    }
  };



  if (!mounted) return null;

  return (
    <div className="min-h-screen">
      <FormProvider {...methods}>

        {/* Top Header */}
        <div className="text-center py-10 mb-8 animate-in fade-in slide-in-from-top-4 duration-700">
          <h1 className="text-5xl font-extrabold text-neutral-800 font-heading tracking-tight mb-2 drop-shadow-sm">Invoice Generator</h1>
          <p className="text-neutral-500 text-lg font-medium font-body max-w-2xl mx-auto">Create professional, beautifully designed invoices in seconds.</p>
        </div>

        <div className="w-full px-4 md:px-8 lg:px-12 xl:px-16 min-h-[calc(100vh-200px)]">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start h-full pb-20">

            {/* LEFT COLUMN: FORM WIZARD */}
            <div className="lg:col-span-7 xl:col-span-7 space-y-8">
              {/* Stepper floats above the card */}
              <InvoiceStepper currentStep={currentStep} steps={steps} onStepClick={handleStepClick} />

              {/* Glassmorphism Card for Form */}
              <div className="glass-panel rounded-3xl p-8 min-h-[600px] flex flex-col transition-all duration-300">
                <form onSubmit={handleSubmit(onSubmit)} className="flex-1 flex flex-col">
                  <div className="flex-1">
                    {currentStep === 0 && <ClientInfo />}
                    {currentStep === 1 && <ServiceSelection />}
                    {currentStep === 2 && <Settings />}
                    {currentStep === 3 && <PreviewAction onSave={handleSubmit(onSubmit)} />}
                  </div>
                </form>
              </div>

              {/* Controls */}
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
            <div className="lg:col-span-5 xl:col-span-5 sticky top-8 hidden lg:block h-[calc(100vh-4rem)]">
              {/* Preview Container - Clean frame for the paper to sit in */}
              <div className="flex flex-col h-full bg-white/30 backdrop-blur-sm rounded-3xl border border-white/40 p-6 shadow-sm">
                <div className="mb-6 flex justify-between items-center px-2">
                  <h3 className="font-bold text-gray-700 font-heading text-xl">Live Preview</h3>
                  <span className="text-xs font-bold text-primary bg-red-50 px-3 py-1 rounded-full border border-red-100 uppercase tracking-wide">
                    #{methods.watch('settings.invoiceNumber')}
                  </span>
                </div>

                {/* The "Desk" area for the paper */}
                <div className="flex-1 overflow-hidden relative rounded-2xl bg-gray-100/50 inner-shadow-sm border border-black/5">
                  <div className="absolute inset-0 overflow-auto flex justify-center py-8 px-4 custom-scrollbar">
                    {/* Paper shadow is handled inside InvoicePreview or by a wrapper here */}
                    <div id="invoice-preview-container" className="relative transform transition-transform duration-300">
                      <InvoicePreview />
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

      </FormProvider>
    </div>
  );
}
