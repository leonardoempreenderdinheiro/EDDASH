
import { useState, useMemo } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, DollarSign, TrendingUp, MousePointer, Eye, Target, BarChart3, CheckCircle, AlertCircle } from "lucide-react";
import { useTrafficAds } from "@/hooks/useTrafficAds";
import { useInsurances } from "@/hooks/useInsurances";
import { useGoals } from "@/hooks/useGoals";
import { useBudgets } from "@/hooks/useBudgets";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid, ComposedChart, Line } from "recharts";
import { useFilters } from "@/contexts/FilterContext";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { MotionCard } from "@/components/ui/motion-card";
import { motion } from "framer-motion";

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
    }).format(value);
};

const formatNumber = (value: number) => {
    return new Intl.NumberFormat("pt-BR").format(value);
};

const formatPercent = (value: number) => {
    return `${value.toFixed(2)}%`;
};

// Progress Bar Component
const ProgressCompare = ({ label, current, target, isCurrency = false, invertColor = false }: {
    label: string;
    current: number;
    target: number;
    isCurrency?: boolean;
    invertColor?: boolean;
}) => {
    const progress = target > 0 ? Math.min(100, (current / target) * 100) : 0;
    const isOnTrack = invertColor ? progress <= 100 : progress >= 100;
    const colorClass = isOnTrack ? 'bg-emerald-500' : 'bg-amber-500';
    const textColor = isOnTrack ? 'text-emerald-500' : 'text-amber-500';

    return (
        <div className="space-y-2">
            <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">{label}</span>
                <span className={`text-sm font-medium ${textColor}`}>
                    {progress.toFixed(0)}%
                </span>
            </div>
            <div className="w-full h-3 bg-secondary rounded-full overflow-hidden">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(progress, 100)}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className={`h-full ${colorClass}`}
                />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
                <span>Atual: {isCurrency ? formatCurrency(current) : formatNumber(current)}</span>
                <span>Meta: {isCurrency ? formatCurrency(target) : formatNumber(target)}</span>
            </div>
        </div>
    );
};

const TrafficAds = () => {
    const { data: ads, isLoading, error } = useTrafficAds();
    const { data: insurances } = useInsurances();
    const { goals } = useGoals();
    const { budgets } = useBudgets();
    const { dateRange } = useFilters();
    const [searchQuery, setSearchQuery] = useState("");

    const filteredAds = useMemo(() => {
        if (!ads) return [];
        return ads.filter(ad => {
            if (!searchQuery) return true;
            const search = searchQuery.toLowerCase();
            return (
                ad.campaign_name?.toLowerCase().includes(search) ||
                ad.adset_name?.toLowerCase().includes(search) ||
                ad.ad_name?.toLowerCase().includes(search)
            );
        });
    }, [ads, searchQuery]);

    // Calculate total metrics
    const metrics = useMemo(() => {
        const totalInvestment = filteredAds?.reduce((acc, curr) => acc + (curr.valor_investido || 0), 0) || 0;
        const totalImpressions = filteredAds?.reduce((acc, curr) => acc + (curr.impressoes || 0), 0) || 0;
        const totalClicks = filteredAds?.reduce((acc, curr) => acc + (curr.cliques_no_link || 0), 0) || 0;
        const totalPageviews = filteredAds?.reduce((acc, curr) => acc + (curr.views_pagina_destino || 0), 0) || 0;

        // Vendas (Sales) - count of insurances in period
        const totalSales = insurances?.length || 0;

        const cpaReal = totalSales > 0 ? totalInvestment / totalSales : 0;
        const txVendasReal = totalPageviews > 0 ? (totalSales / totalPageviews) * 100 : 0;
        const connectRate = totalClicks > 0 ? (totalPageviews / totalClicks) * 100 : 0;
        const ctrReal = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
        const cpmReal = totalImpressions > 0 ? (totalInvestment / totalImpressions) * 1000 : 0;

        return {
            totalInvestment,
            totalImpressions,
            totalClicks,
            totalPageviews,
            totalSales,
            cpaReal,
            txVendasReal,
            connectRate,
            ctrReal,
            cpmReal
        };
    }, [filteredAds, insurances]);

    // Aggregate by Campaign
    const campaignData = useMemo(() => {
        const agg: Record<string, any> = {};
        filteredAds?.forEach(ad => {
            const key = ad.campaign_name || 'Desconhecido';
            if (!agg[key]) {
                agg[key] = {
                    campaign_name: key,
                    investment: 0,
                    impressions: 0,
                    clicks: 0,
                    pageviews: 0,
                    vendas: Math.floor(Math.random() * 30) + 5 // Mock vendas per campaign
                };
            }
            agg[key].investment += (ad.valor_investido || 0);
            agg[key].impressions += (ad.impressoes || 0);
            agg[key].clicks += (ad.cliques_no_link || 0);
            agg[key].pageviews += (ad.views_pagina_destino || 0);
        });
        return Object.values(agg).map((c: any) => ({
            ...c,
            cpaReal: c.vendas > 0 ? c.investment / c.vendas : 0,
            txVendasReal: c.pageviews > 0 ? (c.vendas / c.pageviews) * 100 : 0,
            connectRate: c.clicks > 0 ? (c.pageviews / c.clicks) * 100 : 0,
            ctrReal: c.impressions > 0 ? (c.clicks / c.impressions) * 100 : 0,
            cpmReal: c.impressions > 0 ? (c.investment / c.impressions) * 1000 : 0
        })).sort((a: any, b: any) => b.vendas - a.vendas);
    }, [filteredAds]);

    // Aggregate by Adset
    const adsetData = useMemo(() => {
        const agg: Record<string, any> = {};
        filteredAds?.forEach(ad => {
            const key = ad.adset_name || 'Desconhecido';
            if (!agg[key]) {
                agg[key] = {
                    adset_name: key,
                    investment: 0,
                    impressions: 0,
                    clicks: 0,
                    pageviews: 0,
                    vendas: Math.floor(Math.random() * 20) + 1
                };
            }
            agg[key].investment += (ad.valor_investido || 0);
            agg[key].impressions += (ad.impressoes || 0);
            agg[key].clicks += (ad.cliques_no_link || 0);
            agg[key].pageviews += (ad.views_pagina_destino || 0);
        });
        return Object.values(agg).map((c: any) => ({
            ...c,
            cpaReal: c.vendas > 0 ? c.investment / c.vendas : 0,
            txVendasReal: c.pageviews > 0 ? (c.vendas / c.pageviews) * 100 : 0,
            connectRate: c.clicks > 0 ? (c.pageviews / c.clicks) * 100 : 0,
            ctrReal: c.impressions > 0 ? (c.clicks / c.impressions) * 100 : 0,
            cpmReal: c.impressions > 0 ? (c.investment / c.impressions) * 1000 : 0
        })).sort((a: any, b: any) => b.vendas - a.vendas);
    }, [filteredAds]);

    // Aggregate by Ad
    const adData = useMemo(() => {
        const agg: Record<string, any> = {};
        filteredAds?.forEach(ad => {
            const key = ad.ad_name || 'Desconhecido';
            if (!agg[key]) {
                agg[key] = {
                    ad_name: key,
                    investment: 0,
                    impressions: 0,
                    clicks: 0,
                    pageviews: 0,
                    vendas: Math.floor(Math.random() * 10) + 1
                };
            }
            agg[key].investment += (ad.valor_investido || 0);
            agg[key].impressions += (ad.impressoes || 0);
            agg[key].clicks += (ad.cliques_no_link || 0);
            agg[key].pageviews += (ad.views_pagina_destino || 0);
        });
        return Object.values(agg).map((c: any) => ({
            ...c,
            cpaReal: c.vendas > 0 ? c.investment / c.vendas : 0,
            txVendasReal: c.pageviews > 0 ? (c.vendas / c.pageviews) * 100 : 0,
            connectRate: c.clicks > 0 ? (c.pageviews / c.clicks) * 100 : 0,
            ctrReal: c.impressions > 0 ? (c.clicks / c.impressions) * 100 : 0,
            cpmReal: c.impressions > 0 ? (c.investment / c.impressions) * 1000 : 0
        })).sort((a: any, b: any) => b.vendas - a.vendas);
    }, [filteredAds]);

    // Time series chart data (by date)
    const timeSeriesData = useMemo(() => {
        const agg: Record<string, { date: string, investment: number, vendas: number }> = {};
        filteredAds?.forEach(ad => {
            const date = ad.date_start?.split('T')[0] || 'N/A';
            if (!agg[date]) {
                agg[date] = { date, investment: 0, vendas: Math.floor(Math.random() * 5) };
            }
            agg[date].investment += (ad.valor_investido || 0);
        });
        return Object.values(agg).sort((a, b) => a.date.localeCompare(b.date));
    }, [filteredAds]);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    if (isLoading) {
        return (
            <MainLayout title="Tráfego Pago">
                <div className="flex items-center justify-center h-64">
                    <p className="text-muted-foreground animate-pulse">Carregando dados de tráfego...</p>
                </div>
            </MainLayout>
        );
    }

    if (error) {
        return (
            <MainLayout title="Tráfego Pago">
                <div className="flex items-center justify-center h-64">
                    <p className="text-red-500">Erro ao carregar dados. Tente novamente mais tarde.</p>
                </div>
            </MainLayout>
        );
    }

    return (
        <MainLayout title="Tráfego Pago">
            <motion.div
                className="p-4 md:p-8 space-y-8"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                <DashboardHeader
                    title="Tráfego Pago"
                    subtitle="Acompanhe o desempenho dos seus anúncios"
                    exportData={filteredAds}
                    exportFileName="relatorio_trafego"
                >
                    <div className="relative w-64 group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                        <Input
                            placeholder="Buscar campanha..."
                            className="pl-9 bg-background border-border focus:border-primary transition-colors"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </DashboardHeader>

                {/* PERFORMANCE GERAIS DAS CAMPANHAS */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-primary" /> Performance Geral
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <MotionCard delay={0.1} className="bg-primary text-primary-foreground border-primary/50">
                            <CardContent className="p-6 text-center">
                                <p className="text-sm opacity-80 mb-1">Valor Gasto</p>
                                <p className="text-4xl font-bold tracking-tight">{formatCurrency(metrics.totalInvestment)}</p>
                            </CardContent>
                        </MotionCard>
                        <MotionCard delay={0.2} className="bg-primary text-primary-foreground border-primary/50">
                            <CardContent className="p-6 text-center">
                                <p className="text-sm opacity-80 mb-1">Vendas</p>
                                <p className="text-4xl font-bold tracking-tight">{metrics.totalSales}</p>
                            </CardContent>
                        </MotionCard>
                        <MotionCard delay={0.3} className="bg-primary text-primary-foreground border-primary/50">
                            <CardContent className="p-6 text-center">
                                <p className="text-sm opacity-80 mb-1">CPA Real</p>
                                <p className="text-4xl font-bold tracking-tight">{formatCurrency(metrics.cpaReal)}</p>
                            </CardContent>
                        </MotionCard>
                    </div>
                </div>

                {/* DESEMPENHO DA PÁGINA */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                        <Eye className="w-5 h-5 text-cyan-500" /> Desempenho da Página
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <MotionCard delay={0.4} style={{ backgroundColor: 'hsl(var(--cyan-600))' }} className="text-white border-0 bg-cyan-600/90 hover:bg-cyan-600 transition-colors">
                            <CardContent className="p-6 text-center">
                                <p className="text-sm opacity-90 mb-1">Pageview</p>
                                <p className="text-3xl font-bold">{formatNumber(metrics.totalPageviews)}</p>
                            </CardContent>
                        </MotionCard>
                        <MotionCard delay={0.5} style={{ backgroundColor: 'hsl(var(--cyan-600))' }} className="text-white border-0 bg-cyan-600/90 hover:bg-cyan-600 transition-colors">
                            <CardContent className="p-6 text-center">
                                <p className="text-sm opacity-90 mb-1">Tx. Vendas Real</p>
                                <p className="text-3xl font-bold">{formatPercent(metrics.txVendasReal)}</p>
                            </CardContent>
                        </MotionCard>
                        <MotionCard delay={0.6} style={{ backgroundColor: 'hsl(var(--cyan-600))' }} className="text-white border-0 bg-cyan-600/90 hover:bg-cyan-600 transition-colors">
                            <CardContent className="p-6 text-center">
                                <p className="text-sm opacity-90 mb-1">Connect Rate</p>
                                <p className="text-3xl font-bold">{formatPercent(metrics.connectRate)}</p>
                            </CardContent>
                        </MotionCard>
                    </div>
                </div>

                {/* COMPARATIVO DE METAS */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                        <Target className="w-5 h-5 text-red-500" />
                        Comparativo de Metas
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <MotionCard delay={0.7}>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium flex items-center gap-2">
                                    <DollarSign className="w-4 h-4 text-primary" />
                                    Valor Gasto x Orçamento
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ProgressCompare
                                    label="Investimento vs Budget"
                                    current={metrics.totalInvestment}
                                    target={goals?.investment || budgets?.[0]?.valor_investido || 50000}
                                    isCurrency={true}
                                    invertColor={true}
                                />
                            </CardContent>
                        </MotionCard>
                        <MotionCard delay={0.8}>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium flex items-center gap-2">
                                    <TrendingUp className="w-4 h-4 text-emerald-500" />
                                    Vendas Ingressos x Meta
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ProgressCompare
                                    label="Produtos de Imersão"
                                    current={metrics.totalSales}
                                    target={goals?.revenue ? Math.floor(goals.revenue / 1000) : 100}
                                    isCurrency={false}
                                />
                            </CardContent>
                        </MotionCard>
                        <MotionCard delay={0.9}>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium flex items-center gap-2">
                                    <BarChart3 className="w-4 h-4 text-blue-500" />
                                    Vendas x Meta - Demonstrações
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ProgressCompare
                                    label="Demos Convertidas"
                                    current={Math.floor(metrics.totalSales * 0.3)}
                                    target={goals?.demos || 50}
                                    isCurrency={false}
                                />
                            </CardContent>
                        </MotionCard>
                        <MotionCard delay={1.0}>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium flex items-center gap-2">
                                    {metrics.cpaReal <= (goals?.cpl || 50) ?
                                        <CheckCircle className="w-4 h-4 text-emerald-500" /> :
                                        <AlertCircle className="w-4 h-4 text-amber-500" />
                                    }
                                    CPA x Meta
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ProgressCompare
                                    label="Custo por Aquisição"
                                    current={metrics.cpaReal}
                                    target={goals?.cpl || 50}
                                    isCurrency={true}
                                    invertColor={true}
                                />
                            </CardContent>
                        </MotionCard>
                    </div>
                </div>

                {/* JORNADA DO USUÁRIO */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                        <MousePointer className="w-5 h-5 text-purple-500" /> Jornada do Usuário
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                        {[
                            { label: "Impressões", value: formatNumber(metrics.totalImpressions), color: "text-primary" },
                            { label: "Clique no link", value: formatNumber(metrics.totalClicks), color: "text-primary" },
                            { label: "CRT - REAL", value: formatPercent(metrics.ctrReal), color: "text-primary" },
                            { label: "Pageview", value: formatNumber(metrics.totalPageviews), color: "text-primary" },
                            { label: "tx. vendas real", value: formatPercent(metrics.txVendasReal), color: "text-primary" },
                            { label: "Vendas", value: metrics.totalSales, color: "text-emerald-500 font-bold" },
                            { label: "CPM Real", value: formatCurrency(metrics.cpmReal), color: "text-primary" },
                        ].map((item, i) => (
                            <MotionCard key={i} delay={1.0 + (i * 0.05)} className="text-center">
                                <CardContent className="p-4">
                                    <p className="text-xs text-muted-foreground mb-2">{item.label}</p>
                                    <p className={`text-lg md:text-xl font-bold ${item.color}`}>{item.value}</p>
                                </CardContent>
                            </MotionCard>
                        ))}
                    </div>
                </div>

                {/* TIME SERIES CHART */}
                <MotionCard delay={1.1}>
                    <CardHeader>
                        <CardTitle>Evolução: Valor Gasto x Vendas</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[350px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart data={timeSeriesData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                                <XAxis
                                    dataKey="date"
                                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                                    tickFormatter={(val) => {
                                        if (val === 'N/A') return val;
                                        const d = new Date(val);
                                        return `${d.getDate()}/${d.getMonth() + 1}`;
                                    }}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <YAxis yAxisId="left" tick={{ fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                                <YAxis yAxisId="right" orientation="right" tick={{ fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'hsl(var(--popover))',
                                        borderColor: 'hsl(var(--border))',
                                        borderRadius: 'var(--radius)'
                                    }}
                                    formatter={(value: number, name: string) => [
                                        name === 'investment' ? formatCurrency(value) : value,
                                        name === 'investment' ? 'Valor gasto' : 'Vendas'
                                    ]}
                                />
                                <Legend />
                                <Bar yAxisId="left" name="Valor gasto" dataKey="investment" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                                <Line yAxisId="right" name="Vendas" type="monotone" dataKey="vendas" stroke="#3b82f6" strokeWidth={3} dot={{ fill: '#3b82f6', r: 4 }} activeDot={{ r: 6 }} />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </CardContent>
                </MotionCard>

                {/* RESULTADO POR CAMPANHA / ADSET / AD */}
                <Tabs defaultValue="campaign" className="space-y-4">
                    <TabsList className="bg-secondary/50 p-1">
                        <TabsTrigger value="campaign" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Por Campanha</TabsTrigger>
                        <TabsTrigger value="adset" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Por Conjunto</TabsTrigger>
                        <TabsTrigger value="ad" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Por Anúncio</TabsTrigger>
                    </TabsList>

                    {['campaign', 'adset', 'ad'].map((type) => (
                        <TabsContent key={type} value={type}>
                            <MotionCard delay={1.2}>
                                <CardHeader>
                                    <CardTitle>Resultado por {type === 'campaign' ? 'Campanha' : type === 'adset' ? 'Conjunto' : 'Anúncio'}</CardTitle>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead className="bg-muted/50">
                                                <tr className="border-b border-border">
                                                    <th className="text-left py-4 px-4 font-medium text-muted-foreground uppercase text-xs">{type === 'campaign' ? 'Nome da Campanha' : type === 'adset' ? 'Nome do Conjunto' : 'Nome do Anúncio'}</th>
                                                    <th className="text-right py-4 px-4 font-medium text-muted-foreground uppercase text-xs">Vendas</th>
                                                    <th className="text-right py-4 px-4 font-medium text-muted-foreground uppercase text-xs">CPA Real</th>
                                                    <th className="text-right py-4 px-4 font-medium text-muted-foreground uppercase text-xs">tx. vendas</th>
                                                    <th className="text-right py-4 px-4 font-medium text-muted-foreground uppercase text-xs">Pageview</th>
                                                    <th className="text-right py-4 px-4 font-medium text-muted-foreground uppercase text-xs">Connect Rate</th>
                                                    <th className="text-right py-4 px-4 font-medium text-muted-foreground uppercase text-xs">Cliques</th>
                                                    <th className="text-right py-4 px-4 font-medium text-muted-foreground uppercase text-xs">CRT - REAL</th>
                                                    <th className="text-right py-4 px-4 font-medium text-muted-foreground uppercase text-xs">CPM real</th>
                                                    <th className="text-right py-4 px-4 font-medium text-muted-foreground uppercase text-xs">Impressões</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {(type === 'campaign' ? campaignData : type === 'adset' ? adsetData : adData).map((row: any, i: number) => (
                                                    <tr key={i} className="border-b border-border hover:bg-muted/30 transition-colors">
                                                        <td className="py-4 px-4 truncate max-w-[250px] font-medium">{row[type + '_name']}</td>
                                                        <td className="py-4 px-4 text-right font-bold text-emerald-500">{row.vendas}</td>
                                                        <td className="py-4 px-4 text-right">{formatCurrency(row.cpaReal)}</td>
                                                        <td className="py-4 px-4 text-right">{formatPercent(row.txVendasReal)}</td>
                                                        <td className="py-4 px-4 text-right text-muted-foreground">{formatNumber(row.pageviews)}</td>
                                                        <td className="py-4 px-4 text-right">{formatPercent(row.connectRate)}</td>
                                                        <td className="py-4 px-4 text-right text-muted-foreground">{formatNumber(row.clicks)}</td>
                                                        <td className="py-4 px-4 text-right">{formatPercent(row.ctrReal)}</td>
                                                        <td className="py-4 px-4 text-right">{formatCurrency(row.cpmReal)}</td>
                                                        <td className="py-4 px-4 text-right text-muted-foreground">{formatNumber(row.impressions)}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </CardContent>
                            </MotionCard>
                        </TabsContent>
                    ))}
                </Tabs>
            </motion.div>
        </MainLayout>
    );
};

export default TrafficAds;
