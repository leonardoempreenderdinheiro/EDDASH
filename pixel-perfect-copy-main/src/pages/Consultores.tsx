import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Search, Filter, Mail, Plus, Loader2, UserPlus } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { BadgeStatus } from "@/components/ui/badge-status";
import { EditUserDialog } from "@/components/profile/EditUserDialog";
import { useAuth } from "@/contexts/AuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useProfiles, Profile, NewProfile } from "@/hooks/useProfiles";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

const ROLES = [
  "Master", "CEO", "CTO", "CMO", "CCO", "Sócio", "Gestor",
  "Consultor", "Closer", "SDR", "Analista", "Equipe"
];

const COMPANIES = [
  "Ed Capital", "Ed Seguros", "Techfinance", "Empreender Dinheiro"
];

const Consultores = () => {
  const { data: users, isLoading: loading, createProfile } = useProfiles();
  const { profile } = useAuth();
  const isAdmin = ["Master", "CEO", "Gestor", "Socio", "CTO", "CMO", "CCO"].includes(profile?.role || "");
  const isMaster = profile?.role === 'Master' || profile?.email === "contas@empreenderdinheiro.com";

  // Add user dialog state
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [newUser, setNewUser] = useState<NewProfile>({
    email: "",
    full_name: null, // Changed to null to reflect optional nature and align with potential null values from DB
    role: "Equipe",
    company: "Ed Capital",
    status: "active"
  });

  const getInitials = (name: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  const activeUsers = (users || []).filter(u => u.status === 'active' || !u.status);
  const pendingUsers = (users || []).filter(u => u.status === 'pending');

  // Filter users by search query
  const filteredActiveUsers = searchQuery
    ? activeUsers.filter(u =>
      u.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchQuery.toLowerCase())
    )
    : activeUsers;

  const handleCreateUser = async () => {
    if (!newUser.email || !newUser.full_name) {
      toast.error("Preencha nome e email");
      return;
    }

    setIsSubmitting(true);
    try {
      await createProfile.mutateAsync(newUser);
      toast.success("Usuário criado com sucesso!");
      setIsDialogOpen(false);
      setNewUser({
        email: "",
        full_name: "",
        role: "Equipe",
        company: "Ed Capital",
        status: "active"
      });
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Erro ao criar usuário");
    } finally {
      setIsSubmitting(false);
    }
  };

  const UserTable = ({ data, showActions = false }: { data: Profile[], showActions?: boolean }) => (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left py-4 px-4 text-sm font-medium text-muted-foreground">Usuário</th>
            <th className="text-left py-4 px-4 text-sm font-medium text-muted-foreground">Contato</th>
            <th className="text-left py-4 px-4 text-sm font-medium text-muted-foreground">Cargo</th>
            <th className="text-left py-4 px-4 text-sm font-medium text-muted-foreground">Empresa</th>
            <th className="text-left py-4 px-4 text-sm font-medium text-muted-foreground">Status</th>
            <th className="w-10"></th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr><td colSpan={6} className="p-4 text-center">Carregando...</td></tr>
          ) : data.length === 0 ? (
            <tr><td colSpan={6} className="p-4 text-center text-muted-foreground">Nenhum usuário encontrado.</td></tr>
          ) : data.map((u) => (
            <tr key={u.id} className="border-b border-border last:border-0 hover:bg-secondary/50 transition-colors">
              <td className="py-4 px-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-9 w-9 bg-muted">
                    <AvatarFallback className="text-sm bg-muted text-foreground">{getInitials(u.full_name || "")}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-foreground">{u.full_name}</p>
                    <p className="text-sm text-muted-foreground">Cadastrado em {new Date(u.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
              </td>
              <td className="py-4 px-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="w-4 h-4" />
                  {u.email}
                </div>
              </td>
              <td className="py-4 px-4">
                <span className="font-medium text-foreground">{u.role || "-"}</span>
              </td>
              <td className="py-4 px-4">
                <span className="text-sm text-muted-foreground">{u.company || "-"}</span>
              </td>
              <td className="py-4 px-4">
                <BadgeStatus variant={u.status === 'active' ? 'ativo' : 'pendente'}>
                  {u.status === 'active' ? 'Ativo' : u.status === 'pending' ? 'Pendente' : 'Ativo'}
                </BadgeStatus>
              </td>
              <td className="py-4 px-4">
                {showActions && (
                  <EditUserDialog user={u} onUpdate={() => window.location.reload()} />
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <MainLayout title="Gerenciamento de Usuários" subtitle="Gerencie acessos e permissões da equipe">
      {/* Search and Actions */}
      <div className="flex items-center justify-between mb-6">
        <div className="relative w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome ou email..."
            className="pl-9 bg-secondary border-border"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-3">
          {(isAdmin || isMaster) && (
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <UserPlus className="w-4 h-4" />
                  Adicionar Usuário
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Adicionar Novo Usuário</DialogTitle>
                  <DialogDescription>
                    Crie um novo usuário manualmente. O usuário será adicionado como ativo.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="full_name">Nome Completo *</Label>
                    <Input
                      id="full_name"
                      placeholder="João da Silva"
                      value={newUser.full_name}
                      onChange={(e) => setNewUser({ ...newUser, full_name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="joao@empresa.com"
                      value={newUser.email}
                      onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Cargo</Label>
                      <Select
                        value={newUser.role}
                        onValueChange={(value) => setNewUser({ ...newUser, role: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          {ROLES.map((role) => (
                            <SelectItem key={role} value={role}>{role}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Empresa</Label>
                      <Select
                        value={newUser.company}
                        onValueChange={(value) => setNewUser({ ...newUser, company: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          {COMPANIES.map((company) => (
                            <SelectItem key={company} value={company}>{company}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select
                      value={newUser.status}
                      onValueChange={(value) => setNewUser({ ...newUser, status: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Ativo</SelectItem>
                        <SelectItem value="pending">Pendente</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleCreateUser} disabled={isSubmitting} className="gap-2">
                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                    Criar Usuário
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {isMaster ? (
        <Tabs defaultValue="active" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="active">Membros Ativos ({filteredActiveUsers.length})</TabsTrigger>
            <TabsTrigger value="requests">
              Solicitações
              {pendingUsers.length > 0 && (
                <span className="ml-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                  {pendingUsers.length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active">
            <UserTable data={filteredActiveUsers} showActions={isAdmin} />
          </TabsContent>

          <TabsContent value="requests">
            <UserTable data={pendingUsers} showActions={true} />
          </TabsContent>
        </Tabs>
      ) : (
        <UserTable data={filteredActiveUsers} showActions={isAdmin} />
      )}

    </MainLayout>
  );
};

export default Consultores;
