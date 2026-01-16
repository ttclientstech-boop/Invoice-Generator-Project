'use server';

import { InvoiceFormData, invoiceFormSchema } from '@/lib/schemas';
import dbConnect from '@/lib/db';
import Invoice from '@/models/Invoice';

export async function saveInvoice(data: InvoiceFormData) {
    console.log('[saveInvoice] Starting...', { invoiceNumber: data.settings?.invoiceNumber });
    try {
        // 1. Validate data on server side
        console.log('[saveInvoice] Validating data...');
        const validatedData = invoiceFormSchema.parse(data);
        console.log('[saveInvoice] Validation success.');

        // 2. Connect to DB
        console.log('[saveInvoice] Connecting to DB...');
        await dbConnect();
        console.log('[saveInvoice] DB Connected.');

        // 3. Create or Update Invoice
        // For now, we'll just create a new one every time ("Store")
        // In a real app, you might check if invoiceNumber exists and update it.

        // Check if invoice number already exists
        console.log('[saveInvoice] Checking for existing invoice...');
        const existing = await Invoice.findOne({ invoiceNumber: validatedData.settings.invoiceNumber });

        if (existing) {
            console.log('[saveInvoice] Invoice number exists.');
            return { success: false, error: 'Invoice number already exists. Please change it in settings.' };
        }

        console.log('[saveInvoice] Creating new invoice document...');
        const newInvoice = await Invoice.create({
            invoiceNumber: validatedData.settings.invoiceNumber,
            documentType: validatedData.documentType, // Pass document type
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

            // Calculate total on server to be safe
            totalAmount: validatedData.items.reduce((acc, item) => acc + (item.price * item.quantity), 0)
        });
        console.log('[saveInvoice] Invoice created:', newInvoice._id);

        return { success: true, id: newInvoice._id.toString() };

    } catch (error: any) {
        console.error('Failed to save invoice:', error);
        return { success: false, error: error.message || 'Failed to save invoice' };
    }
}
