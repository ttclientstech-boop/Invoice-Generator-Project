import React from 'react';
import { cn } from '@/lib/utils';
import { User, List, Settings, FileText, Check } from 'lucide-react';

interface InvoiceStepperProps {
    currentStep: number;
    steps: string[];
    onStepClick: (index: number) => void;
}

export function InvoiceStepper({ currentStep, steps, onStepClick }: InvoiceStepperProps) {
    const progress = Math.round(((currentStep) / (steps.length - 1)) * 100);

    const icons = [User, List, Settings, FileText];

    return (
        <div className="w-full space-y-4 mb-2">
            <div className="flex justify-between items-center px-1">
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-500 font-heading">
                    Step {currentStep + 1} of {steps.length}
                </span>
                <span className="text-xs font-bold text-primary bg-red-50 px-2 py-0.5 rounded-full border border-red-100">
                    {progress}% Complete
                </span>
            </div>

            {/* Stepper Track */}
            <div className="relative mx-4">
                {/* Background Line */}
                <div className="absolute top-5 left-0 w-full h-1 bg-gray-200 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-orange-500 to-primary transition-all duration-700 ease-in-out"
                        style={{ width: `${progress}%` }}
                    />
                </div>

                <div className="relative flex justify-between w-full">
                    {steps.map((step, index) => {
                        const Icon = icons[index] || FileText;
                        const isActive = index === currentStep;
                        const isCompleted = index < currentStep;

                        return (
                            <button
                                key={step}
                                onClick={() => onStepClick(index)}
                                className={cn(
                                    "flex flex-col items-center group transition-all duration-300 outline-none focus:scale-110",
                                    isActive ? "scale-110" : "hover:scale-105"
                                )}
                            >
                                <div className={cn(
                                    "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 shadow-sm z-10 bg-white relative",
                                    isActive ? "border-primary bg-primary text-white shadow-lg shadow-primary/30" :
                                        isCompleted ? "border-primary bg-white text-primary" : "border-gray-200 text-gray-400 bg-white hover:border-primary/50"
                                )}>
                                    {isCompleted ? <Check size={18} strokeWidth={3} /> : <Icon size={18} />}
                                </div>
                                <span className={cn(
                                    "absolute top-12 text-xs font-bold transition-all duration-300 whitespace-nowrap font-heading",
                                    isActive ? "text-neutral-800 -translate-y-1 opacity-100" : "text-gray-400 translate-y-1 opacity-0 group-hover:opacity-100 group-hover:translate-y-0"
                                )}>
                                    {step}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Spacer for labels */}
            <div className="h-4"></div>
        </div>
    );
}
