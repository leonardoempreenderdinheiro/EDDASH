import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Pencil } from "lucide-react";

interface Profile {
    id: string;
    full_name: string | null;
    role: string | null;
    company: string | null;
    status: 'pending' | 'active' | 'rejected' | null;
}

interface EditUserDialogProps {
    user: Profile;
    onUpdate: () => void;
}

export function EditUserDialog({ user, onUpdate }: EditUserDialogProps) {
    const { profile: currentUserProfile } = useAuth();
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [role, setRole] = useState(user.role || "");
    const [company, setCompany] = useState(user.company || "");

    const isCurrentUserMaster = currentUserProfile?.role === 'Master' || currentUserProfile?.email === "contas@empreenderdinheiro.com";

    const handleSave = async () => {
        setLoading(true);
        try {
            const updates: any = { role, company };

            // If user was pending, approving them makes them active
            if (user.status === 'pending') {
                updates.status = 'active';
            }

            const { error } = await supabase
                .from("profiles")
                .update(updates as any)
                .eq("id", user.id);

            if (error) throw error;

            toast.success(user.status === 'pending' ? "Usuário aprovado com sucesso!" : "Usuário atualizado com sucesso!");
            setOpen(false);
            onUpdate();
        } catch (error: any) {
            toast.error("Erro ao atualizar usuário: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    const isPending = user.status === 'pending';

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant={isPending ? "default" : "ghost"} size={isPending ? "sm" : "icon"}>
                    {isPending ? "Aprovar" : <Pencil className="h-4 w-4" />}
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{isPending ? "Aprovar Usuário" : "Editar Usuário"}</DialogTitle>
                    <DialogDescription>
                        {isPending
                            ? `Defina o cargo e empresa para aprovar ${user.full_name}`
                            : `Alterar permissões e empresa de ${user.full_name}`
                        }
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="role" className="text-right">
                            Cargo
                        </Label>
                        <Select value={role} onValueChange={setRole}>
                            <SelectTrigger className="col-span-3">
                                <SelectValue placeholder="Selecione o cargo" />
                            </SelectTrigger>
                            <SelectContent>
                                {isCurrentUserMaster && <SelectItem value="Master">Master</SelectItem>}
                                <SelectItem value="CMO">CMO</SelectItem>
                                <SelectItem value="CEO">CEO</SelectItem>
                                <SelectItem value="CTO">CTO</SelectItem>
                                <SelectItem value="CCO">CCO</SelectItem>
                                <SelectItem value="Socio">Sócios</SelectItem>
                                <SelectItem value="Gestor">Gestores</SelectItem>
                                <SelectItem value="Equipe">Equipe</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="company" className="text-right">
                            Empresa
                        </Label>
                        <Select value={company} onValueChange={setCompany}>
                            <SelectTrigger className="col-span-3">
                                <SelectValue placeholder="Selecione a empresa" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Ed Capital">Ed Capital</SelectItem>
                                <SelectItem value="Ed Seguros">Ed Seguros</SelectItem>
                                <SelectItem value="Techfinance">Techfinance</SelectItem>
                                <SelectItem value="Ed Holding">Ed Holding</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <DialogFooter>
                    <Button type="submit" onClick={handleSave} disabled={loading}>
                        {loading ? "Salvando..." : (isPending ? "Aprovar e Salvar" : "Salvar alterações")}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
