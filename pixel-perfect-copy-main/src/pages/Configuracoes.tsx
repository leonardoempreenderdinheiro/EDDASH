import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Building, DollarSign, Bell, Lock, Loader2, RotateCcw, Save } from "lucide-react";
import { useSettings } from "@/hooks/useSettings";

const Configuracoes = () => {
  const { settings, isLoading, isSaving, updateCompany, updateCommissions, updateNotifications, updateSecurity, resetSettings } = useSettings();

  // Local state for form fields
  const [companyForm, setCompanyForm] = useState(settings.company);
  const [commissionForm, setCommissionForm] = useState(settings.commissions);
  const [notificationForm, setNotificationForm] = useState(settings.notifications);
  const [securityForm, setSecurityForm] = useState(settings.security);

  // Sync local state when settings load
  useEffect(() => {
    setCompanyForm(settings.company);
    setCommissionForm(settings.commissions);
    setNotificationForm(settings.notifications);
    setSecurityForm(settings.security);
  }, [settings]);

  if (isLoading) {
    return (
      <MainLayout title="Configurações" subtitle="Gerencie as configurações do sistema">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Configurações" subtitle="Gerencie as configurações do sistema">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Settings */}
        <div className="lg:col-span-2 space-y-6">
          {/* Company Data */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-secondary">
                  <Building className="w-5 h-5 text-foreground" />
                </div>
                <div>
                  <CardTitle>Dados da Empresa</CardTitle>
                  <CardDescription>Informações básicas da empresa</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">Nome da Empresa</label>
                  <Input
                    value={companyForm.companyName}
                    onChange={(e) => setCompanyForm({ ...companyForm, companyName: e.target.value })}
                    className="bg-secondary border-border"
                  />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">CNPJ</label>
                  <Input
                    value={companyForm.cnpj}
                    onChange={(e) => setCompanyForm({ ...companyForm, cnpj: e.target.value })}
                    className="bg-secondary border-border"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">Email</label>
                  <Input
                    value={companyForm.email}
                    onChange={(e) => setCompanyForm({ ...companyForm, email: e.target.value })}
                    className="bg-secondary border-border"
                  />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">Telefone</label>
                  <Input
                    value={companyForm.phone}
                    onChange={(e) => setCompanyForm({ ...companyForm, phone: e.target.value })}
                    className="bg-secondary border-border"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button
                  onClick={() => updateCompany(companyForm)}
                  disabled={isSaving}
                  className="gap-2"
                >
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Salvar Alterações
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Commission Settings */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/20">
                  <DollarSign className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <CardTitle>Configurações de Comissão</CardTitle>
                  <CardDescription>Percentuais e valores de comissões</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <h4 className="font-medium text-foreground mb-4">Distribuição de Comissões (%)</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm text-muted-foreground mb-2 block">% Seguradora</label>
                    <Input
                      type="number"
                      value={commissionForm.seguradoraPercent}
                      onChange={(e) => setCommissionForm({ ...commissionForm, seguradoraPercent: Number(e.target.value) })}
                      className="bg-secondary border-border"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground mb-2 block">% TechFinance</label>
                    <Input
                      type="number"
                      value={commissionForm.techfinancePercent}
                      onChange={(e) => setCommissionForm({ ...commissionForm, techfinancePercent: Number(e.target.value) })}
                      className="bg-secondary border-border"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground mb-2 block">% Rede</label>
                    <Input
                      type="number"
                      value={commissionForm.redePercent}
                      onChange={(e) => setCommissionForm({ ...commissionForm, redePercent: Number(e.target.value) })}
                      className="bg-secondary border-border"
                    />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Total: {commissionForm.seguradoraPercent + commissionForm.techfinancePercent + commissionForm.redePercent}%
                  {commissionForm.seguradoraPercent + commissionForm.techfinancePercent + commissionForm.redePercent !== 100 && (
                    <span className="text-amber-500 ml-2">(deve ser 100%)</span>
                  )}
                </p>
              </div>

              <div className="mb-6">
                <h4 className="font-medium text-foreground mb-4">Comissões de Licença</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-secondary rounded-lg p-4">
                    <span className="text-sm text-primary">Start</span>
                    <p className="text-xl font-bold text-foreground mt-1">R$ 1.200</p>
                    <p className="text-xs text-muted-foreground mt-1">15% direto + 5% N1</p>
                  </div>
                  <div className="bg-secondary rounded-lg p-4">
                    <span className="text-sm text-emerald-500">Pro</span>
                    <p className="text-xl font-bold text-foreground mt-1">R$ 2.000</p>
                    <p className="text-xs text-muted-foreground mt-1">20% + 7% + 3%</p>
                  </div>
                  <div className="bg-secondary rounded-lg p-4">
                    <span className="text-sm text-amber-500">Elite</span>
                    <p className="text-xl font-bold text-foreground mt-1">R$ 3.500</p>
                    <p className="text-xs text-muted-foreground mt-1">25% + 10% + 5% + 5%</p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button
                  onClick={() => updateCommissions(commissionForm)}
                  disabled={isSaving}
                  className="gap-2"
                >
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Salvar Comissões
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Settings */}
        <div className="space-y-6">
          {/* Notifications */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-500/20">
                  <Bell className="w-5 h-5 text-amber-500" />
                </div>
                <div>
                  <CardTitle className="text-base">Notificações</CardTitle>
                  <CardDescription className="text-xs">Preferências de alertas</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">Email</p>
                  <p className="text-xs text-muted-foreground">Receber por email</p>
                </div>
                <Switch
                  checked={notificationForm.emailNotifications}
                  onCheckedChange={(checked) => {
                    const newForm = { ...notificationForm, emailNotifications: checked };
                    setNotificationForm(newForm);
                    updateNotifications(newForm);
                  }}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">Push</p>
                  <p className="text-xs text-muted-foreground">Notificações push</p>
                </div>
                <Switch
                  checked={notificationForm.pushNotifications}
                  onCheckedChange={(checked) => {
                    const newForm = { ...notificationForm, pushNotifications: checked };
                    setNotificationForm(newForm);
                    updateNotifications(newForm);
                  }}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">Relatórios Semanais</p>
                  <p className="text-xs text-muted-foreground">Resumo semanal</p>
                </div>
                <Switch
                  checked={notificationForm.weeklyReports}
                  onCheckedChange={(checked) => {
                    const newForm = { ...notificationForm, weeklyReports: checked };
                    setNotificationForm(newForm);
                    updateNotifications(newForm);
                  }}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">Alertas de Meta</p>
                  <p className="text-xs text-muted-foreground">Quando metas são atingidas</p>
                </div>
                <Switch
                  checked={notificationForm.goalAlerts}
                  onCheckedChange={(checked) => {
                    const newForm = { ...notificationForm, goalAlerts: checked };
                    setNotificationForm(newForm);
                    updateNotifications(newForm);
                  }}
                />
              </div>
            </CardContent>
          </Card>

          {/* Security */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-red-500/20">
                  <Lock className="w-5 h-5 text-red-500" />
                </div>
                <div>
                  <CardTitle className="text-base">Segurança</CardTitle>
                  <CardDescription className="text-xs">Proteção da conta</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">2FA</p>
                  <p className="text-xs text-muted-foreground">Autenticação dupla</p>
                </div>
                <Switch
                  checked={securityForm.twoFactorAuth}
                  onCheckedChange={(checked) => {
                    const newForm = { ...securityForm, twoFactorAuth: checked };
                    setSecurityForm(newForm);
                    updateSecurity(newForm);
                  }}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">Restrição IP</p>
                  <p className="text-xs text-muted-foreground">Limitar IPs</p>
                </div>
                <Switch
                  checked={securityForm.ipRestriction}
                  onCheckedChange={(checked) => {
                    const newForm = { ...securityForm, ipRestriction: checked };
                    setSecurityForm(newForm);
                    updateSecurity(newForm);
                  }}
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Timeout (min)</label>
                <Input
                  type="number"
                  value={securityForm.sessionTimeout}
                  onChange={(e) => {
                    const newForm = { ...securityForm, sessionTimeout: Number(e.target.value) };
                    setSecurityForm(newForm);
                  }}
                  onBlur={() => updateSecurity(securityForm)}
                  className="bg-secondary border-border"
                />
              </div>
            </CardContent>
          </Card>

          {/* Reset Button */}
          <Button
            variant="outline"
            className="w-full gap-2"
            onClick={resetSettings}
          >
            <RotateCcw className="w-4 h-4" />
            Restaurar Padrões
          </Button>
        </div>
      </div>
    </MainLayout>
  );
};

export default Configuracoes;
