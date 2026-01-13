import { MainLayout } from "@/components/layout/MainLayout";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Target, TrendingUp, ExternalLink, Users, BarChart3, PieChart } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid } from "recharts";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNavigate } from "react-router-dom";
import { useState, useMemo } from "react";
import { useBudgets } from "@/hooks/useBudgets";
import { useTrafficAds } from "@/hooks/useTrafficAds";
import { useLeads } from "@/hooks/useLeads";
import { useFilters } from "@/contexts/FilterContext";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { useGoals } from "@/hooks/useGoals";
import { MotionCard } from "@/components/ui/motion-card";
import { motion } from "framer-motion";

export default function MarketingDashboard() {
    const navigate = useNavigate();
    const { dateRange } = useFilters();
    const [project, setProject] = useState("all");
    const [platform, setPlatform] = useState("all");

    // Fetch Data
    const { budgets } = useBudgets();
    const { data: ads } = useTrafficAds();
    const { data: leads } = useLeads();
    const { goals } = useGoals();

    // --- AGGREGATION LOGIC ---

    // 1. KPIs
    const totalInvestment = useMemo(() => {
        return ads?.reduce((acc, ad) => acc + (ad.valor_investido || 0), 0) || 0;
    }, [ads]);

    const totalLeads = leads?.length || 0;

    const totalMQLs = useMemo(() => {
        return leads?.filter(l => l.status === 'Qualificado' || l.funil === 'MQL' || (l as any).utm_medium === 'mql').length || 0;
    }, [leads]);

    const cpl = totalLeads > 0 ? totalInvestment / totalLeads : 0;

    // Lead Goal (find first 'leads_target' or default to 100)
    const leadGoal = goals?.find(g => (g as any).metric === 'leads_target')?.target_value || 100;
    const leadProgress = leadGoal > 0 ? Math.min(100, (totalLeads / leadGoal) * 100) : 0;

    // 2. Budget vs Investment Chart
    const budgetChartData = useMemo(() => {
        if (!budgets || !ads) return [];

        const investmentsByProject: Record<string, number> = {};
        ads.forEach(ad => {
            const name = ad.campaign_name || 'Outros';
            investmentsByProject[name] = (investmentsByProject[name] || 0) + (ad.valor_investido || 0);
        });

        const chartData = budgets.map(b => ({
            name: b.project || 'Geral',
            orcamento: b.amount,
            investido: investmentsByProject[b.project || ''] || 0,
            resultado: 0
        }));

        if (chartData.length === 0) {
            Object.entries(investmentsByProject).forEach(([key, value]) => {
                chartData.push({ name: key, orcamento: 0, investido: value, resultado: 0 });
            });
        }

        return chartData;
    }, [budgets, ads]);

    // 3. Funnel Source Chart
    const sourceChartData = useMemo(() => {
        if (!leads) return [];

        const sourceMap: Record<string, { leads: number, mqls: number, sales: number }> = {};

        leads.forEach(l => {
            const source = l.utm_source || 'Desconhecido';
            if (!sourceMap[source]) sourceMap[source] = { leads: 0, mqls: 0, sales: 0 };

            sourceMap[source].leads += 1;
            if (l.status === 'Qualificado' || l.funil === 'MQL') sourceMap[source].mqls += 1;
            if (l.status === 'Cliente') sourceMap[source].sales += 1;
        });

        return Object.entries(sourceMap).map(([name, data]) => ({
            name,
            ...data
        }));
    }, [leads]);

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
    };

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
        <MainLayout title="Marketing">
            <motion.div
                className="p-4 md:p-8 space-y-8"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                <DashboardHeader
                    title="Marketing"
                    subtitle="Performance, ROI e Gestão de Orçamento"
                    exportData={ads}
                    exportFileName="marketing_ads_performance"
                >
                    <div className="flex items-center gap-3">
                        <Select value={project} onValueChange={setProject}>
                            <SelectTrigger className="w-[180px] bg-background border-border">
                                <SelectValue placeholder="Todos Projetos" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todos Projetos</SelectItem>
                                <SelectItem value="lancamento">Lançamentos</SelectItem>
                                <SelectItem value="perpetuo">Perpétuo</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select value={platform} onValueChange={setPlatform}>
                            <SelectTrigger className="w-[180px] bg-background border-border">
                                <SelectValue placeholder="Todas Plataformas" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todas Plataformas</SelectItem>
                                <SelectItem value="meta">Meta Ads</SelectItem>
                                <SelectItem value="google">Google Ads</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </DashboardHeader>

                {/* KPI CARDS */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <MotionCard delay={0.1} className="cursor-pointer hover:border-emerald-500/50 transition-colors" onClick={() => navigate("/trafego")}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Investimento Total</CardTitle>
                            <div className="p-2 bg-emerald-500/10 rounded-full">
                                <DollarSign className="h-4 w-4 text-emerald-500" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-gradient">{formatCurrency(totalInvestment)}</div>
                            <p className="text-xs text-muted-foreground mt-1 flex items-center justify-between">
                                <span><span className="text-emerald-500 font-medium">+0%</span> vs anterior</span>
                                <ExternalLink className="w-3 h-3 opacity-50" />
                            </p>
                        </CardContent>
                    </MotionCard>

                    <MotionCard delay={0.2} className="cursor-pointer hover:border-blue-500/50 transition-colors" onClick={() => navigate("/leads")}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Leads Gerados</CardTitle>
                            <div className="p-2 bg-blue-500/10 rounded-full">
                                <Users className="h-4 w-4 text-blue-500" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{totalLeads}</div>
                            <p className="text-xs text-muted-foreground mt-1 flex items-center justify-between">
                                <span>CPL: <span className="font-medium text-blue-400">{formatCurrency(cpl)}</span></span>
                                <ExternalLink className="w-3 h-3 opacity-50" />
                            </p>
                        </CardContent>
                    </MotionCard>

                    <MotionCard delay={0.3} className={leadProgress >= 100 ? 'border-emerald-500/50 bg-emerald-500/5' : ''}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Meta de Leads</CardTitle>
                            <div className="p-2 bg-primary/10 rounded-full">
                                <Target className="h-4 w-4 text-primary" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{leadProgress.toFixed(0)}%</div>
                            <div className="w-full h-2 bg-secondary rounded-full mt-2 overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${leadProgress}%` }}
                                    transition={{ duration: 1 }}
                                    className={`h-full ${leadProgress >= 100 ? 'bg-emerald-500' : 'bg-primary'}`}
                                />
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">{totalLeads} / {leadGoal} leads</p>
                        </CardContent>
                    </MotionCard>

                    <MotionCard delay={0.4}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">ROAS Geral</CardTitle>
                            <div className="p-2 bg-purple-500/10 rounded-full">
                                <TrendingUp className="h-4 w-4 text-purple-500" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
                                {totalInvestment > 0
                                    ? ((leads?.filter(l => l.status === 'Cliente').length || 0) * 8000 / totalInvestment).toFixed(2) + "x"
                                    : "0x"}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                                Retorno sobre investimento estimado
                            </p>
                        </CardContent>
                    </MotionCard>
                </div>

                {/* CHART: ORÇAMENTO vs INVESTIDO */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    <MotionCard delay={0.5} className="col-span-1">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <BarChart3 className="h-5 w-5 text-primary" /> Investimento x Orçamento
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[300px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart
                                        data={budgetChartData}
                                        layout="vertical"
                                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="hsl(var(--border))" />
                                        <XAxis type="number" hide />
                                        <YAxis dataKey="name" type="category" width={100} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} axisLine={false} tickLine={false} />
                                        <Tooltip
                                            cursor={{ fill: 'transparent' }}
                                            contentStyle={{
                                                backgroundColor: 'hsl(var(--popover))',
                                                borderColor: 'hsl(var(--border))',
                                                borderRadius: 'var(--radius)',
                                                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                                            }}
                                            formatter={(value: number) => formatCurrency(value)}
                                        />
                                        <Legend />
                                        <Bar name="Orçamento" dataKey="orcamento" fill="hsl(var(--muted))" radius={[0, 4, 4, 0]} barSize={20} />
                                        <Bar name="Investido" dataKey="investido" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} barSize={20} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </MotionCard>

                    <MotionCard delay={0.6} className="col-span-1">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <PieChart className="h-5 w-5 text-emerald-500" /> Funil por Canal
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[300px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart
                                        data={sourceChartData}
                                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                                        <XAxis dataKey="name" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} axisLine={false} tickLine={false} />
                                        <YAxis hide />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: 'hsl(var(--popover))',
                                                borderColor: 'hsl(var(--border))',
                                                borderRadius: 'var(--radius)',
                                                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                                            }}
                                        />
                                        <Legend />
                                        <Bar name="Leads" dataKey="leads" fill="#94a3b8" stackId="a" radius={[0, 0, 4, 4]} />
                                        <Bar name="MQLs" dataKey="mqls" fill="hsl(var(--primary))" stackId="a" />
                                        <Bar name="Vendas" dataKey="sales" fill="#10b981" stackId="a" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </MotionCard>
                </div>
            </motion.div>
        </MainLayout>
    );
}
