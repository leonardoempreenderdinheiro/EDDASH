import { MainLayout } from "@/components/layout/MainLayout";
import { Filter, DollarSign, Users, Target, TrendingUp, Calendar, ArrowUpRight, ArrowDownRight, User } from "lucide-react";
import { useState, useMemo } from "react";
import { useGoals } from "@/hooks/useGoals";
import { useInsurances } from "@/hooks/useInsurances";
import { useLeads } from "@/hooks/useLeads";
import { useFilters } from "@/contexts/FilterContext";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { MotionCard } from "@/components/ui/motion-card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";

interface SalesPersonMetric {
    name: string;
    meta: number;
    realizado: number;
    percentual: number;
    falta: number;
    demos_realizadas: number;
    vendas: number;
    conversao: number;
    ticket_medio: number;
    agendamentos_futuros: number;
    user_id?: string;
}

interface SourceMetric {
    name: string;
    agendamentos: number;
    realizadas: number;
    canceladas: number;
    nao_compareceu: number;
    lead_desqualificado: number;
    agendamentos_futuros: number;
    taxa_comparecimento: number;
    vendas: number;
    faturamento: number;
    ticket_medio: number;
}

export default function SalesDashboard() {
    const { dateRange } = useFilters();
    const [selectedCloser, setSelectedCloser] = useState<string>("Todos");

    // --- REAL DATA HOOKS ---
    const { goals } = useGoals();
    const { data: insurances } = useInsurances();
    const { data: leads } = useLeads();

    // Helper: format currency
    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
        }).format(value);
    };

    // --- AGGREGATION: SDR METRICS ---
    const sdrs = useMemo(() => {
        if (!goals && !insurances) return [];

        // 1. Group Goals by User (using user_name or user_id)
        const employees: Record<string, Partial<SalesPersonMetric>> = {};

        // Process Goals (Targets)
        goals?.forEach(g => {
            if (!g.user_name) return;

            if (!employees[g.user_name]) {
                employees[g.user_name] = { name: g.user_name, meta: 0, realizado: 0, vendas: 0 };
            }

            if (g.metric === 'revenue' || g.metric === 'sales_target') {
                employees[g.user_name].meta = (employees[g.user_name].meta || 0) + Number(g.target_value);
            }
        });

        // Process Insurances (Realized)
        insurances?.forEach(ins => {
            const name = ins.consultant_name || 'Desconhecido';
            const value = Number(ins.premium_value || 0);

            if (!employees[name]) {
                employees[name] = { name: name, meta: 0, realizado: 0, vendas: 0 };
            }

            employees[name].realizado = (employees[name].realizado || 0) + value;
            employees[name].vendas = (employees[name].vendas || 0) + 1;
        });

        // Final Calculation
        return Object.values(employees).map(emp => {
            const meta = emp.meta || 0;
            const realizado = emp.realizado || 0;
            const vendas = emp.vendas || 0;
            const percentual = meta > 0 ? (realizado / meta) * 100 : 0;
            const falta = Math.max(0, meta - realizado);

            return {
                name: emp.name || 'Unknown',
                meta,
                realizado,
                percentual,
                falta,
                demos_realizadas: 0,
                vendas,
                conversao: 0,
                ticket_medio: vendas > 0 ? realizado / vendas : 0,
                agendamentos_futuros: 0,
            };
        });
    }, [goals, insurances]);

    // Unique closers for the dropdown
    const closerNames = useMemo(() => {
        const names = insurances ? Array.from(new Set(insurances.map(i => i.consultant_name).filter(Boolean))) as string[] : [];
        return ["Todos", ...names];
    }, [insurances]);

    // Dynamics metrics for the selected closer
    const closerSummary = useMemo(() => {
        if (!insurances) return null;

        let filtered = insurances;
        if (selectedCloser !== "Todos") {
            filtered = insurances.filter(i => (i as any).consultant_name === selectedCloser || (i as any).profile?.name === selectedCloser);
        }

        const revenue = filtered.reduce((acc, curr) => acc + (Number(curr.premium_value) || 0), 0);
        const salesCount = filtered.length;
        const liveSales = filtered.filter(i => (i as any).origin === 'Ao Vivo' || (i as any).utm_source === 'Live').length;

        return {
            vendas: salesCount,
            aoVivo: liveSales,
            ticketMedio: salesCount > 0 ? revenue / salesCount : 0,
            receita: revenue,
            comissaoFat: revenue * 0.022,
            comissaoAoVivo: liveSales * 150,
            taxaAoVivo: salesCount > 0 ? (liveSales / salesCount) * 100 : 0
        };
    }, [selectedCloser, insurances]);

    // --- AGGREGATION: SOURCE METRICS & PRODUCT MATRIX ---
    const { sourceNames, productMatrix, trafficSources } = useMemo(() => {
        const sourcesSet = new Set<string>();
        const productMap: Record<string, { product: string; sources: Record<string, number>; total: number }> = {};
        const sourceMetrics: Record<string, SourceMetric> = {};

        // Process insurances for product/source matrix
        insurances?.forEach(ins => {
            const source = ins.utm_source || 'Direto/Orgânico';
            const product = ins.product_name || 'Geral';
            const value = Number(ins.premium_value || 0);

            sourcesSet.add(source);

            // Product matrix logic
            if (!productMap[product]) {
                productMap[product] = { product, sources: {}, total: 0 };
            }
            productMap[product].sources[source] = (productMap[product].sources[source] || 0) + value;
            productMap[product].total += value;

            // Basic source metrics
            if (!sourceMetrics[source]) {
                sourceMetrics[source] = {
                    name: source, agendamentos: 0, realizadas: 0, canceladas: 0,
                    nao_compareceu: 0, lead_desqualificado: 0, agendamentos_futuros: 0,
                    taxa_comparecimento: 0, vendas: 0, faturamento: 0, ticket_medio: 0
                };
            }
            sourceMetrics[source].vendas += 1;
            sourceMetrics[source].faturamento += value;
        });

        // Process leads for appointment metrics
        leads?.forEach(l => {
            const source = l.utm_source || 'Direto/Orgânico';
            if (!sourceMetrics[source]) {
                sourceMetrics[source] = {
                    name: source, agendamentos: 0, realizadas: 0, canceladas: 0,
                    nao_compareceu: 0, lead_desqualificado: 0, agendamentos_futuros: 0,
                    taxa_comparecimento: 0, vendas: 0, faturamento: 0, ticket_medio: 0
                };
            }

            sourceMetrics[source].agendamentos += 1;
            if (l.meeting_status === 'realizada') sourceMetrics[source].realizadas += 1;
            if (l.meeting_status === 'cancelada') sourceMetrics[source].canceladas += 1;
            if (l.meeting_status === 'nao_compareceu') sourceMetrics[source].nao_compareceu += 1;
        });

        // Finalize source metrics
        Object.values(sourceMetrics).forEach(sm => {
            sm.taxa_comparecimento = sm.agendamentos > 0 ? (sm.realizadas / sm.agendamentos) * 100 : 0;
            sm.ticket_medio = sm.vendas > 0 ? sm.faturamento / sm.vendas : 0;
        });

        return {
            sourceNames: Array.from(sourcesSet),
            productMatrix: Object.values(productMap),
            trafficSources: Object.values(sourceMetrics)
        };
    }, [insurances, leads]);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    return (
        <MainLayout title="Vendas">
            <motion.div
                className="p-4 md:p-8 space-y-8"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                <DashboardHeader
                    title="Vendas"
                    subtitle="Monitore o desempenho comercial e metas."
                    exportData={trafficSources}
                    exportFileName="vendas_por_origem"
                />

                {/* SDR PERFORMANCE TABLE */}
                <MotionCard delay={0.1} className="overflow-hidden">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 bg-secondary/5 border-b border-border">
                        <CardTitle className="text-lg font-bold flex items-center gap-2">
                            <Users className="h-5 w-5 text-primary" /> Performance por SDR / Closer
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-muted/50 text-muted-foreground uppercase text-xs font-semibold">
                                    <tr>
                                        <th className="p-4 text-left">Consultor</th>
                                        <th className="p-4 text-right">Meta</th>
                                        <th className="p-4 text-right">Realizado</th>
                                        <th className="p-4 text-center">% Meta</th>
                                        <th className="p-4 text-right">Falta</th>
                                        <th className="p-4 text-right">Vendas</th>
                                        <th className="p-4 text-right">Ticket Médio</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {sdrs.length === 0 ? (
                                        <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">Nenhum dado encontrado no período.</td></tr>
                                    ) : (
                                        sdrs.map((s, i) => (
                                            <motion.tr
                                                key={i}
                                                className="border-b border-border hover:bg-muted/30 transition-colors"
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: i * 0.05 }}
                                            >
                                                <td className="p-4 font-medium flex items-center gap-2">
                                                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                                                        {s.name.charAt(0)}
                                                    </div>
                                                    {s.name}
                                                </td>
                                                <td className="p-4 text-right text-muted-foreground">{formatCurrency(s.meta)}</td>
                                                <td className="p-4 text-right font-bold text-emerald-500">{formatCurrency(s.realizado)}</td>
                                                <td className="p-4 text-center">
                                                    <div className="flex items-center gap-2 justify-center">
                                                        <div className="w-16 h-2 bg-secondary rounded-full overflow-hidden">
                                                            <div className="h-full bg-emerald-500" style={{ width: `${Math.min(100, (s.realizado / (s.meta || 1)) * 100)}%` }} />
                                                        </div>
                                                        <span className="text-xs font-bold w-10 text-right">{((s.realizado / (s.meta || 1)) * 100).toFixed(0)}%</span>
                                                    </div>
                                                </td>
                                                <td className="p-4 text-right text-red-400 font-medium">{formatCurrency(s.falta)}</td>
                                                <td className="p-4 text-right">{s.vendas}</td>
                                                <td className="p-4 text-right text-muted-foreground">{formatCurrency(s.ticket_medio)}</td>
                                            </motion.tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </MotionCard>

                {/* PRODUCT x SOURCE MATRIX */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <MotionCard delay={0.2} className="overflow-hidden">
                        <CardHeader className="flex flex-row items-center justify-between pb-2 bg-secondary/5 border-b border-border">
                            <CardTitle className="text-lg font-bold flex items-center gap-2">
                                <span className="bg-purple-500/10 text-purple-500 p-1.5 rounded-md text-xs">PRODUTO</span> Faturamento Produto x Origem
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <table className="w-full text-xs">
                                    <thead className="bg-muted/50 text-muted-foreground uppercase font-semibold">
                                        <tr>
                                            <th className="p-3 text-left">Produto</th>
                                            {sourceNames.map(source => (
                                                <th key={source} className="p-3 text-right whitespace-nowrap">{source}</th>
                                            ))}
                                            <th className="p-3 text-right bg-secondary/10">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {productMatrix.map((item, i) => (
                                            <tr key={i} className="border-b border-border hover:bg-muted/30">
                                                <td className="p-3 font-medium text-emerald-500">{item.product}</td>
                                                {sourceNames.map(source => (
                                                    <td key={source} className="p-3 text-right text-muted-foreground">
                                                        {item.sources[source] ? formatCurrency(item.sources[source]) : '-'}
                                                    </td>
                                                ))}
                                                <td className="p-3 text-right font-bold bg-secondary/5">{formatCurrency(item.total)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </MotionCard>

                    <MotionCard delay={0.3} className="overflow-hidden">
                        <CardHeader className="flex flex-row items-center justify-between pb-2 bg-secondary/5 border-b border-border">
                            <CardTitle className="text-lg font-bold flex items-center gap-2">
                                <Filter className="h-5 w-5 text-blue-500" /> Resumo por Origem
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <table className="w-full text-xs">
                                    <thead className="bg-muted/50 text-muted-foreground uppercase font-semibold">
                                        <tr>
                                            <th className="p-3 text-left">Origem</th>
                                            <th className="p-3 text-center">Agend.</th>
                                            <th className="p-3 text-center">Realiz.</th>
                                            <th className="p-3 text-right">Vendas</th>
                                            <th className="p-3 text-right">Faturamento</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {trafficSources.map((source, i) => (
                                            <tr key={i} className="border-b border-border hover:bg-muted/30">
                                                <td className="p-3 font-medium">{source.name}</td>
                                                <td className="p-3 text-center text-muted-foreground">{source.agendamentos}</td>
                                                <td className="p-3 text-center text-muted-foreground">{source.realizadas}</td>
                                                <td className="p-3 text-right font-bold text-emerald-500">{source.vendas}</td>
                                                <td className="p-3 text-right font-bold text-primary">{formatCurrency(source.faturamento)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </MotionCard>
                </div>

                {/* CLOSER SUMMARY & BONUS RULES */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <MotionCard delay={0.4} className="overflow-hidden bg-zinc-950 border-zinc-900">
                        <div className="bg-black/50 p-4 border-b border-zinc-800 flex justify-between items-center">
                            <h3 className="text-white font-bold flex items-center gap-2 uppercase tracking-wide text-sm">
                                <User className="h-4 w-4 text-emerald-500" /> Resumo Closer
                            </h3>
                            <Select value={selectedCloser} onValueChange={setSelectedCloser}>
                                <SelectTrigger className="w-[180px] h-8 bg-zinc-900 border-zinc-800 text-white text-xs hover:bg-zinc-800 transition-colors">
                                    <SelectValue placeholder="Escolher Closer" />
                                </SelectTrigger>
                                <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                                    {closerNames.map(name => (
                                        <SelectItem key={name} value={name} className="focus:bg-zinc-800 focus:text-white cursor-pointer">
                                            {name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {!selectedCloser || selectedCloser === 'Todos' ? (
                            <div className="p-12 text-center text-zinc-500 flex flex-col items-center gap-3">
                                <div className="p-4 rounded-full bg-zinc-900/50">
                                    <Filter className="h-8 w-8 opacity-50" />
                                </div>
                                <div>
                                    <p className="font-medium text-zinc-400">Visão Geral</p>
                                    <p className="text-xs">Selecione um closer para ver detalhes específicos.</p>
                                </div>
                                <div className="grid grid-cols-2 gap-8 w-full mt-6 pt-6 border-t border-zinc-900">
                                    <div className="text-center">
                                        <p className="text-xs uppercase tracking-wider text-zinc-500 mb-1">Total Vendas</p>
                                        <p className="text-2xl font-bold text-white">{closerSummary?.vendas}</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-xs uppercase tracking-wider text-zinc-500 mb-1">Receita Total</p>
                                        <p className="text-2xl font-bold text-emerald-500">{formatCurrency(closerSummary?.receita || 0)}</p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="p-0">
                                <table className="w-full text-sm text-zinc-300">
                                    <tbody>
                                        <tr className="border-b border-zinc-900">
                                            <td className="p-4 text-zinc-500">Vendas Realizadas</td>
                                            <td className="p-4 text-right font-bold text-white">{closerSummary?.vendas}</td>
                                        </tr>
                                        <tr className="border-b border-zinc-900">
                                            <td className="p-4 text-zinc-500">Vendas Ao Vivo</td>
                                            <td className="p-4 text-right font-bold text-white">{closerSummary?.aoVivo}</td>
                                        </tr>
                                        <tr className="border-b border-zinc-900">
                                            <td className="p-4 text-zinc-500">Ticket Médio</td>
                                            <td className="p-4 text-right text-emerald-400">{formatCurrency(closerSummary?.ticketMedio || 0)}</td>
                                        </tr>
                                        <tr className="bg-emerald-500/10 border-y border-emerald-500/20">
                                            <td className="p-4 text-emerald-500 font-bold">Receita Gerada</td>
                                            <td className="p-4 text-right text-emerald-400 font-bold text-lg">{formatCurrency(closerSummary?.receita || 0)}</td>
                                        </tr>
                                        <tr className="border-b border-zinc-900">
                                            <td className="p-4 text-zinc-500">Comissão (Faturamento)</td>
                                            <td className="p-4 text-right font-medium">{formatCurrency(closerSummary?.comissaoFat || 0)}</td>
                                        </tr>
                                        <tr className="border-b border-zinc-900">
                                            <td className="p-4 text-zinc-500">Comissão (Ao Vivo)</td>
                                            <td className="p-4 text-right font-medium">{formatCurrency(closerSummary?.comissaoAoVivo || 0)}</td>
                                        </tr>
                                        <tr className="bg-zinc-900/50">
                                            <td className="p-4 text-zinc-400">Taxa de Conversão Ao Vivo</td>
                                            <td className="p-4 text-right font-bold text-white">{closerSummary?.taxaAoVivo.toFixed(1)}%</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </MotionCard>

                    <MotionCard delay={0.5} className="overflow-hidden bg-zinc-950 border-zinc-900 h-fit">
                        <div className="bg-black/50 p-4 border-b border-zinc-800">
                            <h3 className="text-white font-bold flex items-center gap-2 uppercase tracking-wide text-sm">
                                <Target className="h-4 w-4 text-blue-500" /> Regras de Bônus
                            </h3>
                        </div>
                        <table className="w-full text-sm text-zinc-300">
                            <thead className="bg-zinc-900/50 text-zinc-500 text-xs uppercase font-bold">
                                <tr>
                                    <th className="p-3 text-left">Nível</th>
                                    <th className="p-3 text-center">BU</th>
                                    <th className="p-3 text-center">Individual</th>
                                    <th className="p-3 text-center text-white">Ambas</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="border-b border-zinc-900 hover:bg-zinc-900/30 transition-colors">
                                    <td className="p-3 font-medium text-emerald-500">100% da Meta</td>
                                    <td className="p-3 text-center">R$ 300</td>
                                    <td className="p-3 text-center">R$ 300</td>
                                    <td className="p-3 text-center font-bold text-white bg-blue-500/10 rounded">R$ 700</td>
                                </tr>
                                <tr className="border-b border-zinc-900 hover:bg-zinc-900/30 transition-colors">
                                    <td className="p-3 font-medium text-emerald-400">120% da Meta</td>
                                    <td className="p-3 text-center">R$ 400</td>
                                    <td className="p-3 text-center">R$ 400</td>
                                    <td className="p-3 text-center font-bold text-white bg-blue-500/10 rounded">R$ 900</td>
                                </tr>
                                <tr className="border-b border-zinc-900 hover:bg-zinc-900/30 transition-colors">
                                    <td className="p-3 font-medium text-emerald-300">140% da Meta</td>
                                    <td className="p-3 text-center">R$ 500</td>
                                    <td className="p-3 text-center">R$ 500</td>
                                    <td className="p-3 text-center font-bold text-white bg-blue-500/10 rounded">R$ 1.200</td>
                                </tr>
                            </tbody>
                        </table>
                    </MotionCard>
                </div>
            </motion.div>
        </MainLayout>
    );
}
