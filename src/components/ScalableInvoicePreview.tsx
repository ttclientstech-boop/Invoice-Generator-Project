"use client";

import React, { useRef, useEffect } from 'react';
import { InvoicePreview } from './InvoicePreview';

export function ScalableInvoicePreview() {
    const containerRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const updateScale = () => {
            if (!containerRef.current || !contentRef.current) return;

            const containerWidth = containerRef.current.clientWidth;
            // 210mm is approx 794px. We add padding buffer.
            const contentWidth = 850;

            const newScale = Math.min(containerWidth / contentWidth, 1);

            if (contentRef.current) {
                contentRef.current.style.transform = `scale(${newScale})`;

                // Adjust height of container to match scaled content height approximately
                // A4 ratio is ~1.414. Width 210mm, Height 297mm.
                // 850px width * 1.414 = ~1200px height
                // We leave some buffer
                const scaledHeight = 1200 * newScale;
                containerRef.current.style.height = `${scaledHeight + 50}px`;
            }
        };

        const observer = new ResizeObserver(updateScale);
        if (containerRef.current) {
            observer.observe(containerRef.current);
        }

        // Run initially
        updateScale();

        return () => observer.disconnect();
    }, []);

    return (
        <div
            ref={containerRef}
            className="w-full relative overflow-hidden flex justify-center bg-gray-100/50 rounded-lg border border-black/5"
        >
            <div
                ref={contentRef}
                className="origin-top custom-scrollbar transition-transform duration-200 ease-out py-8"
            >
                {/* ID needed for PDF generation if we want to target this instance, 
                    but PDF generation currently targets a hidden div. 
                    So this is just for display. */}
                <InvoicePreview />
            </div>
        </div>
    );
}
