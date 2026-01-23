'use server';

import { InvoiceFormData, invoiceFormSchema } from '@/lib/schemas';
import dbConnect from '@/lib/db';
import Invoice from '@/models/Invoice';

export async function createInvoice(data: InvoiceFormData) {
    console.log('[createInvoice] Starting...', { invoiceNumber: data.settings?.invoiceNumber });
    try {
        // 1. Validate data
        const validatedData = invoiceFormSchema.parse(data);
        if (validatedData.documentType !== 'invoice') {
            throw new Error("Invalid document type for Invoice creation");
        }

        // 2. Connect to DB
        await dbConnect();

        // 3. Check existing
        const numberValue = validatedData.settings.invoiceNumber;
        console.log('[createInvoice] Checking for existing invoice...', numberValue);
        const existing = await Invoice.findOne({ invoiceNumber: numberValue });

        if (existing) {
            return { success: false, error: 'Invoice number already exists. Please change it.' };
        }

        console.log('[createInvoice] Creating new invoice...');

        // 4. Create Payload
        const payload = {
            invoiceNumber: numberValue,
            documentType: 'invoice',
            date: validatedData.settings.date,
            dueDate: validatedData.settings.dueDate,
            taxRate: validatedData.settings.taxRate,
            discount: validatedData.settings.discount,
            paymentTerms: validatedData.settings.paymentTerms,
            notes: validatedData.settings.notes,
            status: validatedData.settings.status,
            isPaid: validatedData.settings.isPaid,
            sender: validatedData.sender,
            client: validatedData.client,
            items: validatedData.items,
            totalAmount: validatedData.items.reduce((acc, item) => acc + (item.price * item.quantity), 0)
        };

        const newDoc = await Invoice.create(payload);
        console.log('[createInvoice] Invoice created:', newDoc._id);

        return { success: true, id: newDoc._id.toString() };

    } catch (error: any) {
        console.error('Failed to create invoice:', error);
        return { success: false, error: error.message || 'Failed to create invoice' };
    }
}

export async function createQuotation(data: InvoiceFormData) {
    console.log('[createQuotation] Starting...', { quotationNumber: data.settings?.invoiceNumber });
    try {
        // 1. Validate data
        const validatedData = invoiceFormSchema.parse(data);
        // Allow 'proposal' to be saved as quotation for now, or strictly 'quotation'
        // User asked for "Invoice generation data" vs "Quotation generation thing"
        // Proposal flow likely ends up as a Quotation record in DB based on previous plan
        if (validatedData.documentType === 'invoice') {
            throw new Error("Invalid document type for Quotation creation");
        }

        // 2. Connect to DB
        await dbConnect();

        // 3. Dynamic Import for Quotation Model to ensure separation
        const { default: Quotation } = await import('@/models/Quotation');

        // 4. Check existing
        const numberValue = validatedData.settings.invoiceNumber; // Mapped to quotationNumber
        console.log('[createQuotation] Checking for existing quotation...', numberValue);

        const existing = await Quotation.findOne({ quotationNumber: numberValue });

        if (existing) {
            return { success: false, error: 'Quotation number already exists. Please change it.' };
        }

        console.log('[createQuotation] Creating new quotation...');

        // 5. Create Payload
        const payload = {
            quotationNumber: numberValue,
            documentType: validatedData.documentType, // 'quotation' or 'proposal'
            date: validatedData.settings.date,
            dueDate: validatedData.settings.dueDate,
            taxRate: validatedData.settings.taxRate,
            discount: validatedData.settings.discount,
            paymentTerms: validatedData.settings.paymentTerms,
            notes: validatedData.settings.notes,
            status: validatedData.settings.status, // Draft, etc.
            isConvertedToInvoice: false,
            sender: validatedData.sender,
            client: validatedData.client,
            items: validatedData.items,
            totalAmount: validatedData.items.reduce((acc, item) => acc + (item.price * item.quantity), 0)
        };

        const newDoc = await Quotation.create(payload);
        console.log('[createQuotation] Quotation created:', newDoc._id);

        return { success: true, id: newDoc._id.toString() };

    } catch (error: any) {
        console.error('Failed to create quotation:', error);
        return { success: false, error: error.message || 'Failed to create quotation' };
    }
}
