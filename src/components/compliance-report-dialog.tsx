'use client';

import React from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
    DialogClose,
} from '@/components/ui/dialog';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
import { FileText } from 'lucide-react';

interface ComplianceReportDialogProps {
    report: string | null;
    children: React.ReactNode;
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
}

export default function ComplianceReportDialog({ report, children, isOpen, onOpenChange }: ComplianceReportDialogProps) {
    const handlePrint = () => {
        const printWindow = window.open('', '_blank');
        if (printWindow) {
            printWindow.document.write('<html><head><title>Compliance Report</title>');
            printWindow.document.write('<style>body { font-family: sans-serif; } table { border-collapse: collapse; width: 100%; } th, td { border: 1px solid #ddd; padding: 8px; text-align: left; } th { background-color: #f2f2f2; }</style>');
            printWindow.document.write('</head><body>');
            // A simple markdown to HTML conversion
            let htmlReport = report || '';
            htmlReport = htmlReport.replace(/## (.*)/g, '<h2>$1</h2>');
            htmlReport = htmlReport.replace(/### (.*)/g, '<h3>$1</h3>');
            htmlReport = htmlReport.replace(/\*\*(.*)\*\*/g, '<strong>$1</strong>');
            
            printWindow.document.write(htmlReport);
            printWindow.document.write('</body></html>');
            printWindow.document.close();
            printWindow.print();
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="sm:max-w-3xl h-[80vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <FileText />
                        Compliance Report
                    </DialogTitle>
                </DialogHeader>
                <ScrollArea className="flex-1 my-4 pr-4">
                   <div className="prose prose-sm dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: report ? report.replace(/\\n/g, '<br />').replace(/## (.*)/g, '<h2>$1</h2>').replace(/\*\*(.*)\*\*/g, '<strong>$1</strong>') : '<p>No report available.</p>' }} />
                </ScrollArea>
                <DialogFooter>
                    <Button variant="outline" onClick={handlePrint}>Print</Button>
                    <DialogClose asChild>
                        <Button type="button">Close</Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
