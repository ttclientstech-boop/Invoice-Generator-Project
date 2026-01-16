import React from 'react';
import { useFormContext, useFieldArray } from 'react-hook-form';
import { InvoiceFormData } from '@/lib/schemas';
import { Building2, Plus, Trash2, CheckCircle2, Circle, Upload } from 'lucide-react';

export function Settings() {
    const { register, control, watch, setValue, formState: { errors } } = useFormContext<InvoiceFormData>();

    // Manage list of companies
    const { fields, append, remove } = useFieldArray({
        control,
        name: "savedSenders"
    });

    // Watch active sender to determine who is selected
    const activeSender = watch('sender');

    // Watch savedSenders to checking length for remove button logic
    const savedSenders = watch('savedSenders');

    const handleSelectCompany = (index: number) => {
        const companyToSelect = savedSenders[index];
        setValue('sender', companyToSelect);
    };

    const isSelected = (index: number) => {
        const company = savedSenders[index];
        // Simple comparison based on name and email
        return company?.name === activeSender?.name && company?.email === activeSender?.email;
    };

    // Auto-update active sender when the selected saved sender is modified
    React.useEffect(() => {
        const activeIndex = savedSenders.findIndex(s => s.name === activeSender?.name && s.email === activeSender?.email);
        if (activeIndex !== -1) {
            const currentSaved = savedSenders[activeIndex];
            // Deep comparison or just checking if they are different stringified?
            if (JSON.stringify(currentSaved) !== JSON.stringify(activeSender)) {
                setValue('sender', currentSaved);
            }
        }
    }, [savedSenders, activeSender, setValue]);

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">

            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                <h2 className="text-xl font-bold font-heading text-neutral-800 flex items-center gap-2">
                    <Building2 size={24} className="text-primary" />
                    Company Settings
                </h2>
                <button
                    type="button"
                    onClick={() => append({
                        name: '',
                        email: '',
                        address: '',
                        phone: '',
                        logo: '',
                        gstVatId: '',
                        bankDetails: { accountName: '', bankName: '', bankAddress: '', accountNumber: '', ifscCode: '', swiftCode: '' }
                    })}
                    className="flex items-center gap-2 text-sm font-bold text-primary hover:text-primary/80 transition-colors bg-primary/5 px-4 py-2 rounded-lg hover:bg-primary/10"
                >
                    <Plus size={16} />
                    Add Company
                </button>
            </div>

            <div className="space-y-6">
                {fields.map((field, index) => {
                    const selected = isSelected(index);

                    return (
                        <div
                            key={field.id}
                            className={`bg-white rounded-2xl p-6 shadow-sm border transition-all relative overflow-hidden group ${selected ? 'border-primary ring-1 ring-primary/20 bg-primary/[0.02]' : 'border-gray-100 hover:border-gray-300'}`}
                        >
                            {/* Header Actions: Selection & Delete */}
                            <div className="absolute top-0 right-0 p-4 z-10 flex items-center gap-2">
                                {/* Remove Button */}
                                {fields.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => remove(index)}
                                        className="p-1.5 text-neutral-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
                                        title="Remove Company"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                )}

                                {/* Select Button */}
                                <button
                                    type="button"
                                    onClick={() => handleSelectCompany(index)}
                                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${selected
                                        ? 'bg-green-100 text-green-700 cursor-default'
                                        : 'bg-gray-100 text-neutral-600 hover:bg-primary hover:text-white cursor-pointer'
                                        }`}
                                >
                                    {selected ? (
                                        <>
                                            <CheckCircle2 size={14} />
                                            Active
                                        </>
                                    ) : (
                                        <>
                                            <Circle size={14} />
                                            Select
                                        </>
                                    )}
                                </button>
                            </div>

                            {/* Removed bottom button */}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-[90%] md:w-full relative z-0">
                                <div className="space-y-1.5">
                                    {/* Logo Upload */}
                                    <label className="text-xs font-bold text-neutral-500 uppercase tracking-widest pl-1">Logo</label>
                                    <div className="flex gap-4 items-center">
                                        {/* Preview */}
                                        <div className="w-16 h-16 bg-gray-50 border border-gray-200 rounded-lg flex items-center justify-center overflow-hidden shrink-0 relative group/preview">
                                            {watch(`savedSenders.${index}.logo`) ? (
                                                <>
                                                    <img src={watch(`savedSenders.${index}.logo`) || ''} alt="Logo" className="w-full h-full object-contain" />
                                                    <button
                                                        type="button"
                                                        onClick={() => setValue(`savedSenders.${index}.logo`, '')}
                                                        className="absolute inset-0 bg-black/50 text-white flex items-center justify-center opacity-0 group-hover/preview:opacity-100 transition-all"
                                                        title="Remove Logo"
                                                    >
                                                        <Trash2 size={12} />
                                                    </button>
                                                </>
                                            ) : (
                                                <Upload size={20} className="text-gray-300" />
                                            )}
                                        </div>
                                        {/* Input */}
                                        <div className="flex-1">
                                            <label className="block w-full">
                                                <span className="sr-only">Choose logo</span>
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    className="block w-full text-sm text-slate-500
                                                    file:mr-4 file:py-2 file:px-4
                                                    file:rounded-full file:border-0
                                                    file:text-xs file:font-semibold
                                                    file:bg-primary/10 file:text-primary
                                                    hover:file:bg-primary/20 cursor-pointer"
                                                    onChange={(e) => {
                                                        const file = e.target.files?.[0];
                                                        if (file) {
                                                            const reader = new FileReader();
                                                            reader.onloadend = () => {
                                                                setValue(`savedSenders.${index}.logo`, reader.result as string);
                                                            };
                                                            reader.readAsDataURL(file);
                                                        }
                                                    }}
                                                />
                                            </label>
                                            <input type="hidden" {...register(`savedSenders.${index}.logo`)} />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    {/* Stamp Upload */}
                                    <label className="text-xs font-bold text-neutral-500 uppercase tracking-widest pl-1">Company Stamp</label>
                                    <div className="flex gap-4 items-center">
                                        {/* Preview */}
                                        <div className="w-16 h-16 bg-gray-50 border border-gray-200 rounded-lg flex items-center justify-center overflow-hidden shrink-0 relative group/preview">
                                            {watch(`savedSenders.${index}.stamp`) ? (
                                                <>
                                                    <img src={watch(`savedSenders.${index}.stamp`) || ''} alt="Stamp" className="w-full h-full object-contain p-1" />
                                                    <button
                                                        type="button"
                                                        onClick={() => setValue(`savedSenders.${index}.stamp`, '')}
                                                        className="absolute inset-0 bg-black/50 text-white flex items-center justify-center opacity-0 group-hover/preview:opacity-100 transition-all"
                                                        title="Remove Stamp"
                                                    >
                                                        <Trash2 size={12} />
                                                    </button>
                                                </>
                                            ) : (
                                                <div className="border border-dashed border-gray-300 w-8 h-8 rounded-full flex items-center justify-center">
                                                    <div className="w-6 h-6 rounded-full border border-gray-300"></div>
                                                </div>
                                            )}
                                        </div>
                                        {/* Input */}
                                        <div className="flex-1">
                                            <label className="block w-full">
                                                <span className="sr-only">Choose stamp</span>
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    className="block w-full text-sm text-slate-500
                                                    file:mr-4 file:py-2 file:px-4
                                                    file:rounded-full file:border-0
                                                    file:text-xs file:font-semibold
                                                    file:bg-primary/10 file:text-primary
                                                    hover:file:bg-primary/20 cursor-pointer"
                                                    onChange={(e) => {
                                                        const file = e.target.files?.[0];
                                                        if (file) {
                                                            const reader = new FileReader();
                                                            reader.onloadend = () => {
                                                                setValue(`savedSenders.${index}.stamp`, reader.result as string);
                                                            };
                                                            reader.readAsDataURL(file);
                                                        }
                                                    }}
                                                />
                                            </label>
                                            <input type="hidden" {...register(`savedSenders.${index}.stamp`)} />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-neutral-500 uppercase tracking-widest pl-1">Company Name</label>
                                    <input
                                        {...register(`savedSenders.${index}.name`)}
                                        placeholder="Your Company Name"
                                        className="flex h-11 w-full rounded-lg border border-gray-200 bg-gray-50/50 px-4 py-2 text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                    />
                                    {errors.savedSenders?.[index]?.name && <p className="text-red-500 text-xs pl-1">{errors.savedSenders[index]?.name?.message}</p>}
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-neutral-500 uppercase tracking-widest pl-1">Email Address</label>
                                    <input
                                        type="email"
                                        {...register(`savedSenders.${index}.email`)}
                                        placeholder="billing@company.com"
                                        className="flex h-11 w-full rounded-lg border border-gray-200 bg-gray-50/50 px-4 py-2 text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                    />
                                    {errors.savedSenders?.[index]?.email && <p className="text-red-500 text-xs pl-1">{errors.savedSenders[index]?.email?.message}</p>}
                                </div>

                                <div className="space-y-1.5 md:col-span-2">
                                    <label className="text-xs font-bold text-neutral-500 uppercase tracking-widest pl-1">Office Address</label>
                                    <textarea
                                        {...register(`savedSenders.${index}.address`)}
                                        placeholder="Full business address"
                                        rows={3}
                                        className="flex w-full rounded-lg border border-gray-200 bg-gray-50/50 px-4 py-3 text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
                                    />
                                    {errors.savedSenders?.[index]?.address && <p className="text-red-500 text-xs pl-1">{errors.savedSenders[index]?.address?.message}</p>}
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-neutral-500 uppercase tracking-widest pl-1">Phone Number</label>
                                    <input
                                        type="tel"
                                        {...register(`savedSenders.${index}.phone`)}
                                        placeholder="+1 (555) 000-0000"
                                        className="flex h-11 w-full rounded-lg border border-gray-200 bg-gray-50/50 px-4 py-2 text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-neutral-500 uppercase tracking-widest pl-1">GST/VAT ID</label>
                                    <input
                                        {...register(`savedSenders.${index}.gstVatId`)}
                                        placeholder="Optional tax ID"
                                        className="flex h-11 w-full rounded-lg border border-gray-200 bg-gray-50/50 px-4 py-2 text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                    />
                                </div>

                                <div className="md:col-span-2 border-t border-gray-100 pt-4 mt-2">
                                    <h4 className="text-sm font-bold text-neutral-800 mb-3 block">Bank Details</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-neutral-500 uppercase tracking-widest pl-1">Company / Account Name</label>
                                            <input
                                                {...register(`savedSenders.${index}.bankDetails.accountName`)}
                                                placeholder="Account Holder Name"
                                                className="flex h-11 w-full rounded-lg border border-gray-200 bg-gray-50/50 px-4 py-2 text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-neutral-500 uppercase tracking-widest pl-1">Bank Name</label>
                                            <input
                                                {...register(`savedSenders.${index}.bankDetails.bankName`)}
                                                placeholder="Bank Name"
                                                className="flex h-11 w-full rounded-lg border border-gray-200 bg-gray-50/50 px-4 py-2 text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                            />
                                        </div>
                                        <div className="space-y-1.5 md:col-span-2">
                                            <label className="text-xs font-bold text-neutral-500 uppercase tracking-widest pl-1">Bank Address</label>
                                            <input
                                                {...register(`savedSenders.${index}.bankDetails.bankAddress`)}
                                                placeholder="Branch Address"
                                                className="flex h-11 w-full rounded-lg border border-gray-200 bg-gray-50/50 px-4 py-2 text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-neutral-500 uppercase tracking-widest pl-1">Account Number</label>
                                            <input
                                                {...register(`savedSenders.${index}.bankDetails.accountNumber`)}
                                                placeholder="Account Number"
                                                className="flex h-11 w-full rounded-lg border border-gray-200 bg-gray-50/50 px-4 py-2 text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-neutral-500 uppercase tracking-widest pl-1">IFSC Code</label>
                                            <input
                                                {...register(`savedSenders.${index}.bankDetails.ifscCode`)}
                                                placeholder="IFSC Code"
                                                className="flex h-11 w-full rounded-lg border border-gray-200 bg-gray-50/50 px-4 py-2 text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-neutral-500 uppercase tracking-widest pl-1">SWIFT Code</label>
                                            <input
                                                {...register(`savedSenders.${index}.bankDetails.swiftCode`)}
                                                placeholder="Optional SWIFT Code"
                                                className="flex h-11 w-full rounded-lg border border-gray-200 bg-gray-50/50 px-4 py-2 text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
