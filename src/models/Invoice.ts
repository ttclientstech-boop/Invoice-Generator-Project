import mongoose, { Schema, Document, model, models } from 'mongoose';

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
}

export interface IServiceItem {
    serviceCategory:
    | 'Web & Software Dev'
    | 'Mobile App Dev'
    | 'Blockchain & Web3'
    | 'AI-driven Solutions'
    | 'SaaS Development'
    | 'Other';
    description: string; // The generated text summary
    serviceDetails?: any; // Stores the specific form fields for the category (Mixed type)
    quantity: number;
    price: number;
}

export interface IInvoice extends Document {
    invoiceNumber: string;
    date: Date;
    dueDate: Date;
    currency: string;
    taxRate: number; // Percentage
    discount: number; // Absolute value or Percentage (handled by logic)
    paymentTerms?: string;
    notes?: string;
    status: 'Draft' | 'Sent';
    isPaid: boolean;

    sender: ISender;
    client: IClient;
    items: IServiceItem[];
    totalAmount: number;

    createdAt: Date;
    updatedAt: Date;
}

// --- Schema ---

const InvoiceSchema = new Schema<IInvoice>({
    invoiceNumber: {
        type: String,
        required: [true, 'Invoice number is required'],
        unique: true
    },
    date: {
        type: Date,
        required: [true, 'Invoice date is required'],
        default: Date.now
    },
    dueDate: {
        type: Date,
        required: [true, 'Due date is required']
    },
    currency: {
        type: String,
        default: 'USD'
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
        enum: ['Draft', 'Sent'],
        default: 'Draft'
    },
    isPaid: {
        type: Boolean,
        default: false
    },

    sender: {
        name: { type: String, required: true },
        email: { type: String, required: true },
        address: { type: String, required: true },
        phone: { type: String },
        gstVatId: { type: String },
        logo: { type: String }
    },

    client: {
        name: { type: String, required: [true, 'Client name is required'] },
        email: { type: String, required: [true, 'Client email is required'] },
        phone: { type: String },
        address: { type: String, required: true },
        city: { type: String, required: true },
        state: { type: String, required: true },
        zip: { type: String, required: true },
        country: { type: String, required: true },
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
        description: { type: String, required: true },
        serviceDetails: { type: Schema.Types.Mixed }, // Flexible for diverse category fields
        quantity: { type: Number, default: 1 },
        price: { type: Number, required: true },
    }],

    totalAmount: {
        type: Number,
        required: true
    }
}, {
    timestamps: true,
});

// --- Model ---

const Invoice = models.Invoice || model<IInvoice>('Invoice', InvoiceSchema);

export default Invoice;
