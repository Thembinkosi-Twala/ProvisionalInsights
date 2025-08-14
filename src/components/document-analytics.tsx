
'use client';

import React, { useMemo } from 'react';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import type { Document } from '@/lib/types';
import { BarChart2, Info, FileText, Tags } from 'lucide-react';

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
  const { keywordData, totalDocuments, totalKeywords } = useMemo(() => {
    if (documents.length === 0) {
      return { keywordData: [], totalDocuments: 0, totalKeywords: 0 };
    }

    const allKeywords = documents.flatMap(doc => doc.keywords);

    const keywordCounts = allKeywords.reduce<Record<string, number>>((acc, keyword) => {
        const lowerKeyword = keyword.toLowerCase();
        acc[lowerKeyword] = (acc[lowerKeyword] || 0) + 1;
        return acc;
      }, {});

    const sortedKeywords = Object.entries(keywordCounts)
      .map(([keyword, count]) => ({ keyword, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
    
    return {
        keywordData: sortedKeywords,
        totalDocuments: documents.length,
        totalKeywords: new Set(allKeywords.map(k => k.toLowerCase())).size,
    }
  }, [documents]);

  return (
    <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
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
                    <CardTitle className="text-sm font-medium">Unique Keywords</CardTitle>
                    <Tags className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{totalKeywords}</div>
                </CardContent>
            </Card>
        </div>
        <Card>
        <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <BarChart2 className="h-5 w-5" />
                Keyword Analysis
            </CardTitle>
            <CardDescription>Top 10 keywords across all documents</CardDescription>
        </CardHeader>
        <CardContent>
            {keywordData.length > 0 ? (
            <ChartContainer config={chartConfig} className="w-full h-[300px]">
                <ResponsiveContainer>
                <BarChart data={keywordData} layout="vertical" margin={{ left: 20, right: 20 }}>
                    <CartesianGrid horizontal={false} />
                    <YAxis
                    dataKey="keyword"
                    type="category"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: 'hsl(var(--foreground))', fontSize: 12 }}
                    width={80}
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
            <div className="h-[300px] flex flex-col items-center justify-center text-center">
                <Info className="h-10 w-10 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No analytics to display.</p>
                <p className="text-sm text-muted-foreground/80">Upload documents to see keyword trends.</p>
            </div>
            )}
        </CardContent>
        </Card>
    </div>
  );
}
