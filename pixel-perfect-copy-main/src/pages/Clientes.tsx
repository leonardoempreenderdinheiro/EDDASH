
import { MainLayout } from "@/components/layout/MainLayout";
import { BadgeStatus } from "@/components/ui/badge-status";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Plus, Mail, Phone, MoreHorizontal, DollarSign, Star, TrendingUp, Clock } from "lucide-react";
import { useClients } from "@/hooks/useClients";
import { useInsurances } from "@/hooks/useInsurances";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { useState, useMemo } from "react";
import { useFilters } from "@/contexts/FilterContext";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { differenceInDays } from "date-fns";

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
};

// RFV Scoring Helper
const calculateRFV = (clientId: string, insurances: any[]) => {
  const clientInsurances = insurances?.filter(i => i.client_id === clientId) || [];

  // Recency: Days since last purchase (lower is better)
  const lastPurchase = clientInsurances
    .map(i => new Date(i.start_date || i.created_at || '2000-01-01'))
    .sort((a, b) => b.getTime() - a.getTime())[0];
  const recencyDays = lastPurchase ? differenceInDays(new Date(), lastPurchase) : 999;

  // Frequency: Number of purchases
  const frequency = clientInsurances.length;

  // Value: Total spent
  const totalValue = clientInsurances.reduce((acc, i) => acc + Number(i.premium_value || 0), 0);

  // Scoring (1-5, higher is better)
  const recencyScore = recencyDays <= 30 ? 5 : recencyDays <= 90 ? 4 : recencyDays <= 180 ? 3 : recencyDays <= 365 ? 2 : 1;
  const frequencyScore = frequency >= 5 ? 5 : frequency >= 3 ? 4 : frequency >= 2 ? 3 : frequency >= 1 ? 2 : 1;
  const valueScore = totalValue >= 10000 ? 5 : totalValue >= 5000 ? 4 : totalValue >= 2000 ? 3 : totalValue >= 500 ? 2 : 1;

  const overallScore = Math.round((recencyScore + frequencyScore + valueScore) / 3 * 10) / 10;

  return { recencyDays, frequency, totalValue, recencyScore, frequencyScore, valueScore, overallScore };
};

const Clientes = () => {
  const { data: clientes, isLoading, error } = useClients();
  const { data: insurances } = useInsurances();
  const { dateRange } = useFilters();
  const [searchQuery, setSearchQuery] = useState("");

  const clientesWithRFV = useMemo(() => {
    return clientes?.map(c => ({
      ...c,
      rfv: calculateRFV(c.id, insurances || [])
    })) || [];
  }, [clientes, insurances]);

  const filteredClientes = clientesWithRFV?.filter(c => {
    if (!searchQuery) return true;
    const search = searchQuery.toLowerCase();
    return (
      c.name.toLowerCase().includes(search) ||
      c.email?.toLowerCase().includes(search)
    );
  });

  // RFV Distribution for Chart
  const rfvDistribution = useMemo(() => {
    const champions = filteredClientes.filter(c => c.rfv.overallScore >= 4).length;
    const loyalCustomers = filteredClientes.filter(c => c.rfv.overallScore >= 3 && c.rfv.overallScore < 4).length;
    const atRisk = filteredClientes.filter(c => c.rfv.overallScore >= 2 && c.rfv.overallScore < 3).length;
    const hibernating = filteredClientes.filter(c => c.rfv.overallScore < 2).length;
    return [
      { name: 'Campeões', value: champions, fill: '#10b981' },
      { name: 'Leais', value: loyalCustomers, fill: '#3b82f6' },
      { name: 'Em Risco', value: atRisk, fill: '#f59e0b' },
      { name: 'Hibernando', value: hibernating, fill: '#ef4444' },
    ];
  }, [filteredClientes]);

  if (isLoading) {
    return (
      <MainLayout title="Clientes">
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Carregando clientes...</p>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout title="Clientes">
        <div className="flex items-center justify-center h-64">
          <p className="text-red-500">Erro ao carregar clientes. Tente novamente mais tarde.</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Clientes">
      <div className="p-4 md:p-8 space-y-8">
        <DashboardHeader
          title="Clientes"
          subtitle="Gerencie os clientes da sua rede"
          exportData={filteredClientes}
          exportFileName="clientes_base"
        >
          <div className="flex items-center gap-3">
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome ou email..."
                className="pl-9 bg-secondary/50"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Novo Cliente
            </Button>
          </div>
        </DashboardHeader>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-card rounded-xl border border-border p-4">
            <p className="text-sm text-muted-foreground">Total de Clientes</p>
            <p className="text-2xl font-bold text-foreground">{filteredClientes?.length || 0}</p>
          </div>
          <div className="bg-card rounded-xl border border-border p-4">
            <p className="text-sm text-primary">Clientes Ativos</p>
            <p className="text-2xl font-bold text-primary">
              {filteredClientes?.filter(c => c.status === 'ativo').length || 0}
            </p>
          </div>
          <div className="bg-card rounded-xl border border-border p-4">
            <p className="text-sm text-emerald-500 flex items-center gap-1"><Star className="w-3 h-3" /> Campeões (RFV 4+)</p>
            <p className="text-2xl font-bold text-emerald-500">
              {filteredClientes?.filter(c => c.rfv.overallScore >= 4).length || 0}
            </p>
          </div>
          <div className="bg-card rounded-xl border border-border p-4">
            <p className="text-sm text-red-500 flex items-center gap-1"><Clock className="w-3 h-3" /> Hibernando (RFV &lt; 2)</p>
            <p className="text-2xl font-bold text-red-500">
              {filteredClientes?.filter(c => c.rfv.overallScore < 2).length || 0}
            </p>
          </div>
        </div>

        {/* RFV Charts Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><TrendingUp className="w-5 h-5 text-primary" /> Análise RFV (Recência, Frequência, Valor)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={rfvDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {rfvDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }}
                      itemStyle={{ color: 'hsl(var(--foreground))' }}
                    />
                    <Legend verticalAlign="bottom" height={36} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Perfil do Investidor</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Conservador', value: filteredClientes?.filter(c => c.profile === 'conservador').length || 0 },
                        { name: 'Moderado', value: filteredClientes?.filter(c => c.profile === 'moderado').length || 0 },
                        { name: 'Arrojado', value: filteredClientes?.filter(c => c.profile === 'arrojado').length || 0 },
                      ]}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      <Cell key="cell-0" fill="hsl(var(--chart-1))" />
                      <Cell key="cell-1" fill="hsl(var(--chart-2))" />
                      <Cell key="cell-2" fill="hsl(var(--chart-3))" />
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }}
                      itemStyle={{ color: 'hsl(var(--foreground))' }}
                    />
                    <Legend verticalAlign="bottom" height={36} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Table */}
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-4 px-4 text-sm font-medium text-muted-foreground">Cliente</th>
                  <th className="text-left py-4 px-4 text-sm font-medium text-muted-foreground">Contato</th>
                  <th className="text-left py-4 px-4 text-sm font-medium text-muted-foreground">Consultor</th>
                  <th className="text-center py-4 px-4 text-sm font-medium text-muted-foreground">Score RFV</th>
                  <th className="text-left py-4 px-4 text-sm font-medium text-muted-foreground">Valor Total</th>
                  <th className="text-left py-4 px-4 text-sm font-medium text-muted-foreground">Status</th>
                  <th className="w-10"></th>
                </tr>
              </thead>
              <tbody>
                {filteredClientes?.map((c) => (
                  <tr key={c.id} className="border-b border-border last:border-0 hover:bg-secondary/50 transition-colors">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9 bg-muted">
                          <AvatarFallback className="text-sm bg-muted text-foreground">
                            {c.name.split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-foreground">{c.name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Mail className="w-4 h-4" />
                          {c.email}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Phone className="w-4 h-4" />
                          {c.phone}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <p className="text-foreground">{c.consultant}</p>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className={`font-bold text-lg ${c.rfv.overallScore >= 4 ? 'text-emerald-500' :
                          c.rfv.overallScore >= 3 ? 'text-blue-500' :
                            c.rfv.overallScore >= 2 ? 'text-amber-500' : 'text-red-500'
                        }`}>
                        {c.rfv.overallScore.toFixed(1)}
                      </span>
                      <p className="text-xs text-muted-foreground">
                        R:{c.rfv.recencyScore} F:{c.rfv.frequencyScore} V:{c.rfv.valueScore}
                      </p>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-primary" />
                        <span className="font-medium text-foreground">{formatCurrency(c.rfv.totalValue)}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <BadgeStatus variant={(c.status as any) || "ativo"}>
                        {c.status ? c.status.charAt(0).toUpperCase() + c.status.slice(1) : '-'}
                      </BadgeStatus>
                    </td>
                    <td className="py-4 px-4">
                      <button className="p-2 rounded-lg hover:bg-secondary transition-colors">
                        <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Clientes;
