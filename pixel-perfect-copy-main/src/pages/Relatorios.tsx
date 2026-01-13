import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Users, Shield, DollarSign, TrendingUp, FileText, Download, Loader2, Megaphone, Target } from "lucide-react";
import { useProfiles } from "@/hooks/useProfiles";
import { useInsurances } from "@/hooks/useInsurances";
import { useCommissions } from "@/hooks/useCommissions";
import { useLeads } from "@/hooks/useLeads";
import { useClients } from "@/hooks/useClients";
import { useTrafficAds } from "@/hooks/useTrafficAds";
import { toast } from "sonner";
import {
  exportToExcel,
  exportToPDF,
  generateConsultantsReport,
  generateSalesReport,
  generateCommissionsReport,
  generateLeadsReport,
  generateClientsReport,
  generateTrafficReport,
  formatCurrency,
} from "@/utils/reportUtils";

const Relatorios = () => {
  // Fetch all data
  const { data: profiles, isLoading: loadingProfiles } = useProfiles();
  const { data: insurances, isLoading: loadingInsurances } = useInsurances();
  const { data: commissions, isLoading: loadingCommissions } = useCommissions();
  const { data: leads, isLoading: loadingLeads } = useLeads();
  const { data: clients, isLoading: loadingClients } = useClients();
  const { data: trafficAds, isLoading: loadingTraffic } = useTrafficAds();

  const isLoading = loadingProfiles || loadingInsurances || loadingCommissions || loadingLeads || loadingClients || loadingTraffic;

  // Report definitions
  const reports = [
    {
      id: 'consultores',
      icon: Users,
      title: "Relatório de Consultores",
      description: "Lista completa de consultores com cargo e status",
      iconBg: "bg-primary/20 text-primary",
      data: profiles,
      generator: generateConsultantsReport,
      count: profiles?.length || 0,
    },
    {
      id: 'vendas',
      icon: Shield,
      title: "Relatório de Vendas de Seguros",
      description: "Detalhamento de todas as vendas de seguros do período",
      iconBg: "bg-emerald-500/20 text-emerald-600",
      data: insurances,
      generator: generateSalesReport,
      count: insurances?.length || 0,
    },
    {
      id: 'comissoes',
      icon: DollarSign,
      title: "Relatório de Comissões",
      description: "Comissões por consultor, tipo e nível da rede",
      iconBg: "bg-amber-500/20 text-amber-600",
      data: commissions,
      generator: generateCommissionsReport,
      count: commissions?.length || 0,
    },
    {
      id: 'leads',
      icon: Target,
      title: "Relatório de Leads",
      description: "Leads capturados com origem e status",
      iconBg: "bg-blue-500/20 text-blue-600",
      data: leads,
      generator: generateLeadsReport,
      count: leads?.length || 0,
    },
    {
      id: 'clientes',
      icon: FileText,
      title: "Relatório de Clientes",
      description: "Lista de clientes com perfil e patrimônio",
      iconBg: "bg-purple-500/20 text-purple-600",
      data: clients,
      generator: generateClientsReport,
      count: clients?.length || 0,
    },
    {
      id: 'trafego',
      icon: Megaphone,
      title: "Relatório de Tráfego Pago",
      description: "Performance de campanhas e anúncios",
      iconBg: "bg-rose-500/20 text-rose-600",
      data: trafficAds,
      generator: generateTrafficReport,
      count: trafficAds?.length || 0,
    },
  ];

  const handleExport = (report: typeof reports[0], format: 'excel' | 'pdf') => {
    if (!report.data || report.data.length === 0) {
      toast.error('Não há dados para exportar');
      return;
    }

    try {
      const reportData = report.generator(report.data);
      const fileName = `relatorio_${report.id}_${new Date().toISOString().split('T')[0]}`;

      if (format === 'excel') {
        exportToExcel(reportData, fileName);
        toast.success(`${report.title} exportado para Excel`);
      } else {
        exportToPDF(reportData, fileName);
        toast.success(`${report.title} exportado para PDF`);
      }
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Erro ao exportar relatório');
    }
  };

  // Calculate summary stats
  const totalConsultores = profiles?.filter(p => p.status === 'active').length || 0;
  const totalVendas = insurances?.filter(i => i.status === 'ativo').length || 0;
  const totalComissoes = commissions?.reduce((sum, c) => sum + (c.amount || 0), 0) || 0;
  const totalReceita = insurances?.reduce((sum, i) => sum + (i.premium_value || 0), 0) || 0;

  return (
    <MainLayout title="Relatórios" subtitle="Exporte dados e análises da plataforma">
      {/* Period Selector */}
      <div className="flex items-center gap-3 mb-6">
        <Button variant="outline" className="gap-2">
          <Calendar className="w-4 h-4" />
          Dezembro 2024
        </Button>
        <Button variant="outline" disabled>Alterar Período</Button>
        {isLoading && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin" />
            Carregando dados...
          </div>
        )}
      </div>

      {/* Report Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {reports.map((report) => (
          <Card key={report.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className={`w-10 h-10 rounded-lg ${report.iconBg} flex items-center justify-center`}>
                  <report.icon className="w-5 h-5" />
                </div>
                <span className="text-sm text-muted-foreground">
                  {report.count} registros
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <CardTitle className="text-base mb-2">{report.title}</CardTitle>
              <p className="text-sm text-muted-foreground mb-4">{report.description}</p>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1 gap-2"
                  onClick={() => handleExport(report, 'excel')}
                  disabled={!report.data || report.data.length === 0}
                >
                  <Download className="w-4 h-4" />
                  Excel
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 gap-2"
                  onClick={() => handleExport(report, 'pdf')}
                  disabled={!report.data || report.data.length === 0}
                >
                  <Download className="w-4 h-4" />
                  PDF
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Period Summary */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-4">Resumo do Período</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-5">
              <p className="text-sm text-muted-foreground mb-2">Consultores Ativos</p>
              <p className="text-3xl font-bold text-foreground">{totalConsultores}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-5">
              <p className="text-sm text-muted-foreground mb-2">Vendas Ativas</p>
              <p className="text-3xl font-bold text-foreground">{totalVendas}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-5">
              <p className="text-sm text-muted-foreground mb-2">Total Comissões</p>
              <p className="text-3xl font-bold text-primary">{formatCurrency(totalComissoes)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-5">
              <p className="text-sm text-muted-foreground mb-2">Receita Premium</p>
              <p className="text-3xl font-bold text-primary">{formatCurrency(totalReceita)}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default Relatorios;
