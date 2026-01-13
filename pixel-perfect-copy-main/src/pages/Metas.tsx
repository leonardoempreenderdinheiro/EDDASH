
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useGoals } from "@/hooks/useGoals";
import { useProfiles } from "@/hooks/useProfiles";
import { useFilters } from "@/contexts/FilterContext";
import { toast } from "sonner";
import { Target, DollarSign, Users, TrendingUp, BarChart3, Save, Megaphone, MousePointer, Eye, Percent, Loader2 } from "lucide-react";

interface MetricInput {
    label: string;
    key: string;
    type: 'currency' | 'number' | 'percent';
    description?: string;
}

// Helper to format currency input display
const formatInputPrefix = (type: 'currency' | 'number' | 'percent') => {
    switch (type) {
        case 'currency': return 'R$';
        case 'percent': return '%';
        default: return '';
    }
};

export default function MetasPage() {
    const { goals, createGoal, updateGoal, isLoading } = useGoals();
    const { data: profiles } = useProfiles();
    const { selectedCompany } = useFilters();
    const [isSaving, setIsSaving] = useState(false);

    // ========== GLOBAL GOALS ==========
    const [globalGoals, setGlobalGoals] = useState({
        revenue: 0,
        leads: 0,
        mqls: 0,
        clients: 0,
        sales_count: 0,
        avg_ticket: 0,
    });

    // ========== TRAFFIC GOALS ==========
    const [trafficGoals, setTrafficGoals] = useState({
        investment: 0,
        cpl: 0,
        cpa: 0,
        clicks: 0,
        impressions: 0,
        pageviews: 0,
        ctr: 0,
        connect_rate: 0,
        sales_rate: 0,
        roas: 0,
        cpm: 0,
    });

    // ========== MARKETING GOALS ==========
    const [marketingGoals, setMarketingGoals] = useState({
        budget: 0,
        leads: 0,
        mqls: 0,
        cpl: 0,
        conversion_rate: 0,
        roas: 0,
        demos_scheduled: 0,
        demos_completed: 0,
    });

    // ========== SALES GOALS (Per Person) ==========
    const [salesGoals, setSalesGoals] = useState<{ name: string; revenue: number; demos: number; conversions: number }[]>([]);

    // Load existing goals from database
    useEffect(() => {
        if (goals) {
            // Global
            const findGoal = (sector: string, metric: string) =>
                goals.find(g => (g as any).sector === sector && (g as any).metric === metric);

            setGlobalGoals({
                revenue: Number(findGoal('global', 'revenue')?.target_value) || 150000,
                leads: Number(findGoal('global', 'leads')?.target_value) || 100,
                mqls: Number(findGoal('global', 'mqls')?.target_value) || 40,
                clients: Number(findGoal('global', 'clients')?.target_value) || 20,
                sales_count: Number(findGoal('global', 'sales_count')?.target_value) || 50,
                avg_ticket: Number(findGoal('global', 'avg_ticket')?.target_value) || 3000,
            });

            // Traffic
            setTrafficGoals({
                investment: Number(findGoal('traffic', 'investment')?.target_value) || 10000,
                cpl: Number(findGoal('traffic', 'cpl')?.target_value) || 50,
                cpa: Number(findGoal('traffic', 'cpa')?.target_value) || 150,
                clicks: Number(findGoal('traffic', 'clicks')?.target_value) || 5000,
                impressions: Number(findGoal('traffic', 'impressions')?.target_value) || 100000,
                pageviews: Number(findGoal('traffic', 'pageviews')?.target_value) || 4000,
                ctr: Number(findGoal('traffic', 'ctr')?.target_value) || 2.5,
                connect_rate: Number(findGoal('traffic', 'connect_rate')?.target_value) || 80,
                sales_rate: Number(findGoal('traffic', 'sales_rate')?.target_value) || 5,
                roas: Number(findGoal('traffic', 'roas')?.target_value) || 3,
                cpm: Number(findGoal('traffic', 'cpm')?.target_value) || 30,
            });

            // Marketing
            setMarketingGoals({
                budget: Number(findGoal('marketing', 'budget')?.target_value) || 20000,
                leads: Number(findGoal('marketing', 'leads')?.target_value) || 200,
                mqls: Number(findGoal('marketing', 'mqls')?.target_value) || 80,
                cpl: Number(findGoal('marketing', 'cpl')?.target_value) || 100,
                conversion_rate: Number(findGoal('marketing', 'conversion_rate')?.target_value) || 10,
                roas: Number(findGoal('marketing', 'roas')?.target_value) || 4,
                demos_scheduled: Number(findGoal('marketing', 'demos_scheduled')?.target_value) || 30,
                demos_completed: Number(findGoal('marketing', 'demos_completed')?.target_value) || 25,
            });

            // Sales (per person)
            const salesPeople = profiles?.filter(p => ['Consultor', 'Closer', 'SDR'].includes(p.role || '')) || [];
            const mappedSales = salesPeople.map(p => {
                const rev = goals.find(g => (g as any).user_name === p.full_name && (g as any).metric === 'revenue');
                const dem = goals.find(g => (g as any).user_name === p.full_name && (g as any).metric === 'demos_target');
                const conv = goals.find(g => (g as any).user_name === p.full_name && (g as any).metric === 'conversions');
                return {
                    name: p.full_name || 'Unknown',
                    revenue: rev ? Number(rev.target_value) : 0,
                    demos: dem ? Number(dem.target_value) : 0,
                    conversions: conv ? Number(conv.target_value) : 0,
                };
            });
            setSalesGoals(mappedSales);
        }
    }, [goals, profiles]);

    // Generic save handler
    const saveGoals = async (sector: string, metricsObj: Record<string, number>) => {
        setIsSaving(true);
        try {
            const currentPeriod = new Date().toISOString().split('T')[0];
            const metrics = Object.entries(metricsObj).map(([metric, value]) => ({ sector, metric, value }));

            for (const m of metrics) {
                const existing = goals?.find(g => (g as any).sector === m.sector && (g as any).metric === m.metric);
                if (existing) {
                    await updateGoal.mutateAsync({ id: existing.id, target_value: m.value });
                } else {
                    await createGoal.mutateAsync({
                        company: selectedCompany,
                        sector: m.sector,
                        metric: m.metric,
                        target_value: m.value,
                        period: currentPeriod
                    } as any);
                }
            }
            toast.success(`Metas de ${sector} salvas!`);
        } catch (e) {
            console.error(e);
            toast.error(`Erro ao salvar metas de ${sector}.`);
        } finally {
            setIsSaving(false);
        }
    };

    const handleSaveSales = async () => {
        setIsSaving(true);
        try {
            const currentPeriod = new Date().toISOString().split('T')[0];

            for (const person of salesGoals) {
                const metricsToSave = [
                    { metric: 'revenue', value: person.revenue },
                    { metric: 'demos_target', value: person.demos },
                    { metric: 'conversions', value: person.conversions },
                ];

                for (const m of metricsToSave) {
                    const existing = goals?.find(g => (g as any).user_name === person.name && (g as any).metric === m.metric);
                    if (existing) {
                        await updateGoal.mutateAsync({ id: existing.id, target_value: m.value });
                    } else if (m.value > 0) {
                        await createGoal.mutateAsync({
                            company: selectedCompany,
                            sector: 'sales',
                            metric: m.metric,
                            target_value: m.value,
                            period: currentPeriod,
                            user_name: person.name
                        } as any);
                    }
                }
            }
            toast.success("Metas comerciais salvas!");
        } catch (e) {
            console.error(e);
            toast.error("Erro ao salvar metas comerciais.");
        } finally {
            setIsSaving(false);
        }
    };

    // Reusable metric input component
    const MetricInputGroup = ({ metrics, values, onChange, columns = 3 }: {
        metrics: MetricInput[],
        values: Record<string, number>,
        onChange: (key: string, value: number) => void,
        columns?: number
    }) => (
        <div className={`grid grid-cols-1 md:grid-cols-${columns} gap-4`}>
            {metrics.map((m) => (
                <div key={m.key} className="space-y-2">
                    <Label className="flex items-center gap-1">
                        {m.label}
                        {m.type === 'currency' && <span className="text-xs text-muted-foreground">(R$)</span>}
                        {m.type === 'percent' && <span className="text-xs text-muted-foreground">(%)</span>}
                    </Label>
                    <Input
                        type="number"
                        step={m.type === 'percent' ? 0.1 : 1}
                        value={values[m.key] || 0}
                        onChange={(e) => onChange(m.key, Number(e.target.value))}
                    />
                    {m.description && <p className="text-xs text-muted-foreground">{m.description}</p>}
                </div>
            ))}
        </div>
    );

    if (isLoading) {
        return (
            <MainLayout title="Gestão de Metas" subtitle="Carregando...">
                <div className="flex items-center justify-center h-64">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
            </MainLayout>
        );
    }

    return (
        <MainLayout title="Gestão de Metas" subtitle="Defina e acompanhe as metas de todos os setores">
            <div className="p-4 md:p-8 space-y-8">
                <div className="flex items-center gap-3 mb-6">
                    <Target className="w-8 h-8 text-primary" />
                    <div>
                        <h1 className="text-2xl font-bold">Central de Metas</h1>
                        <p className="text-muted-foreground">Configure metas para todas as áreas da empresa.</p>
                    </div>
                </div>

                <Tabs defaultValue="global" className="space-y-6">
                    <TabsList className="grid grid-cols-5 w-full max-w-3xl">
                        <TabsTrigger value="global" className="gap-2"><DollarSign className="w-4 h-4" /> Global</TabsTrigger>
                        <TabsTrigger value="traffic" className="gap-2"><MousePointer className="w-4 h-4" /> Tráfego</TabsTrigger>
                        <TabsTrigger value="marketing" className="gap-2"><Megaphone className="w-4 h-4" /> Marketing</TabsTrigger>
                        <TabsTrigger value="sales" className="gap-2"><TrendingUp className="w-4 h-4" /> Comercial</TabsTrigger>
                        <TabsTrigger value="clients" className="gap-2"><Users className="w-4 h-4" /> Leads</TabsTrigger>
                    </TabsList>

                    {/* GLOBAL GOALS */}
                    <TabsContent value="global">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <DollarSign className="w-5 h-5 text-primary" />
                                    Metas Globais da Empresa
                                </CardTitle>
                                <CardDescription>Objetivos gerais de receita, vendas e aquisição de clientes</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <MetricInputGroup
                                    columns={3}
                                    metrics={[
                                        { label: 'Meta de Faturamento', key: 'revenue', type: 'currency' },
                                        { label: 'Meta de Vendas (qtd)', key: 'sales_count', type: 'number' },
                                        { label: 'Ticket Médio Ideal', key: 'avg_ticket', type: 'currency' },
                                        { label: 'Meta de Leads', key: 'leads', type: 'number' },
                                        { label: 'Meta de MQLs', key: 'mqls', type: 'number' },
                                        { label: 'Meta de Novos Clientes', key: 'clients', type: 'number' },
                                    ]}
                                    values={globalGoals}
                                    onChange={(key, value) => setGlobalGoals({ ...globalGoals, [key]: value })}
                                />
                                <Button onClick={() => saveGoals('global', globalGoals)} disabled={isSaving} className="gap-2">
                                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                    Salvar Metas Globais
                                </Button>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* TRAFFIC GOALS */}
                    <TabsContent value="traffic">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <MousePointer className="w-5 h-5 text-cyan-500" />
                                    Metas de Tráfego Pago
                                </CardTitle>
                                <CardDescription>Objetivos de performance de campanhas de anúncios</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-4">
                                    <h4 className="font-medium text-foreground">Investimento e Custos</h4>
                                    <MetricInputGroup
                                        columns={4}
                                        metrics={[
                                            { label: 'Orçamento', key: 'investment', type: 'currency', description: 'Budget mensal' },
                                            { label: 'CPL Máximo', key: 'cpl', type: 'currency', description: 'Custo por Lead' },
                                            { label: 'CPA Máximo', key: 'cpa', type: 'currency', description: 'Custo por Aquisição' },
                                            { label: 'CPM Máximo', key: 'cpm', type: 'currency', description: 'Custo por Mil' },
                                        ]}
                                        values={trafficGoals}
                                        onChange={(key, value) => setTrafficGoals({ ...trafficGoals, [key]: value })}
                                    />
                                </div>
                                <div className="space-y-4">
                                    <h4 className="font-medium text-foreground">Volume</h4>
                                    <MetricInputGroup
                                        columns={3}
                                        metrics={[
                                            { label: 'Meta de Impressões', key: 'impressions', type: 'number' },
                                            { label: 'Meta de Cliques', key: 'clicks', type: 'number' },
                                            { label: 'Meta de Pageviews', key: 'pageviews', type: 'number' },
                                        ]}
                                        values={trafficGoals}
                                        onChange={(key, value) => setTrafficGoals({ ...trafficGoals, [key]: value })}
                                    />
                                </div>
                                <div className="space-y-4">
                                    <h4 className="font-medium text-foreground">Taxas de Conversão</h4>
                                    <MetricInputGroup
                                        columns={4}
                                        metrics={[
                                            { label: 'CTR Mínimo', key: 'ctr', type: 'percent', description: 'Click-through rate' },
                                            { label: 'Connect Rate', key: 'connect_rate', type: 'percent', description: 'Clicks → Pageview' },
                                            { label: 'Sales Rate', key: 'sales_rate', type: 'percent', description: 'Pageview → Venda' },
                                            { label: 'ROAS Mínimo', key: 'roas', type: 'number', description: 'Retorno sobre Ad Spend' },
                                        ]}
                                        values={trafficGoals}
                                        onChange={(key, value) => setTrafficGoals({ ...trafficGoals, [key]: value })}
                                    />
                                </div>
                                <Button onClick={() => saveGoals('traffic', trafficGoals)} disabled={isSaving} className="gap-2">
                                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                    Salvar Metas de Tráfego
                                </Button>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* MARKETING GOALS */}
                    <TabsContent value="marketing">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Megaphone className="w-5 h-5 text-purple-500" />
                                    Metas de Marketing
                                </CardTitle>
                                <CardDescription>Objetivos de geração de leads e qualificação</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-4">
                                    <h4 className="font-medium text-foreground">Orçamento e Custos</h4>
                                    <MetricInputGroup
                                        columns={3}
                                        metrics={[
                                            { label: 'Budget Total', key: 'budget', type: 'currency' },
                                            { label: 'CPL Máximo', key: 'cpl', type: 'currency' },
                                            { label: 'ROAS Mínimo', key: 'roas', type: 'number' },
                                        ]}
                                        values={marketingGoals}
                                        onChange={(key, value) => setMarketingGoals({ ...marketingGoals, [key]: value })}
                                    />
                                </div>
                                <div className="space-y-4">
                                    <h4 className="font-medium text-foreground">Geração de Leads</h4>
                                    <MetricInputGroup
                                        columns={3}
                                        metrics={[
                                            { label: 'Meta de Leads', key: 'leads', type: 'number' },
                                            { label: 'Meta de MQLs', key: 'mqls', type: 'number' },
                                            { label: 'Taxa de Conversão', key: 'conversion_rate', type: 'percent', description: 'Lead → MQL' },
                                        ]}
                                        values={marketingGoals}
                                        onChange={(key, value) => setMarketingGoals({ ...marketingGoals, [key]: value })}
                                    />
                                </div>
                                <div className="space-y-4">
                                    <h4 className="font-medium text-foreground">Demonstrações</h4>
                                    <MetricInputGroup
                                        columns={2}
                                        metrics={[
                                            { label: 'Demos Agendadas', key: 'demos_scheduled', type: 'number' },
                                            { label: 'Demos Realizadas', key: 'demos_completed', type: 'number' },
                                        ]}
                                        values={marketingGoals}
                                        onChange={(key, value) => setMarketingGoals({ ...marketingGoals, [key]: value })}
                                    />
                                </div>
                                <Button onClick={() => saveGoals('marketing', marketingGoals)} disabled={isSaving} className="gap-2">
                                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                    Salvar Metas de Marketing
                                </Button>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* SALES GOALS */}
                    <TabsContent value="sales">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <TrendingUp className="w-5 h-5 text-emerald-500" />
                                    Metas Comerciais (Por Consultor)
                                </CardTitle>
                                <CardDescription>Defina metas individuais para cada membro da equipe comercial</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="rounded-md border overflow-hidden">
                                    <table className="w-full text-sm">
                                        <thead className="bg-muted">
                                            <tr>
                                                <th className="p-3 text-left font-medium">Consultor</th>
                                                <th className="p-3 text-center font-medium">Meta Faturamento (R$)</th>
                                                <th className="p-3 text-center font-medium">Meta Demos</th>
                                                <th className="p-3 text-center font-medium">Meta Conversões</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {salesGoals.length === 0 ? (
                                                <tr>
                                                    <td colSpan={4} className="p-4 text-center text-muted-foreground">
                                                        Nenhum consultor encontrado. Adicione usuários com cargo de Consultor, Closer ou SDR.
                                                    </td>
                                                </tr>
                                            ) : (
                                                salesGoals.map((person, index) => (
                                                    <tr key={index} className="border-t">
                                                        <td className="p-3 font-medium">{person.name}</td>
                                                        <td className="p-3 text-center">
                                                            <Input
                                                                type="number"
                                                                className="w-32 mx-auto text-center"
                                                                value={person.revenue}
                                                                onChange={(e) => {
                                                                    const newGoals = [...salesGoals];
                                                                    newGoals[index].revenue = Number(e.target.value);
                                                                    setSalesGoals(newGoals);
                                                                }}
                                                            />
                                                        </td>
                                                        <td className="p-3 text-center">
                                                            <Input
                                                                type="number"
                                                                className="w-24 mx-auto text-center"
                                                                value={person.demos}
                                                                onChange={(e) => {
                                                                    const newGoals = [...salesGoals];
                                                                    newGoals[index].demos = Number(e.target.value);
                                                                    setSalesGoals(newGoals);
                                                                }}
                                                            />
                                                        </td>
                                                        <td className="p-3 text-center">
                                                            <Input
                                                                type="number"
                                                                className="w-24 mx-auto text-center"
                                                                value={person.conversions}
                                                                onChange={(e) => {
                                                                    const newGoals = [...salesGoals];
                                                                    newGoals[index].conversions = Number(e.target.value);
                                                                    setSalesGoals(newGoals);
                                                                }}
                                                            />
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                                <Button onClick={handleSaveSales} disabled={isSaving} className="gap-2">
                                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                    Salvar Metas Comerciais
                                </Button>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* LEADS/CLIENTS SUMMARY */}
                    <TabsContent value="clients">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Users className="w-5 h-5 text-blue-500" />
                                    Resumo de Metas de Leads e Clientes
                                </CardTitle>
                                <CardDescription>Visualização consolidada das metas definidas nas outras abas</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                    <div className="bg-secondary/50 p-4 rounded-lg">
                                        <p className="text-sm text-muted-foreground">Meta de Leads (Global)</p>
                                        <p className="text-2xl font-bold">{globalGoals.leads}</p>
                                    </div>
                                    <div className="bg-secondary/50 p-4 rounded-lg">
                                        <p className="text-sm text-muted-foreground">Meta de Leads (Marketing)</p>
                                        <p className="text-2xl font-bold">{marketingGoals.leads}</p>
                                    </div>
                                    <div className="bg-secondary/50 p-4 rounded-lg">
                                        <p className="text-sm text-muted-foreground">Meta de MQLs</p>
                                        <p className="text-2xl font-bold">{globalGoals.mqls}</p>
                                    </div>
                                    <div className="bg-secondary/50 p-4 rounded-lg">
                                        <p className="text-sm text-muted-foreground">Meta de Novos Clientes</p>
                                        <p className="text-2xl font-bold">{globalGoals.clients}</p>
                                    </div>
                                    <div className="bg-secondary/50 p-4 rounded-lg">
                                        <p className="text-sm text-muted-foreground">CPL Máximo (Tráfego)</p>
                                        <p className="text-2xl font-bold">R$ {trafficGoals.cpl}</p>
                                    </div>
                                    <div className="bg-secondary/50 p-4 rounded-lg">
                                        <p className="text-sm text-muted-foreground">CPL Máximo (Marketing)</p>
                                        <p className="text-2xl font-bold">R$ {marketingGoals.cpl}</p>
                                    </div>
                                    <div className="bg-secondary/50 p-4 rounded-lg">
                                        <p className="text-sm text-muted-foreground">Demos Agendadas</p>
                                        <p className="text-2xl font-bold">{marketingGoals.demos_scheduled}</p>
                                    </div>
                                    <div className="bg-secondary/50 p-4 rounded-lg">
                                        <p className="text-sm text-muted-foreground">Demos Realizadas</p>
                                        <p className="text-2xl font-bold">{marketingGoals.demos_completed}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </MainLayout>
    );
}
