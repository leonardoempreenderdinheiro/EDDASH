
import { MainLayout } from "@/components/layout/MainLayout";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MotionCard } from "@/components/ui/motion-card";
import { DateRange } from "react-day-picker";
import { useState, useMemo } from "react";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { useInsurances } from "@/hooks/useInsurances";
import { useLeads } from "@/hooks/useLeads";
import { useClients } from "@/hooks/useClients";
import { useGoals } from "@/hooks/useGoals";
import { isWithinInterval } from "date-fns";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { TrendingUp, Users, Target, DollarSign, AlertTriangle } from 'lucide-react';
import { motion } from "framer-motion";

export default function ConsolidatedDashboard() {
    const [date, setDate] = useState<DateRange | undefined>({
        from: new Date(new Date().setDate(new Date().getDate() - 30)),
        to: new Date()
    });

    const { data: insurances, isLoading: isLoadingInsurances } = useInsurances();
    const { data: leads, isLoading: isLoadingLeads } = useLeads();
    const { data: clients, isLoading: isLoadingClients } = useClients();
    const { getGoal } = useGoals();

    // Get goals from the Metas page
    const revenueGoal = getGoal('global', 'revenue', 150000);
    const leadsGoal = getGoal('global', 'leads', 100);
    const mqlsGoal = getGoal('global', 'mqls', 40);

    // -- AGGREGATION LOGIC --
    const metrics = useMemo(() => {
        if (!date?.from || !date?.to) return {
            sales: 0, salesCount: 0, leads: 0, newClients: 0, dailySales: [],
            disqualifiedRate: 0, mqls: 0
        };

        const from = date.from;
        const to = date.to;

        const inRange = (d: string | null | undefined) => {
            if (!d) return false;
            try { return isWithinInterval(new Date(d), { start: from, end: to }); } catch { return false; }
        };

        // 1. Sales & Daily Series
        let sales = 0;
        let salesCount = 0;
        const dailyMap: Record<string, number> = {};

        insurances?.forEach(curr => {
            if (inRange(curr.start_date)) {
                const val = Number(curr.premium_value || 0);
                sales += val;
                salesCount += 1;
                const day = curr.start_date?.split('T')[0] || '';
                if (day) dailyMap[day] = (dailyMap[day] || 0) + val;
            }
        });

        const dailySales = Object.entries(dailyMap)
            .map(([date, value]) => ({ date, value }))
            .sort((a, b) => a.date.localeCompare(b.date));

        // 2. Leads & MQLs
        const leadsInRange = leads?.filter(l => inRange(l.date)) || [];
        const leadsCount = leadsInRange.length;
        const mqls = leadsInRange.filter(l => l.status === 'Qualificado' || l.funil === 'MQL').length;
        const disqualified = leadsInRange.filter(l => l.status === 'Desqualificado').length;
        const disqualifiedRate = leadsCount > 0 ? (disqualified / leadsCount) * 100 : 0;

        // 3. New Clients
        const clientList = Array.isArray(clients) ? clients : [];
        const newClients = clientList.filter(c => inRange(c.created_at)).length;

        return { sales, salesCount, leads: leadsCount, newClients, dailySales, disqualifiedRate, mqls };
    }, [insurances, leads, clients, date]);

    const formatCurrency = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
    const goalProgress = revenueGoal > 0 ? Math.min(100, (metrics.sales / revenueGoal) * 100) : 0;

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
        <MainLayout title="Visão Consolidada" subtitle="Acompanhamento Global da Operação">
            <motion.div
                className="flex justify-end mb-6"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
            >
                <DatePickerWithRange date={date} setDate={setDate} />
            </motion.div>

            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8"
            >
                {/* KPI CARDS */}
                <MotionCard delay={0.1}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Faturamento</CardTitle>
                        <div className="p-2 bg-emerald-500/10 rounded-full">
                            <DollarSign className="h-4 w-4 text-emerald-500" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        {isLoadingInsurances ? <div className="animate-pulse h-8 w-24 bg-muted rounded"></div> : (
                            <>
                                <div className="text-2xl font-bold text-gradient">{formatCurrency(metrics.sales)}</div>
                                <p className="text-xs text-muted-foreground flex items-center mt-1">
                                    <TrendingUp className="w-3 h-3 mr-1 text-emerald-500" />
                                    {metrics.salesCount} vendas no período
                                </p>
                            </>
                        )}
                    </CardContent>
                </MotionCard>

                <MotionCard delay={0.2} className={goalProgress >= 100 ? 'border-emerald-500/50 bg-emerald-500/5' : ''}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Meta de Vendas</CardTitle>
                        <div className="p-2 bg-primary/10 rounded-full">
                            <Target className="h-4 w-4 text-primary" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{goalProgress.toFixed(1)}%</div>
                        <div className="w-full h-2 bg-secondary rounded-full mt-2 overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${goalProgress}%` }}
                                transition={{ duration: 1, ease: "easeOut" }}
                                className={`h-full ${goalProgress >= 100 ? 'bg-emerald-500' : 'bg-primary'}`}
                            />
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Meta: {formatCurrency(revenueGoal)}</p>
                    </CardContent>
                </MotionCard>

                <MotionCard delay={0.3}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Conversão de Leads</CardTitle>
                        <div className="p-2 bg-blue-500/10 rounded-full">
                            <Users className="h-4 w-4 text-blue-500" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        {isLoadingLeads ? <div className="animate-pulse h-8 w-24 bg-muted rounded"></div> : (
                            <>
                                <div className="text-2xl font-bold">{metrics.leads} <span className="text-sm font-normal text-muted-foreground">/ {metrics.mqls} MQLs</span></div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Taxa MQL: {metrics.leads > 0 ? ((metrics.mqls / metrics.leads) * 100).toFixed(1) : 0}%
                                </p>
                            </>
                        )}
                    </CardContent>
                </MotionCard>

                <MotionCard delay={0.4} className={metrics.disqualifiedRate > 30 ? 'border-red-500/50 bg-red-500/5' : ''}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Inconsistência</CardTitle>
                        <div className={`p-2 rounded-full ${metrics.disqualifiedRate > 30 ? 'bg-red-500/10' : 'bg-muted'}`}>
                            <AlertTriangle className={`h-4 w-4 ${metrics.disqualifiedRate > 30 ? 'text-red-500' : 'text-muted-foreground'}`} />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-bold ${metrics.disqualifiedRate > 30 ? 'text-red-500' : ''}`}>
                            {metrics.disqualifiedRate.toFixed(1)}%
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Leads desqualificados</p>
                    </CardContent>
                </MotionCard>
            </motion.div>

            {/* CHARTS SECTION */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                <MotionCard delay={0.5} className="col-span-1">
                    <CardHeader>
                        <CardTitle>Evolução de Vendas</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[350px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={metrics.dailySales}>
                                <defs>
                                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                                <XAxis
                                    dataKey="date"
                                    tickFormatter={(val) => new Date(val).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                                    tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <YAxis hide />
                                <Tooltip
                                    labelFormatter={(val) => new Date(val).toLocaleDateString('pt-BR')}
                                    formatter={(val) => formatCurrency(Number(val))}
                                    contentStyle={{
                                        backgroundColor: 'hsl(var(--popover))',
                                        borderColor: 'hsl(var(--border))',
                                        borderRadius: 'var(--radius)',
                                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                                    }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="value"
                                    stroke="#10b981"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorSales)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </CardContent>
                </MotionCard>

                <MotionCard delay={0.6} className="col-span-1">
                    <CardHeader>
                        <CardTitle>Funil de Conversão</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[350px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={[
                                { name: 'Leads', value: metrics.leads, fill: '#64748b' },
                                { name: 'MQLs', value: metrics.mqls, fill: '#f59e0b' },
                                { name: 'Vendas', value: metrics.salesCount, fill: '#10b981' }
                            ]} layout="vertical" margin={{ left: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
                                <XAxis type="number" hide />
                                <YAxis
                                    dataKey="name"
                                    type="category"
                                    width={80}
                                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                                    axisLine={false}
                                />
                                <Tooltip
                                    cursor={{ fill: 'hsl(var(--muted)/0.2)' }}
                                    contentStyle={{
                                        backgroundColor: 'hsl(var(--popover))',
                                        borderColor: 'hsl(var(--border))',
                                        borderRadius: 'var(--radius)'
                                    }}
                                />
                                <Bar
                                    dataKey="value"
                                    radius={[0, 4, 4, 0]}
                                    barSize={40}
                                    label={{ position: 'right', fill: 'hsl(var(--foreground))' }}
                                >
                                    {
                                        [
                                            { fill: '#64748b' },
                                            { fill: '#f59e0b' },
                                            { fill: '#10b981' }
                                        ].map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.fill} />
                                        ))
                                    }
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </MotionCard>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <MotionCard delay={0.7}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Novos Clientes</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        {isLoadingClients ? <div className="animate-pulse h-8 w-16 bg-muted rounded"></div> : (
                            <div className="text-2xl font-bold">{metrics.newClients}</div>
                        )}
                        <p className="text-xs text-muted-foreground">no período selecionado</p>
                    </CardContent>
                </MotionCard>
                <MotionCard delay={0.8}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Clientes Ativos</CardTitle>
                        <Users className="h-4 w-4 text-emerald-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{clients?.filter(c => c.status === 'ativo').length || 0}</div>
                        <p className="text-xs text-muted-foreground">total na base</p>
                    </CardContent>
                </MotionCard>
            </div>
        </MainLayout>
    );
}
