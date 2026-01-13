import { MainLayout } from "@/components/layout/MainLayout";
import { BadgeStatus } from "@/components/ui/badge-status";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Filter, Download, TrendingUp, DollarSign, ChevronDown, Check, ChevronsUpDown, Calculator, FileText, PieChart as PieChartIcon, ArrowRight } from "lucide-react";
import { useCommissions } from "@/hooks/useCommissions";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { useState, useEffect } from "react";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { MotionCard } from "@/components/ui/motion-card";
import { motion } from "framer-motion";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// --- MOCK DATA ---
const sdrs = [
  { id: "sdr1", name: "Tainá Nascimento", role: "SDR", meta: 140000, realizado: 0, demos: 22 },
  { id: "sdr2", name: "Vitória Guedes", role: "SDR", meta: 140000, realizado: 0, demos: 23 },
  { id: "sdr3", name: "Geovanna Zeni", role: "SDR", meta: 70000, realizado: 0, demos: 4 },
  { id: "sdr4", name: "Maciely Almeida", role: "SDR", meta: 70000, realizado: 0, demos: 3 },
];

const closers = [
  { id: "closer1", name: "João Silva", role: "Closer", meta: 200000, realizado: 45000 },
  { id: "closer2", name: "Maria Oliveira", role: "Closer", meta: 200000, realizado: 80000 },
];

const collaborators = [...sdrs, ...closers];

const Comissoes = () => {
  const { data: comissoes, isLoading } = useCommissions();

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
    <MainLayout title="Gestão de Comissões" subtitle="Simuladores e Histórico de Pagamentos">
      <motion.div
        className="p-4 md:p-8 space-y-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <Tabs defaultValue="simuladores" className="space-y-6">
          <div className="flex items-center justify-between">
            <TabsList className="bg-secondary/50 p-1 rounded-lg">
              <TabsTrigger value="simuladores" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all">
                <Calculator className="w-4 h-4 mr-2" />
                Simuladores & Cálculo
              </TabsTrigger>
              <TabsTrigger value="relatorio" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all">
                <FileText className="w-4 h-4 mr-2" />
                Histórico e Relatórios
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="simuladores" className="space-y-8 animate-in fade-in-50 slide-in-from-bottom-5 duration-500">
            <SimulatorsSection />
          </TabsContent>

          <TabsContent value="relatorio" className="animate-in fade-in-50 slide-in-from-bottom-5 duration-500">
            <CommissionsReport comissoes={comissoes} isLoading={isLoading} />
          </TabsContent>
        </Tabs>
      </motion.div>
    </MainLayout>
  );
};

// --- SIMULATORS SECTION ---
function SimulatorsSection() {
  const [selectedCollabId, setSelectedCollabId] = useState<string>("");
  const [openCombobox, setOpenCombobox] = useState(false);

  // State for Simulators (Lifted up to be controlled by selection)
  const [sdrValues, setSdrValues] = useState({ metaBu: 0, realizadoBu: 0, metaIndiv: 0, realizadoIndiv: 0, demosRealizadas: 0 });
  const [closerValues, setCloserValues] = useState({ metaBu: 0, realizadoBu: 0, metaIndiv: 0, realizadoIndiv: 0, comissaoFaturamento: 0, comissaoAoVivo: 0 });

  const handleSelectCollaborator = (id: string) => {
    const person = collaborators.find(c => c.id === id);
    if (!person) return;

    setSelectedCollabId(id);
    setOpenCombobox(false);

    // Pre-fill logic based on role
    if (person.role === "SDR") {
      const sdr = person as typeof sdrs[0];
      setSdrValues(prev => ({
        ...prev,
        metaIndiv: sdr.meta,
        realizadoIndiv: sdr.realizado,
        demosRealizadas: sdr.demos
      }));
    } else {
      const closer = person as typeof closers[0];
      setCloserValues(prev => ({
        ...prev,
        metaIndiv: closer.meta,
        realizadoIndiv: closer.realizado
      }));
    }
  };

  const selectedPerson = collaborators.find(c => c.id === selectedCollabId);

  return (
    <div className="space-y-8">
      {/* Header / Selector */}
      <MotionCard delay={0.1} className="bg-gradient-to-r from-card to-secondary/10 border-l-4 border-l-primary p-6">
        <div className="flex flex-col md:flex-row items-center gap-6 justify-between">
          <div className="flex-1 space-y-1">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <Calculator className="h-5 w-5 text-primary" />
              Seleção de Colaborador
            </h3>
            <p className="text-sm text-muted-foreground">Selecione um SDR ou Closer para carregar os dados reais no simulador.</p>
          </div>
          <div className="w-[300px]">
            <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
              <PopoverTrigger asChild>
                <Button variant="outline" role="combobox" aria-expanded={openCombobox} className="w-full justify-between bg-background">
                  {selectedPerson ? `${selectedPerson.name} (${selectedPerson.role})` : "Selecionar..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[300px] p-0">
                <Command>
                  <CommandInput placeholder="Buscar colaborador..." />
                  <CommandList>
                    <CommandEmpty>Nenhum encontrado.</CommandEmpty>
                    <CommandGroup heading="SDRs">
                      {sdrs.map((c) => (
                        <CommandItem key={c.id} value={c.name} onSelect={() => handleSelectCollaborator(c.id)}>
                          <Check className={cn("mr-2 h-4 w-4", selectedCollabId === c.id ? "opacity-100" : "opacity-0")} />
                          {c.name}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                    <CommandGroup heading="Closers">
                      {closers.map((c) => (
                        <CommandItem key={c.id} value={c.name} onSelect={() => handleSelectCollaborator(c.id)}>
                          <Check className={cn("mr-2 h-4 w-4", selectedCollabId === c.id ? "opacity-100" : "opacity-0")} />
                          {c.name}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </MotionCard>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <SdrSimulator values={sdrValues} onChange={setSdrValues} isActive={selectedPerson?.role === "SDR"} />
        <CloserSimulator values={closerValues} onChange={setCloserValues} isActive={selectedPerson?.role === "Closer"} />
      </div>

      <PaymentInputTable />
    </div>
  )
}

// --- COMPONENTS ---

// SDR Simulator Component
function SdrSimulator({ values, onChange, isActive }: { values: any, onChange: (v: any) => void, isActive: boolean }) {
  const handleInput = (key: string, val: string) => {
    onChange({ ...values, [key]: parseFloat(val) || 0 });
  };
  const formatCurrency = (val: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(val);

  const comissaoDemo = values.demosRealizadas * 100;
  const percentIndiv = values.metaIndiv > 0 ? (values.realizadoIndiv / values.metaIndiv) : 0;

  let bonus = 0;
  if (percentIndiv >= 1.4) bonus += 500;
  else if (percentIndiv >= 1.2) bonus += 400;
  else if (percentIndiv >= 1.0) bonus += 300;

  const recebimentoTotal = comissaoDemo + bonus;

  return (
    <MotionCard delay={0.2} className={cn("transition-all duration-300", !isActive && "opacity-60 grayscale-[0.8]")}>
      <div className={`absolute inset-0 bg-gradient-to-br from-amber-500/5 via-transparent to-transparent pointer-events-none transition-opacity duration-300 ${isActive ? 'opacity-100' : 'opacity-0'}`} />
      <CardContent className="p-6 space-y-6 relative">
        <div className="flex items-center gap-3 mb-2">
          <div className="h-10 w-10 rounded-xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20 shadow-sm shadow-amber-500/10">
            <span className="font-bold text-amber-500">$$</span>
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight">Simulador SDR</h2>
            <p className="text-xs text-muted-foreground">Cálculo de bônus e metas</p>
          </div>
          {isActive && <span className="ml-auto text-xs bg-amber-500/20 text-amber-500 border border-amber-500/20 px-3 py-1 rounded-full font-bold shadow-sm animate-pulse">ATIVO</span>}
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <SimulatorInput label="Meta/BU" value={values.metaBu} onChange={(v) => handleInput("metaBu", v)} />
          <SimulatorInput label="Realizado/BU" value={values.realizadoBu} onChange={(v) => handleInput("realizadoBu", v)} />
          <SimulatorInput label="Meta Indiv." value={values.metaIndiv} onChange={(v) => handleInput("metaIndiv", v)} />
          <SimulatorInput label="Realizado Indiv." value={values.realizadoIndiv} onChange={(v) => handleInput("realizadoIndiv", v)} />
        </div>

        <div className="space-y-4 pt-6 border-t border-border/50">
          <div className="flex justify-between text-sm items-center p-2 rounded-lg hover:bg-muted/30 transition-colors">
            <span className="text-muted-foreground font-medium">Demos Realizadas</span>
            <input type="number" className="w-16 h-8 text-right bg-background border border-border rounded px-2 text-sm font-medium focus:border-amber-500 transition-colors" value={values.demosRealizadas || ""} onChange={(e) => handleInput("demosRealizadas", e.target.value)} />
          </div>
          <div className="flex justify-between text-sm items-center p-2 rounded-lg hover:bg-muted/30 transition-colors">
            <span className="text-muted-foreground font-medium">Comissão Demo</span>
            <span className="font-medium text-foreground">{formatCurrency(comissaoDemo)}</span>
          </div>
          <div className="flex justify-between text-sm items-center p-2 rounded-lg hover:bg-muted/30 transition-colors">
            <span className="text-muted-foreground font-medium">Bônus Meta</span>
            <span className="font-medium text-amber-500">{formatCurrency(bonus)}</span>
          </div>
          <div className="flex justify-between items-center pt-4 mt-2 border-t border-dashed border-border">
            <span className="font-bold text-lg">Recebimento Total</span>
            <span className="text-2xl font-bold text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-md">{formatCurrency(recebimentoTotal)}</span>
          </div>
        </div>
      </CardContent>
    </MotionCard>
  );
}

// Closer Simulator Component
function CloserSimulator({ values, onChange, isActive }: { values: any, onChange: (v: any) => void, isActive: boolean }) {
  const handleInput = (key: string, val: string) => {
    onChange({ ...values, [key]: parseFloat(val) || 0 });
  };
  const formatCurrency = (val: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(val);

  const percentIndiv = values.metaIndiv > 0 ? (values.realizadoIndiv / values.metaIndiv) : 0;

  let bonus = 0;
  if (percentIndiv >= 1.4) bonus += 500;
  else if (percentIndiv >= 1.2) bonus += 400;
  else if (percentIndiv >= 1.0) bonus += 300;

  const recebimentoTotal = values.comissaoFaturamento + values.comissaoAoVivo + bonus;

  return (
    <MotionCard delay={0.3} className={cn("transition-all duration-300", !isActive && "opacity-60 grayscale-[0.8]")}>
      <div className={`absolute inset-0 bg-gradient-to-bl from-purple-500/5 via-transparent to-transparent pointer-events-none transition-opacity duration-300 ${isActive ? 'opacity-100' : 'opacity-0'}`} />
      <CardContent className="p-6 space-y-6 relative">
        <div className="flex items-center gap-3 mb-2">
          <div className="h-10 w-10 rounded-xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20 shadow-sm shadow-purple-500/10">
            <span className="font-bold text-purple-600">$$</span>
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight">Simulador Closer</h2>
            <p className="text-xs text-muted-foreground">Comissões por venda e bônus</p>
          </div>
          {isActive && <span className="ml-auto text-xs bg-purple-500/20 text-purple-500 border border-purple-500/20 px-3 py-1 rounded-full font-bold shadow-sm animate-pulse">ATIVO</span>}
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <SimulatorInput label="Meta/BU" value={values.metaBu} onChange={(v) => handleInput("metaBu", v)} />
          <SimulatorInput label="Realizado/BU" value={values.realizadoBu} onChange={(v) => handleInput("realizadoBu", v)} />
          <SimulatorInput label="Meta Indiv." value={values.metaIndiv} onChange={(v) => handleInput("metaIndiv", v)} />
          <SimulatorInput label="Realizado Indiv." value={values.realizadoIndiv} onChange={(v) => handleInput("realizadoIndiv", v)} />
        </div>

        <div className="space-y-4 pt-6 border-t border-border/50">
          <div className="flex justify-between text-sm items-center p-2 rounded-lg hover:bg-muted/30 transition-colors">
            <span className="text-muted-foreground font-medium">Comissão Fat. (Manual)</span>
            <input type="number" className="w-24 h-8 text-right bg-background border border-border rounded px-2 text-sm font-medium focus:border-purple-500 transition-colors" value={values.comissaoFaturamento || ""} onChange={(e) => handleInput("comissaoFaturamento", e.target.value)} />
          </div>
          <div className="flex justify-between text-sm items-center p-2 rounded-lg hover:bg-muted/30 transition-colors">
            <span className="text-muted-foreground font-medium">Comissão Ao Vivo (Manual)</span>
            <input type="number" className="w-24 h-8 text-right bg-background border border-border rounded px-2 text-sm font-medium focus:border-purple-500 transition-colors" value={values.comissaoAoVivo || ""} onChange={(e) => handleInput("comissaoAoVivo", e.target.value)} />
          </div>
          <div className="flex justify-between text-sm items-center p-2 rounded-lg hover:bg-muted/30 transition-colors">
            <span className="text-muted-foreground font-medium">Bônus Meta</span>
            <span className="font-medium text-amber-500">{formatCurrency(bonus)}</span>
          </div>
          <div className="flex justify-between items-center pt-4 mt-2 border-t border-dashed border-border">
            <span className="font-bold text-lg">Recebimento Total</span>
            <span className="text-2xl font-bold text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-md">{formatCurrency(recebimentoTotal)}</span>
          </div>
        </div>
      </CardContent>
    </MotionCard>
  );
}

// Payment Input Table Logic (Client-side specific)
function PaymentInputTable() {
  const [data, setData] = useState({
    pix: { vendas: 0, ticket: 8925, rate: 0.025 },
    card6x: { vendas: 0, ticket: 8500, rate: 0.0225 },
    card12x: { vendas: 0, ticket: 7900, rate: 0.02 },
    card18x: { vendas: 0, ticket: 7500, rate: 0.0175 },
    principia: { vendas: 0, ticket: 8000, rate: 0.025 },
    boleto: { vendas: 0, ticket: 8900, rate: 0.012 }
  });
  const formatCurrency = (val: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(val);
  const calculateColumn = (key: keyof typeof data) => {
    const item = data[key];
    const receita = item.vendas * item.ticket;
    const comissao = receita * item.rate;
    return { receita, comissao };
  };
  const updateData = (key: keyof typeof data, field: "vendas" | "ticket", value: string) => {
    const num = parseFloat(value) || 0;
    setData(prev => ({ ...prev, [key]: { ...prev[key], [field]: num } }));
  };

  return (
    <MotionCard delay={0.4} className="space-y-4">
      <CardHeader className="border-b border-border bg-muted/20 pb-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
            <Download className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <CardTitle className="text-xl font-bold tracking-tight">Input de Pagamentos (Closer)</CardTitle>
            <p className="text-sm text-muted-foreground">Regras de comissionamento por método</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0 overflow-hidden overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-zinc-950 text-zinc-400 uppercase text-xs font-bold tracking-wider">
            <tr>
              <th className="p-4 text-left font-medium min-w-[120px]">Método</th>
              <th className="p-4 text-center font-medium min-w-[100px]">PIX à vista</th>
              <th className="p-4 text-center font-medium min-w-[100px]">Cartão 6x</th>
              <th className="p-4 text-center font-medium min-w-[100px]">Cartão 12x</th>
              <th className="p-4 text-center font-medium min-w-[100px]">Cartão 18x</th>
              <th className="p-4 text-center font-medium min-w-[100px]">Principia</th>
              <th className="p-4 text-center font-medium min-w-[100px]">Boleto</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40">
            <tr className="hover:bg-muted/20 transition-colors group">
              <td className="p-4 font-semibold text-muted-foreground bg-muted/10 group-hover:bg-muted/30 transition-colors">Qtd. Vendas</td>
              {(Object.keys(data) as Array<keyof typeof data>).map(key => (
                <td key={key} className="p-2 text-center">
                  <div className="flex items-center justify-center">
                    <input
                      type="number"
                      className="w-16 text-center bg-transparent border-b border-dashed border-muted-foreground/30 focus:border-primary focus:outline-none text-sm font-medium placeholder:text-muted-foreground/30 transition-all hover:border-primary/50"
                      value={data[key].vendas || ""}
                      onChange={(e) => updateData(key, "vendas", e.target.value)}
                      placeholder="0"
                    />
                  </div>
                </td>
              ))}
            </tr>
            <tr className="hover:bg-muted/20 transition-colors group">
              <td className="p-4 font-semibold text-muted-foreground bg-muted/10 group-hover:bg-muted/30 transition-colors">Ticket Médio</td>
              {(Object.keys(data) as Array<keyof typeof data>).map(key => (
                <td key={key} className="p-2 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <span className="text-xs text-muted-foreground">R$</span>
                    <input
                      type="number"
                      className="w-20 text-center bg-transparent border-b border-dashed border-muted-foreground/30 focus:border-primary focus:outline-none text-xs transition-all hover:border-primary/50"
                      value={data[key].ticket}
                      onChange={(e) => updateData(key, "ticket", e.target.value)}
                    />
                  </div>
                </td>
              ))}
            </tr>
            <tr className="bg-blue-600/5 hover:bg-blue-600/10 transition-colors border-t border-blue-500/10">
              <td className="p-4 font-bold text-blue-600">Receita Gerada</td>
              {(Object.keys(data) as Array<keyof typeof data>).map(key => (
                <td key={key} className="p-4 text-center font-bold text-blue-600">{formatCurrency(calculateColumn(key).receita)}</td>
              ))}
            </tr>
            <tr className="bg-emerald-500/5 hover:bg-emerald-500/10 transition-colors border-t border-emerald-500/10">
              <td className="p-4 font-medium text-emerald-600">Comissão (Fat.)</td>
              {(Object.keys(data) as Array<keyof typeof data>).map(key => (
                <td key={key} className="p-4 text-center font-bold text-emerald-600">{formatCurrency(calculateColumn(key).comissao)}</td>
              ))}
            </tr>
          </tbody>
        </table>
      </CardContent>
    </MotionCard>
  );
}

function SimulatorInput({ label, value, onChange }: { label: string, value: number, onChange: (v: string) => void }) {
  return (
    <div className="bg-muted/30 p-3 rounded-lg border border-border/40 hover:border-primary/30 transition-all duration-200 focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/20 focus-within:bg-background">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1 opacity-70">{label}</p>
      <div className="flex items-center">
        <span className="text-xs text-muted-foreground mr-1">R$</span>
        <input type="number" className="w-full bg-transparent text-lg font-bold text-foreground focus:outline-none" value={value || ""} onChange={(e) => onChange(e.target.value)} placeholder="0" />
      </div>
    </div>
  );
}

// Reuse previous CommissionReport component logic
function CommissionsReport({ comissoes, isLoading }: { comissoes: any[] | undefined, isLoading: boolean }) {
  if (isLoading) return <div className="p-20 text-center animate-pulse text-muted-foreground">Carregando dados financeiros...</div>;

  // Calculate totals
  const totalMes = comissoes?.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0) || 0;
  const totalPendentes = comissoes?.filter(c => c.status === 'pendente').reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0) || 0;
  const totalAprovadas = comissoes?.filter(c => c.status === 'aprovado').reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0) || 0;
  const totalPagas = comissoes?.filter(c => c.status === 'pago').reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0) || 0;
  const formatMoney = (val: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(val);

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MotionCard delay={0.1} className="p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-medium text-muted-foreground">Total do Mês</p>
            <div className="p-2 bg-primary/10 rounded-full">
              <TrendingUp className="w-4 h-4 text-primary" />
            </div>
          </div>
          <div>
            <p className="text-3xl font-bold text-foreground tracking-tight">{formatMoney(totalMes)}</p>
            <p className="text-xs text-muted-foreground mt-1">Acumulado mensal</p>
          </div>
        </MotionCard>
        <MotionCard delay={0.2} className="p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-medium text-muted-foreground">Pendentes</p>
            <div className="p-2 bg-amber-500/10 rounded-full">
              <DollarSign className="w-4 h-4 text-amber-500" />
            </div>
          </div>
          <div>
            <p className="text-3xl font-bold text-foreground tracking-tight">{formatMoney(totalPendentes)}</p>
            <div className="h-1 w-full bg-secondary mt-2 rounded-full overflow-hidden">
              <div className="h-full bg-amber-500 w-1/2"></div>
            </div>
          </div>
        </MotionCard>
        <MotionCard delay={0.3} className="p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-medium text-muted-foreground">Aprovadas</p>
            <div className="p-2 bg-blue-500/10 rounded-full">
              <Check className="w-4 h-4 text-blue-500" />
            </div>
          </div>
          <div>
            <p className="text-3xl font-bold text-foreground tracking-tight">{formatMoney(totalAprovadas)}</p>
            <div className="h-1 w-full bg-secondary mt-2 rounded-full overflow-hidden">
              <div className="h-full bg-blue-500 w-3/4"></div>
            </div>
          </div>
        </MotionCard>
        <MotionCard delay={0.4} className="p-6 flex flex-col justify-between border-emerald-500/30 bg-emerald-500/5">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-medium text-muted-foreground">Pagas</p>
            <div className="p-2 bg-emerald-500/10 rounded-full">
              <DollarSign className="w-4 h-4 text-emerald-500" />
            </div>
          </div>
          <div>
            <p className="text-3xl font-bold text-emerald-600 tracking-tight">{formatMoney(totalPagas)}</p>
            <p className="text-xs text-emerald-600/70 mt-1">Disponível em conta</p>
          </div>
        </MotionCard>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <MotionCard delay={0.5} className="p-0 overflow-hidden">
          <CardHeader className="border-b border-border bg-muted/20 pb-4">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <PieChartIcon className="h-5 w-5 text-muted-foreground" />
              Distribuição por Status
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[300px] w-full p-4">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { name: 'Pendente', value: comissoes?.filter(c => c.status === 'pendente').length || 0 },
                    { name: 'Aprovado', value: comissoes?.filter(c => c.status === 'aprovado').length || 0 },
                    { name: 'Pago', value: comissoes?.filter(c => c.status === 'pago').length || 0 },
                  ]}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  <Cell key="cell-0" fill="#f59e0b" />
                  <Cell key="cell-1" fill="#3b82f6" />
                  <Cell key="cell-2" fill="#10b981" />
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--popover))',
                    borderColor: 'hsl(var(--border))',
                    borderRadius: 'var(--radius)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                  }}
                  itemStyle={{ color: 'hsl(var(--foreground))' }}
                />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </MotionCard>

        {/* Placeholder for future chart or list */}
        <MotionCard delay={0.6} className="p-0 overflow-hidden flex flex-col justify-center items-center text-center bg-muted/10 border-dashed">
          <div className="p-6 rounded-full bg-secondary mb-4">
            <ArrowRight className="h-8 w-8 text-muted-foreground opacity-50" />
          </div>
          <h3 className="text-lg font-medium text-muted-foreground">Mais métricas em breve</h3>
          <p className="text-sm text-muted-foreground/60 max-w-[200px]">Novos gráficos de evolução de comissões serão adicionados aqui.</p>
        </MotionCard>
      </div>

      <MotionCard delay={0.7} className="overflow-hidden">
        <CardHeader className="border-b border-border bg-muted/20 py-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold">Detalhamento de Comissões</CardTitle>
            <Button variant="outline" size="sm" className="h-8 text-xs">
              <Download className="w-3 h-3 mr-2" /> Exportar
            </Button>
          </div>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-xs uppercase font-bold text-muted-foreground">
              <tr>
                <th className="text-left py-4 px-4 font-medium">Tipo</th>
                <th className="text-left py-4 px-4 font-medium">Consultor</th>
                <th className="text-left py-4 px-4 font-medium">Descrição</th>
                <th className="text-left py-4 px-4 font-medium">Nível</th>
                <th className="text-left py-4 px-4 font-medium">Valor</th>
                <th className="text-left py-4 px-4 font-medium">Competência</th>
                <th className="text-left py-4 px-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {comissoes?.length === 0 ? (
                <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">Nenhuma comissão encontrada.</td></tr>
              ) : comissoes?.map((c, index) => (
                <tr key={c.id || index} className="hover:bg-muted/30 transition-colors group">
                  <td className="py-4 px-4">
                    <BadgeStatus variant={c.tipoVariant}>
                      {c.tipo || c.type}
                    </BadgeStatus>
                  </td>
                  <td className="py-4 px-4 font-medium text-foreground group-hover:text-primary transition-colors">{c.consultant_name}</td>
                  <td className="py-4 px-4 text-muted-foreground">{c.description}</td>
                  <td className="py-4 px-4">
                    <span className={c.nivelColor}>{c.level}</span>
                  </td>
                  <td className="py-4 px-4 font-bold text-foreground">{typeof c.amount === 'number' ? formatMoney(c.amount) : c.valor}</td>
                  <td className="py-4 px-4 text-muted-foreground">{c.competence ? new Date(c.competence).toLocaleDateString() : '-'}</td>
                  <td className="py-4 px-4">
                    <BadgeStatus variant={c.status}>
                      {c.status ? c.status.charAt(0).toUpperCase() + c.status.slice(1) : '-'}
                    </BadgeStatus>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </MotionCard>
    </div>
  )
}

export default Comissoes;
