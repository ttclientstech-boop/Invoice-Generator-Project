import React, { useRef, useState, useEffect } from 'react';
import { InvoicePreview } from './InvoicePreview';

export function ScalableInvoicePreview() {
    const containerRef = useRef<HTMLDivElement>(null);
    const [scale, setScale] = useState(1);

    useEffect(() => {
        const calculateScale = () => {
            if (containerRef.current) {
                const containerWidth = containerRef.current.offsetWidth;
                const invoiceWidth = 794; // A4 width in pixels at 96 DPI
                const padding = 32; // Safety padding

                // Calculate scale to fit width
                const newScale = Math.min((containerWidth - padding) / invoiceWidth, 1);
                setScale(newScale);
            }
        };

        // Initial calculate
        calculateScale();

        // Recalculate on resize
        window.addEventListener('resize', calculateScale);
        return () => window.removeEventListener('resize', calculateScale);
    }, []);

    return (
        <div ref={containerRef} className="w-full flex justify-center overflow-hidden">
            <div
                style={{
                    transform: `scale(${scale})`,
                    transformOrigin: 'top center',
                    width: '794px', // Force the width of the content
                    height: 'auto'
                }}
            >
                <InvoicePreview />
            </div>
        </div>
    );
}
