import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Invoice from '@/models/Invoice';



export async function GET(request: Request) {
    try {
        await dbConnect();

        const { searchParams } = new URL(request.url);
        const type = searchParams.get('type') || 'invoice';
        const isQuotation = type === 'quotation' || type === 'proposal';

        let Model: any;
        let prefix: string;
        let numberField: string;

        if (isQuotation) {
            const { default: Quotation } = await import('@/models/Quotation');
            Model = Quotation;
            prefix = 'QTN-- 25/26-';
            numberField = 'quotationNumber';
        } else {
            Model = Invoice;
            prefix = 'INV- 25/26-';
            numberField = 'invoiceNumber';
        }

        // Find the latest document sorted by creation date descending
        const latestDoc = await Model.findOne().sort({ createdAt: -1 });

        let nextNumber = `${prefix}001`;

        if (latestDoc) {
            const currentDocNumber = latestDoc[numberField];
            if (currentDocNumber) {
                // Extract the numeric part from the end of the string.
                // Works for "INV-001" (matches 001) and "INV- 25/26-001" (matches 001)
                const matches = currentDocNumber.match(/(\d+)$/);
                if (matches && matches[1]) {
                    const currentNum = parseInt(matches[1], 10);
                    const nextNum = currentNum + 1;
                    // Pad with zeros to 3 digits (or more if needed)
                    nextNumber = `${prefix}${nextNum.toString().padStart(3, '0')}`;
                }
            }
        }

        return NextResponse.json({ nextNumber });
    } catch (error) {
        console.error('Error generating document number:', error);
        return NextResponse.json(
            { error: 'Failed to generate document number' },
            { status: 500 }
        );
    }
}
