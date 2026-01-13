import { MainLayout } from "@/components/layout/MainLayout";
import { BadgeStatus } from "@/components/ui/badge-status";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Filter, Download } from "lucide-react";
import { useLeads } from "@/hooks/useLeads";
import { format } from "date-fns";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis } from "recharts";

const Leads = () => {
    const { data: leads, isLoading, error } = useLeads();

    if (isLoading) {
        return (
            <MainLayout title="Leads" subtitle="Gerencie seus leads capturados">
                <div className="flex items-center justify-center h-64">
                    <p className="text-muted-foreground">Carregando leads...</p>
                </div>
            </MainLayout>
        );
    }

    if (error) {
        return (
            <MainLayout title="Leads" subtitle="Gerencie seus leads capturados">
                <div className="flex items-center justify-center h-64">
                    <div className="flex flex-col items-center gap-2">
                        <p className="text-red-500">Erro ao carregar leads.</p>
                        <p className="text-sm text-muted-foreground">{error instanceof Error ? error.message : JSON.stringify(error)}</p>
                    </div>
                </div>
            </MainLayout>
        );
    }

    return (
        <MainLayout title="Leads" subtitle="Gerencie seus leads capturados">
            {/* Search and Actions */}
            <div className="flex items-center justify-between mb-6">
                <div className="relative w-80">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input placeholder="Buscar por nome, email ou telefone..." className="pl-9 bg-secondary border-border" />
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" className="gap-2">
                        <Filter className="w-4 h-4" />
                        Filtros
                    </Button>
                    <Button variant="outline" className="gap-2">
                        <Download className="w-4 h-4" />
                        Exportar
                    </Button>
                </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="bg-card p-6 rounded-xl border border-border">
                    <h3 className="text-lg font-semibold mb-4">Leads por Etapa do Funil</h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={[
                                        { name: 'Novo', value: leads?.filter(l => l.funil === 'Novo').length || 0 },
                                        { name: 'Em Andamento', value: leads?.filter(l => l.funil === 'Em Andamento').length || 0 },
                                        { name: 'Quente', value: leads?.filter(l => l.funil === 'Quente').length || 0 },
                                        { name: 'Frio', value: leads?.filter(l => l.funil === 'Frio').length || 0 },
                                    ]}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    <Cell key="cell-0" fill="hsl(var(--primary))" />
                                    <Cell key="cell-1" fill="hsl(var(--chart-2))" />
                                    <Cell key="cell-2" fill="hsl(var(--chart-3))" />
                                    <Cell key="cell-3" fill="hsl(var(--muted))" />
                                </Pie>
                                <Tooltip
                                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }}
                                    itemStyle={{ color: 'hsl(var(--foreground))' }}
                                />
                                <Legend verticalAlign="bottom" height={36} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
                <div className="bg-card p-6 rounded-xl border border-border">
                    <h3 className="text-lg font-semibold mb-4">Leads por Origem (UTM Source)</h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={Object.entries(leads?.reduce((acc: any, curr) => {
                                    const source = curr.utm_source || 'Desconhecido';
                                    acc[source] = (acc[source] || 0) + 1;
                                    return acc;
                                }, {}) || {}).map(([name, value]) => ({ name, value }))}
                                layout="vertical"
                                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                            >
                                <XAxis type="number" hide />
                                <YAxis dataKey="name" type="category" width={100} tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                                <Tooltip
                                    cursor={{ fill: 'transparent' }}
                                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }}
                                    itemStyle={{ color: 'hsl(var(--foreground))' }}
                                />
                                <Bar dataKey="value" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-card rounded-xl border border-border overflow-hidden overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-border">
                            <th className="text-left py-4 px-4 font-medium text-muted-foreground whitespace-nowrap">Data</th>
                            <th className="text-left py-4 px-4 font-medium text-muted-foreground whitespace-nowrap">Nome</th>
                            <th className="text-left py-4 px-4 font-medium text-muted-foreground whitespace-nowrap">Email</th>
                            <th className="text-left py-4 px-4 font-medium text-muted-foreground whitespace-nowrap">Telefone</th>
                            <th className="text-left py-4 px-4 font-medium text-muted-foreground whitespace-nowrap">Funil</th>
                            <th className="text-left py-4 px-4 font-medium text-muted-foreground whitespace-nowrap">Origem (UTM)</th>
                            <th className="text-left py-4 px-4 font-medium text-muted-foreground whitespace-nowrap">Campanha</th>
                        </tr>
                    </thead>
                    <tbody>
                        {leads?.map((lead) => (
                            <tr key={lead.id} className="border-b border-border last:border-0 hover:bg-secondary/50 transition-colors">
                                <td className="py-4 px-4 whitespace-nowrap">
                                    {lead.date ? format(new Date(lead.date), "dd/MM/yyyy HH:mm") : "-"}
                                </td>
                                <td className="py-4 px-4 font-medium text-foreground whitespace-nowrap">{lead.name || "-"}</td>
                                <td className="py-4 px-4 text-muted-foreground whitespace-nowrap">{lead.email || "-"}</td>
                                <td className="py-4 px-4 text-muted-foreground whitespace-nowrap">{lead.phone || "-"}</td>
                                <td className="py-4 px-4 whitespace-nowrap">
                                    <BadgeStatus variant="ativo">
                                        {lead.funil || "-"}
                                    </BadgeStatus>
                                </td>
                                <td className="py-4 px-4 text-muted-foreground whitespace-nowrap">{lead.utm_source || "-"}</td>
                                <td className="py-4 px-4 text-muted-foreground whitespace-nowrap">{lead.utm_campaign || "-"}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </MainLayout>
    );
};

export default Leads;
