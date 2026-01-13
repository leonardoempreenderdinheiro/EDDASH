
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Settings, Target, Users, DollarSign, Save } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useGoals } from "@/hooks/useGoals";
import { useFilters } from "@/contexts/FilterContext";

// Local helper types for the Form
interface SdrGoalForm {
    name: string;
    demos_target: number;
    sales_target: number;
}

interface CloserGoalForm {
    name: string;
    revenue_target: number;
    conversion_target: number;
}

interface GlobalGoalForm {
    revenue_target: number;
    leads_target: number;
}

interface GoalsManagerProps {
    sdrs?: any[]; // Keep purely for initializing list if needed, or fetch profiles here?
    // distinct from the data derived props
}

export function GoalsManager({ sdrs }: GoalsManagerProps) {
    const [open, setOpen] = useState(false);
    const { goals, createGoal, updateGoal } = useGoals();
    const { selectedCompany } = useFilters();

    // Local Form State
    const [globalForm, setGlobalForm] = useState<GlobalGoalForm>({ revenue_target: 0, leads_target: 0 });
    const [sdrForms, setSdrForms] = useState<SdrGoalForm[]>([]);

    // Hardcoded list of names if we don't have a "Team" table yet, or derive from existing goals/sdrs
    // Ideally we fetch 'profiles' with role='sdr'
    // For MVP, we initialize state from the passed 'sdrs' list (which comes from aggregation) OR existing goals

    useEffect(() => {
        if (open && goals) {
            // 1. Map Global Goals
            const gRev = goals.find(g => g.metric === 'revenue' && g.sector === 'global');
            const gLeads = goals.find(g => g.metric === 'leads' && g.sector === 'global');

            setGlobalForm({
                revenue_target: gRev ? Number(gRev.target_value) : 0,
                leads_target: gLeads ? Number(gLeads.target_value) : 0
            });

            // 2. Map SDR Goals
            // We need a list of ALL SDRs. If 'sdrs' prop is passed, use it to seed the list
            if (sdrs) {
                const mappedSdrs = sdrs.map(s => {
                    // Find existing goals for this person
                    // Note: This logic assumes 'name' is unique and consistent
                    const lat = goals.find(g => g.user_name === s.name && g.metric === 'revenue');
                    const dem = goals.find(g => g.user_name === s.name && g.metric === 'demos_target');

                    return {
                        name: s.name,
                        sales_target: lat ? Number(lat.target_value) : 0,
                        demos_target: dem ? Number(dem.target_value) : 0
                    };
                });
                setSdrForms(mappedSdrs);
            }
        }
    }, [open, goals, sdrs]);


    const handleSave = async () => {
        try {
            const currentPeriod = new Date().toISOString().split('T')[0]; // "YYYY-MM-DD"
            const promises = [];

            // 1. Save Global
            // We need to find if exists to update, or create new.
            // Simplified: We try to find match in 'goals' array.

            const saveMetric = (sector: string, metric: string, value: number, userName?: string) => {
                const existing = goals?.find(g =>
                    g.sector === sector &&
                    g.metric === metric &&
                    g.user_name === (userName || null)
                );

                if (existing) {
                    return updateGoal.mutateAsync({ id: existing.id, target_value: value });
                } else {
                    return createGoal.mutateAsync({
                        company: selectedCompany,
                        sector,
                        metric,
                        target_value: value,
                        period: currentPeriod,
                        user_name: userName || null
                    });
                }
            };

            promises.push(saveMetric('global', 'revenue', globalForm.revenue_target));
            promises.push(saveMetric('global', 'leads', globalForm.leads_target));

            // 2. Save SDRs
            for (const sdr of sdrForms) {
                promises.push(saveMetric('sales', 'revenue', sdr.sales_target, sdr.name));
                promises.push(saveMetric('sales', 'demos_target', sdr.demos_target, sdr.name));
            }

            await Promise.all(promises);
            toast.success("Metas atualizadas com sucesso!");
            setOpen(false);

        } catch (error) {
            console.error(error);
            toast.error("Erro ao salvar metas.");
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="gap-2">
                    <Settings className="w-4 h-4" />
                    Configurar Metas
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Target className="w-5 h-5 text-primary" />
                        Gestão de Metas Comerciais
                    </DialogTitle>
                    <DialogDescription>
                        Defina as metas globais e individuais para o time comercial (Salvo automaticamente para o mês atual).
                    </DialogDescription>
                </DialogHeader>

                <Tabs defaultValue="global" className="mt-4">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="global">Global</TabsTrigger>
                        <TabsTrigger value="sdrs">SDRs</TabsTrigger>
                        <TabsTrigger value="closers" disabled>Closers (Breve)</TabsTrigger>
                    </TabsList>

                    {/* GLOBAL GOALS */}
                    <TabsContent value="global" className="space-y-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Meta de Faturamento (Mês)</Label>
                                <div className="relative">
                                    <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        type="number"
                                        className="pl-9"
                                        value={globalForm.revenue_target}
                                        onChange={(e) => setGlobalForm({ ...globalForm, revenue_target: Number(e.target.value) })}
                                    />
                                </div>
                                <p className="text-xs text-muted-foreground">Valor total esperado para a empresa.</p>
                            </div>
                            <div className="space-y-2">
                                <Label>Meta de Leads (Mês)</Label>
                                <div className="relative">
                                    <Users className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        type="number"
                                        className="pl-9"
                                        value={globalForm.leads_target}
                                        onChange={(e) => setGlobalForm({ ...globalForm, leads_target: Number(e.target.value) })}
                                    />
                                </div>
                                <p className="text-xs text-muted-foreground">Volume total de leads para processar.</p>
                            </div>
                        </div>
                    </TabsContent>

                    {/* SDR GOALS */}
                    <TabsContent value="sdrs" className="space-y-4 py-4">
                        <div className="rounded-md border">
                            <table className="w-full text-sm">
                                <thead className="bg-muted">
                                    <tr>
                                        <th className="p-3 text-left font-medium">SDR</th>
                                        <th className="p-3 text-center font-medium">Meta Demos</th>
                                        <th className="p-3 text-center font-medium">Meta Fat.</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {sdrForms.map((sdr, index) => (
                                        <tr key={index} className="border-t">
                                            <td className="p-3 font-medium">{sdr.name}</td>
                                            <td className="p-3">
                                                <Input
                                                    type="number"
                                                    className="w-20 mx-auto text-center h-8"
                                                    value={sdr.demos_target}
                                                    onChange={(e) => {
                                                        const newForms = [...sdrForms];
                                                        newForms[index].demos_target = Number(e.target.value);
                                                        setSdrForms(newForms);
                                                    }}
                                                />
                                            </td>
                                            <td className="p-3">
                                                <Input
                                                    type="number"
                                                    className="w-24 mx-auto text-center h-8"
                                                    value={sdr.sales_target}
                                                    onChange={(e) => {
                                                        const newForms = [...sdrForms];
                                                        newForms[index].sales_target = Number(e.target.value);
                                                        setSdrForms(newForms);
                                                    }}
                                                />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </TabsContent>
                </Tabs>

                <div className="flex justify-end gap-3 mt-4">
                    <Button variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
                    <Button onClick={handleSave} className="gap-2 bg-emerald-600 hover:bg-emerald-700">
                        <Save className="w-4 h-4" />
                        Salvar Metas
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
