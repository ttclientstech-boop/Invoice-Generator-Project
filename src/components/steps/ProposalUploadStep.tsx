import React, { useState, useRef } from 'react';
import { Upload, FileText, CheckCircle, X } from 'lucide-react';
import { useFormContext } from 'react-hook-form';

export const ProposalUploadStep = () => {
    const { setValue, watch } = useFormContext();
    const [dragActive, setDragActive] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Watch for existing file (store loosely in form state for now)
    const uploadedFile = watch('proposalDocument');

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
        }
    };

    const handleFile = (file: File) => {
        // Basic validation
        // In a real scenario, we'd upload to cloud here or convert to base64
        // For now, store metadata + object URL for preview if needed
        console.log("File uploaded:", file);

        setValue('proposalDocument', {
            name: file.name,
            size: (file.size / 1024).toFixed(2) + ' KB',
            type: file.type,
            lastModified: file.lastModified
        }, { shouldDirty: true }); // trigger dirty state
    };

    const clearFile = () => {
        setValue('proposalDocument', null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-500">
            <div>
                <h2 className="text-2xl font-bold text-gray-800 font-heading">
                    Upload Project Requirements
                </h2>
                <p className="text-gray-500 mt-2 font-medium">
                    Upload your RFP, requirement doc, or rough notes. We'll extract the details to build your proposal.
                </p>
            </div>

            {!uploadedFile ? (
                <div
                    className={`border-2 border-dashed rounded-xl p-10 flex flex-col items-center justify-center text-center cursor-pointer transition-all
            ${dragActive ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-primary/50 hover:bg-gray-50'}`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                >
                    <input
                        ref={fileInputRef}
                        type="file"
                        className="hidden"
                        onChange={handleChange}
                        accept=".pdf,.doc,.docx,.txt"
                    />

                    <div className="w-16 h-16 bg-blue-50 text-primary rounded-full flex items-center justify-center mb-4">
                        <Upload size={32} />
                    </div>

                    <h3 className="text-lg font-bold text-gray-700">Click or Drag to Upload</h3>
                    <p className="text-sm text-gray-500 mt-1 max-w-xs">
                        Supports PDF, DOCX, TXT. Max file size 10MB.
                    </p>
                </div>
            ) : (
                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-green-50 text-green-600 rounded-full flex items-center justify-center">
                            <FileText size={24} />
                        </div>
                        <div>
                            <h4 className="font-bold text-gray-800">{uploadedFile.name}</h4>
                            <p className="text-xs text-gray-500">{uploadedFile.size} • Ready for extraction</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        <div className="flex items-center text-green-600 text-sm font-bold bg-green-50 px-3 py-1 rounded-full">
                            <CheckCircle size={14} className="mr-1.5" /> Attached
                        </div>
                        <button
                            onClick={clearFile}
                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>
            )}

            <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                <h4 className="font-bold text-blue-800 text-sm mb-1">What happens next?</h4>
                <p className="text-sm text-blue-600">
                    Our AI will analyze your document to identify the <strong>Client Name</strong>, <strong>Project Goals</strong>, and recommended <strong>Services & Scope</strong>. You can review and edit the extracted data in the next step.
                </p>
            </div>
        </div>
    );
};
