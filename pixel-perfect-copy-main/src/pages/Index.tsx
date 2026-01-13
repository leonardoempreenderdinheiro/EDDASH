import { MainLayout } from "@/components/layout/MainLayout";
import { useCompany } from "@/contexts/FilterContext";
import { useProfiles } from "@/hooks/useProfiles";
import { useCommissions } from "@/hooks/useCommissions";
import { useLeads } from "@/hooks/useLeads";
import { useTrafficAds } from "@/hooks/useTrafficAds";
import { KpiCard, DashboardSection } from "@/components/dashboard/DashboardComponents";
import {
  TrendingUp, Users, DollarSign, Target,
  BarChart3, PieChart, Activity, ShoppingBag,
  Megaphone, Briefcase, Trophy, ArrowRight, Video, Image, FileText, MousePointer2,
  PieChart as PieChartIcon
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, Cell, Legend, Pie, PieChart } from 'recharts';
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { BadgeStatus } from "@/components/ui/badge-status";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

// Mock historical data generator
const generateHistory = (currentValue: number, months = 6) => {
  return Array.from({ length: months }).map((_, i) => ({
    name: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'][i],
    value: Math.floor(currentValue * (0.5 + Math.random() * 0.5))
  }));
};

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const Dashboard = () => {
  const { selectedCompany } = useCompany();
  const { data: profiles } = useProfiles();
  const { data: commissions } = useCommissions();
  const { data: leads } = useLeads();
  const { data: ads } = useTrafficAds();
  // 1. SALES
  const totalCommissions = commissions?.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0) || 0;

  // DYNAMIC REVENUE CALCULATION (Based on Sector's Real Data)
  // Logic: Sum of Commissions.
  const revenue = totalCommissions;

  const salesGrowth = "+12.5%"; // Keep as placeholder or calculate if historical data available

  // 2. MARKETING DEEP DIVE
  const totalLeads = leads?.length || 0;
  const totalInvestedAds = ads?.reduce((acc, curr) => acc + (Number(curr.valor_investido) || 0), 0) || 0;

  // Best Performing Creative Logic
  const bestCreative = ads?.length ? ads.reduce((prev, current) => {
    return ((prev.conversoes || 0) > (current.conversoes || 0)) ? prev : current;
  }, ads[0]) : null;

  // Lead Origin Breakdown
  const leadOriginData = [
    { name: 'Meta Ads', value: leads?.filter(l => l.utm_source?.includes('facebook') || l.utm_source?.includes('instagram')).length || 0 },
    { name: 'Google Ads', value: leads?.filter(l => l.utm_source?.includes('google')).length || 0 },
    { name: 'LinkedIn', value: leads?.filter(l => l.utm_source?.includes('linkedin')).length || 0 },
    { name: 'Indicação/Org', value: leads?.filter(l => !l.utm_source).length || 0 },
  ];

  // 3. MANAGEMENT
  const totalConsultants = profiles?.length || 0;
  const activeConsultants = profiles?.filter(p => (p.status as string) === 'active' || (p.status as string) === 'ativo').length || 0;

  // Real Lead List Preview
  const recentLeads = leads?.slice(0, 5) || [];

  const formatMoney = (val: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(val);

  const getTitle = () => {
    switch (selectedCompany) {
      case 'consolidado': return "ED Holding - Visão Consolidada";
      case 'seguros': return "ED Seguros - Performance";
      case 'capital': return "ED Capital - Performance";
      case 'techfinance': return "TechFinance - Performance";
      default: return "Dashboard";
    }
  };

  const salesData = generateHistory(revenue);

  return (
    <MainLayout title={getTitle()} subtitle="Monitoramento Estratégico & Deep Analytics">
      <DashboardHeader
        title={getTitle()}
        subtitle="Monitoramento Estratégico & Deep Analytics"
        exportData={leads}
        exportFileName="dashboard_overview"
      />

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 lg:w-[400px]">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="sales">Vendas</TabsTrigger>
          <TabsTrigger value="marketing">Marketing</TabsTrigger>
          <TabsTrigger value="management">Gestão</TabsTrigger>
        </TabsList>

        {/* OVERVIEW TAB */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <KpiCard title="Faturamento Total" value={formatMoney(revenue)} change={salesGrowth} positive={true} icon={DollarSign} />
            <KpiCard title="Investimento Ad" value={formatMoney(totalInvestedAds)} change="+10%" positive={false} icon={Megaphone} />
            <KpiCard title="Total Leads" value={totalLeads.toString()} change="+24%" positive={true} icon={Users} />
            <KpiCard title="Melhor Canal" value="Meta Ads" change="45%" positive={true} icon={Trophy} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Revenue Chart */}
            <div className="lg:col-span-2 bg-card p-6 rounded-xl border border-border">
              <h3 className="text-lg font-semibold mb-4">Evolução do Faturamento</h3>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={salesData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
                    <YAxis stroke="hsl(var(--muted-foreground))" tickFormatter={(val) => `R$ ${val / 1000}k`} />
                    <RechartsTooltip
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }}
                      formatter={(value: number) => formatMoney(value)}
                    />
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                    <Area type="monotone" dataKey="value" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorRev)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Top Performer Spotlight */}
            <div className="bg-card p-6 rounded-xl border border-border">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Trophy className="h-5 w-5 text-amber-500" /> Destaque do Mês
              </h3>
              <div className="space-y-4">
                <div className="p-4 bg-secondary/30 rounded-lg">
                  <p className="text-xs text-muted-foreground uppercase font-bold">Criativo Vencedor</p>
                  <div className="flex items-center gap-3 mt-2">
                    <Video className="h-8 w-8 text-blue-500" />
                    <div>
                      <p className="font-medium text-sm">Video Depoimento - Família</p>
                      <p className="text-xs text-green-500 font-bold">92 Conversões</p>
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-secondary/30 rounded-lg">
                  <p className="text-xs text-muted-foreground uppercase font-bold">Melhor Consultor</p>
                  <div className="flex items-center gap-3 mt-2">
                    <div className="h-8 w-8 rounded-full bg-emerald-600 flex items-center justify-center text-white text-xs font-bold">RS</div>
                    <div>
                      <p className="font-medium text-sm">Roberto Silva</p>
                      <p className="text-xs text-green-500 font-bold">R$ 145k em Vendas</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* VENDAS TAB */}
        <TabsContent value="sales" className="space-y-6">
          <DashboardSection title="Análise Profunda de Vendas">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Funnel Chart */}
              <div className="bg-card p-6 rounded-xl border border-border col-span-2">
                <h3 className="text-lg font-semibold mb-6">Funil de Vendas Detalhado</h3>
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={[
                      { name: 'Lead', value: 2500, fill: '#60a5fa' },
                      { name: 'Qualificado', value: 850, fill: '#3b82f6' },
                      { name: 'Reunião', value: 420, fill: '#2563eb' },
                      { name: 'Proposta', value: 180, fill: '#1d4ed8' },
                      { name: 'Fechamento', value: 85, fill: '#1e40af' },
                    ]} barSize={40}>
                      <XAxis type="number" hide />
                      <RechartsTooltip contentStyle={{ backgroundColor: 'hsl(var(--card))' }} cursor={{ fill: 'transparent' }} />
                      <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                        {[1, 2, 3, 4, 5].map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={['#60a5fa', '#3b82f6', '#2563eb', '#1d4ed8', '#1e40af'][index]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Product Mix */}
              <div className="bg-card p-6 rounded-xl border border-border">
                <h3 className="text-lg font-semibold mb-6">Mix de Produtos</h3>
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Seguro Vida', value: 45 },
                          { name: 'Investimentos', value: 30 },
                          { name: 'Previdência', value: 15 },
                          { name: 'Consórcio', value: 10 },
                        ]}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {COLORS.map((color, index) => (
                          <Cell key={`cell-${index}`} fill={color} />
                        ))}
                      </Pie>
                      <RechartsTooltip contentStyle={{ backgroundColor: 'hsl(var(--card))' }} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </DashboardSection>
        </TabsContent>

        {/* MARKETING TAB - DEEP DIVE */}
        <TabsContent value="marketing" className="space-y-6">
          <DashboardSection title="Deep Dive: Performance de Criativos">

            {/* Best Creative Highlight */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="bg-gradient-to-br from-indigo-900 to-slate-900 p-6 rounded-xl border border-indigo-500/30 text-white col-span-2">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-bold mb-1">Criativo Vencedor: {bestCreative?.ad_name || 'N/A'}</h3>
                    <p className="text-indigo-200 text-sm mb-4">Campanha: {bestCreative?.campanha}</p>
                  </div>
                  <Trophy className="h-8 w-8 text-yellow-400" />
                </div>

                <div className="grid grid-cols-4 gap-4 mt-4">
                  <div>
                    <p className="text-xs text-indigo-300">CTR</p>
                    <p className="text-xl font-bold">{bestCreative?.ctr}%</p>
                  </div>
                  <div>
                    <p className="text-xs text-indigo-300">Conversões</p>
                    <p className="text-xl font-bold">{bestCreative?.conversoes}</p>
                  </div>
                  <div>
                    <p className="text-xs text-indigo-300">CPA</p>
                    <p className="text-xl font-bold">R$ {bestCreative?.custo_conversao}</p>
                  </div>
                  <div>
                    <p className="text-xs text-indigo-300">Investido</p>
                    <p className="text-xl font-bold">R$ {bestCreative?.valor_investido}</p>
                  </div>
                </div>
              </div>

              {/* Channel Performance */}
              <div className="bg-card p-6 rounded-xl border border-border">
                <h3 className="text-lg font-semibold mb-4">Leads por Canal</h3>
                <div className="h-[150px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart layout="vertical" data={leadOriginData} margin={{ left: 20 }}>
                      <XAxis type="number" hide />
                      <YAxis dataKey="name" type="category" width={80} tick={{ fontSize: 11 }} />
                      <RechartsTooltip contentStyle={{ backgroundColor: 'hsl(var(--card))' }} />
                      <Bar dataKey="value" fill="#8884d8" radius={[0, 4, 4, 0]} barSize={20} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* ADS TABLE MOCK */}
            <div className="bg-card rounded-xl border border-border overflow-hidden">
              <div className="p-4 border-b border-border bg-muted/30">
                <h3 className="font-semibold flex items-center gap-2">
                  <MousePointer2 className="h-4 w-4" /> Performance por Anúncio (Top 5)
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50 text-left">
                    <tr>
                      <th className="p-3">Anúncio</th>
                      <th className="p-3">Impressões</th>
                      <th className="p-3">CTR</th>
                      <th className="p-3">Conv.</th>
                      <th className="p-3">CPA</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ads?.slice(0, 5).map((ad, i) => (
                      <tr key={i} className="border-b border-border last:border-0 hover:bg-muted/10">
                        <td className="p-3 font-medium flex items-center gap-2">
                          {ad.id === bestCreative?.id && <Trophy className="h-3 w-3 text-yellow-500" />}
                          {ad.ad_name || ad.id}
                        </td>
                        <td className="p-3">{new Intl.NumberFormat('pt-BR').format(ad.impressoes || 0)}</td>
                        <td className="p-3 text-blue-500 font-bold">{ad.ctr}%</td>
                        <td className="p-3">{ad.conversoes}</td>
                        <td className="p-3 text-green-600">R$ {ad.custo_conversao}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </DashboardSection>
        </TabsContent>

        {/* GESTÃO TAB */}
        <TabsContent value="management" className="space-y-6">
          <DashboardSection title="Real-Time Leads Feed">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="col-span-2 bg-card rounded-xl border border-border overflow-hidden">
                <div className="p-4 border-b border-border flex justify-between items-center">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Users className="h-4 w-4" /> Últimos Leads (Tempo Real)
                  </h3>
                  <span className="text-xs bg-green-500/10 text-green-500 px-2 py-1 rounded-full animate-pulse">Live</span>
                </div>
                <div className="divide-y divide-border">
                  {leads?.slice(0, 8).map(lead => (
                    <div key={lead.id} className="p-4 flex items-center justify-between hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs font-bold">
                          {lead.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{lead.name}</p>
                          <p className="text-xs text-muted-foreground">{lead.email} • {lead.phone}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="hidden md:block text-right">
                          <p className="text-xs font-medium text-foreground">{lead.utm_source || 'Direto'}</p>
                          <p className="text-[10px] text-muted-foreground">{lead.utm_campaign || '-'}</p>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs font-medium
                                            ${(lead as any).meeting_status === 'Quente' ? 'bg-red-100 text-red-700' :
                            (lead as any).meeting_status === 'Cliente' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'}`}>
                          {(lead as any).meeting_status || 'Novo'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-card p-6 rounded-xl border border-border h-fit">
                <h3 className="text-lg font-semibold mb-4">Status da Equipe</h3>
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Meta Mensal</span>
                      <span className="font-bold">78%</span>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <div className="h-full bg-primary w-[78%]" />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Retenção de Consultores</span>
                      <span className="font-bold">95%</span>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 w-[95%]" />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>NPS Clientes</span>
                      <span className="font-bold">72</span>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 w-[72%]" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </DashboardSection>
        </TabsContent>

      </Tabs>
    </MainLayout>
  );
};


export default Dashboard;
