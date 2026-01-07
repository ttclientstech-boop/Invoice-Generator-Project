import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Invoice from '@/models/Invoice';

export async function GET() {
    try {
        await dbConnect();

        // Find the latest invoice sorted by creation date descending
        const latestInvoice = await Invoice.findOne().sort({ createdAt: -1 });

        let nextNumber = 'INV-001';

        if (latestInvoice && latestInvoice.invoiceNumber) {
            // Extract the numeric part
            const matches = latestInvoice.invoiceNumber.match(/INV-(\d+)/);
            if (matches && matches[1]) {
                const currentNum = parseInt(matches[1], 10);
                const nextNum = currentNum + 1;
                // Pad with zeros to 3 digits (or more if needed)
                nextNumber = `INV-${nextNum.toString().padStart(3, '0')}`;
            }
        }

        return NextResponse.json({ nextNumber });
    } catch (error) {
        console.error('Error generating invoice number:', error);
        return NextResponse.json(
            { error: 'Failed to generate invoice number' },
            { status: 500 }
        );
    }
}
