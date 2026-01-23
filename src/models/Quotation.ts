import mongoose, { Schema, Document, model, models } from 'mongoose';
import { IInvoice } from './Invoice'; // Import interfaces to reuse them or redefine if strict separation preferred

// Re-exporting interfaces if we want to share them, 
// or we can just redefine them if we want to change them later strictly for Quotations.
// For now, to keep it "separate diff module", I will redefine the schema but I can reuse the interfaces types 
// or just copy-paste for complete decoupling as requested.

// Let's copy the interfaces to ensure total separation as "diff module" implies.

// --- Interfaces ---

export interface IClient {
    name: string;
    email: string;
    phone?: string;
    address: string;
    city: string;
    state: string;
    zip: string;
    country: string;
}

export interface ISender {
    name: string;
    email: string;
    address: string;
    phone?: string;
    gstVatId?: string;
    logo?: string;
    stamp?: string;
    bankDetails?: {
        accountName?: string;
        bankName?: string;
        bankAddress?: string;
        accountNumber?: string;
        ifscCode?: string;
        swiftCode?: string;
    };
}

export interface IServiceItem {
    serviceCategory:
    | 'Web & Software Dev'
    | 'Mobile App Dev'
    | 'Blockchain & Web3'
    | 'AI-driven Solutions'
    | 'SaaS Development'
    | 'Other';
    description?: string;
    serviceDetails?: any;
    quantity: number;
    price: number;
    currency: string;
}

export interface IQuotation extends Document {
    quotationNumber: string; // Changed from invoiceNumber
    documentType: 'quotation' | 'proposal'; // restricted types
    date: Date;
    dueDate: Date; // Valid until?
    taxRate: number;
    discount: number;
    paymentTerms?: string;
    notes?: string;
    status: 'Draft' | 'Sent' | 'Accepted' | 'Rejected'; // Quotation specific statuses might be useful
    isConvertedToInvoice?: boolean; // Tracking field

    sender: ISender;
    client: IClient;
    items: IServiceItem[];
    totalAmount: number;

    createdAt: Date;
    updatedAt: Date;
}

// --- Schema ---

const QuotationSchema = new Schema<IQuotation>({
    quotationNumber: {
        type: String,
        required: [true, 'Quotation number is required'],
        unique: true
    },
    date: {
        type: Date,
        required: [true, 'Quotation date is required'],
        default: Date.now
    },
    dueDate: {
        type: Date,
        required: [true, 'Valid until date is required']
    },
    taxRate: {
        type: Number,
        default: 0
    },
    discount: {
        type: Number,
        default: 0
    },
    paymentTerms: {
        type: String
    },
    notes: {
        type: String
    },
    status: {
        type: String,
        enum: ['Draft', 'Sent', 'Accepted', 'Rejected'],
        default: 'Draft'
    },
    isConvertedToInvoice: {
        type: Boolean,
        default: false
    },

    documentType: {
        type: String,
        enum: ['quotation', 'proposal'],
        default: 'quotation'
    },

    sender: {
        name: { type: String, required: true },
        email: { type: String, required: true },
        address: { type: String, required: true },
        phone: { type: String },
        gstVatId: { type: String },
        logo: { type: String },
        stamp: { type: String },
        bankDetails: {
            accountName: { type: String },
            bankName: { type: String },
            bankAddress: { type: String },
            accountNumber: { type: String },
            ifscCode: { type: String },
            swiftCode: { type: String }
        }
    },

    client: {
        name: { type: String, required: [true, 'Client name is required'] },
        email: { type: String },
        phone: { type: String },
        address: { type: String },
        city: { type: String },
        state: { type: String },
        zip: { type: String },
        country: { type: String },
    },

    items: [{
        serviceCategory: {
            type: String,
            required: true,
            enum: [
                'Web & Software Dev',
                'Mobile App Dev',
                'Blockchain & Web3',
                'AI-driven Solutions',
                'SaaS Development',
                'Other'
            ]
        },
        description: { type: String },
        serviceDetails: { type: Schema.Types.Mixed },
        quantity: { type: Number, default: 1 },
        price: { type: Number, required: true },
        currency: { type: String, default: 'USD' }
    }],

    totalAmount: {
        type: Number,
        required: true
    }
}, {
    timestamps: true,
});

// --- Model ---

const Quotation = models.Quotation || model<IQuotation>('Quotation', QuotationSchema);

export default Quotation;
