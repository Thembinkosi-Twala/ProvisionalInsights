
'use client';

import React, { useMemo, useState } from 'react';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import type { Document } from '@/lib/types';
import { BarChart2, Info, FileText, Tags, Loader2, ShieldCheck, Clock, FileSignature } from 'lucide-react';
import { Button } from './ui/button';
import ComplianceReportDialog from './compliance-report-dialog';
import { generateComplianceReport } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';

interface DocumentAnalyticsProps {
  documents: Document[];
}

const chartConfig = {
  count: {
    label: 'Count',
    color: 'hsl(var(--primary))',
  },
};

export default function DocumentAnalytics({ documents }: DocumentAnalyticsProps) {
  const [isReportLoading, setIsReportLoading] = useState(false);
  const [report, setReport] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const handleGenerateReport = async () => {
    setIsReportLoading(true);
    try {
        const result = await generateComplianceReport(documents);
        if (result.error) {
            throw new Error(result.error);
        }
        setReport(result.report || 'No report was generated.');
        setIsDialogOpen(true);
    } catch(error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        toast({
            variant: 'destructive',
            title: 'Report Generation Failed',
            description: errorMessage,
        });
    } finally {
        setIsReportLoading(false);
    }
  }

  const { complianceData, totalDocuments, compliant, awaitingSignature, signed } = useMemo(() => {
    if (documents.length === 0) {
      return { complianceData: [], totalDocuments: 0, compliant: 0, awaitingSignature: 0, signed: 0 };
    }

    const complianceCounts = documents.reduce<Record<string, number>>((acc, doc) => {
        acc[doc.status] = (acc[doc.status] || 0) + 1;
        return acc;
    }, {});
    
    const complianceChartData = Object.entries(complianceCounts)
      .map(([status, count]) => ({ status, count }))
      .sort((a, b) => b.count - a.count);

    return {
        complianceData: complianceChartData,
        totalDocuments: documents.length,
        compliant: complianceCounts['Compliant'] || 0,
        awaitingSignature: documents.filter(doc => doc.isSharedForSignature && !doc.isSigned).length,
        signed: documents.filter(doc => doc.isSigned).length,
    }
  }, [documents]);

  return (
    <div className="space-y-6">
        <div className="grid gap-4 grid-cols-2">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Documents</CardTitle>
                    <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{totalDocuments}</div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Compliant</CardTitle>
                    <ShieldCheck className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{compliant}</div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Awaiting Signature</CardTitle>
                    <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{awaitingSignature}</div>
                </CardContent>
            </Card>
             <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Signed & Archived</CardTitle>
                    <FileSignature className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{signed}</div>
                </CardContent>
            </Card>
        </div>
        <Card>
        <CardHeader>
            <div className="flex justify-between items-start">
                <div>
                    <CardTitle className="flex items-center gap-2">
                        <BarChart2 className="h-5 w-5" />
                        Compliance Status
                    </CardTitle>
                    <CardDescription>Breakdown of documents by compliance status</CardDescription>
                </div>
                <ComplianceReportDialog 
                    report={report} 
                    isOpen={isDialogOpen} 
                    onOpenChange={setIsDialogOpen}
                >
                    <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={handleGenerateReport} 
                        disabled={isReportLoading || documents.length === 0}
                    >
                        {isReportLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Generate Report
                    </Button>
                </ComplianceReportDialog>
            </div>
        </CardHeader>
        <CardContent>
            {complianceData.length > 0 ? (
            <ChartContainer config={chartConfig} className="w-full h-[250px]">
                <ResponsiveContainer>
                <BarChart data={complianceData} layout="vertical" margin={{ left: 20, right: 20 }}>
                    <CartesianGrid horizontal={false} />
                    <YAxis
                    dataKey="status"
                    type="category"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: 'hsl(var(--foreground))', fontSize: 12 }}
                    width={110}
                    />
                    <XAxis dataKey="count" type="number" hide />
                    <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent indicator="dot" />}
                    />
                    <Bar dataKey="count" fill="var(--color-count)" radius={4} />
                </BarChart>
                </ResponsiveContainer>
            </ChartContainer>
            ) : (
            <div className="h-[250px] flex flex-col items-center justify-center text-center">
                <Info className="h-10 w-10 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No analytics to display.</p>
                <p className="text-sm text-muted-foreground/80">Upload documents to see compliance trends.</p>
            </div>
            )}
        </CardContent>
        </Card>
    </div>
  );
}
