
import { NavLink } from "@/components/NavLink";
import {
  PieChart,
  LayoutDashboard,
  Users,
  UserCheck,
  Shield,
  DollarSign,
  TrendingUp,
  BarChart,
  ChevronLeft,
  ChevronDown,
  LogOut,
  Briefcase,
  Target
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { CompanySwitcher } from "@/components/layout/CompanySwitcher";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { motion } from "framer-motion";

// New Menu Structure
const menuGroups = [
  {
    title: "CONSOLIDADO",
    icon: PieChart,
    items: [
      { title: "Visão Global", url: "/consolidado", icon: PieChart },
    ],
  },
  {
    title: "VENDAS",
    icon: TrendingUp,
    items: [
      { title: "Dashboard Comercial", url: "/vendas", icon: LayoutDashboard },
      { title: "Consultores", url: "/consultores", icon: Users },
      { title: "Comissões", url: "/comissoes", icon: DollarSign },
    ],
  },
  {
    title: "MARKETING",
    icon: BarChart,
    items: [
      { title: "Performance (ROI)", url: "/marketing", icon: BarChart },
      { title: "Leads (CRM)", url: "/leads", icon: Briefcase },
      { title: "Tráfego Pago", url: "/trafego", icon: TrendingUp },
    ],
  },
  {
    title: "CLIENTES",
    icon: UserCheck,
    items: [
      { title: "Base de Clientes", url: "/clientes", icon: Users },
      { title: "Novos do Período", url: "/clientes/novos", icon: UserCheck }, // Placeholder route
    ],
  },
  {
    title: "GESTÃO",
    icon: Shield,
    items: [
      { title: "Central de Metas", url: "/metas", icon: Target },
      { title: "Configurações", url: "/configuracoes", icon: Shield },
    ],
  },
];


export function AppSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  // Default open states for groups
  const [openGroups, setOpenGroups] = useState<string[]>(["VENDAS", "MARKETING", "CONSOLIDADO"]);

  const { signOut } = useAuth();
  const navigate = useNavigate();

  const toggleGroup = (title: string) => {
    setOpenGroups(prev =>
      prev.includes(title)
        ? prev.filter(t => t !== title)
        : [...prev, title]
    );
  };

  const handleLogout = async () => {
    try {
      await signOut();
      navigate("/login");
    } catch (error) {
      toast.error("Erro ao sair.");
    }
  };

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 80 : 280 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="flex flex-col h-screen bg-sidebar/50 backdrop-blur-xl border-r border-sidebar-border z-40 relative shadow-2xl shadow-black/20"
    >
      {/* Header / Company Switcher */}
      <div className="flex items-center gap-3 px-4 py-6 border-b border-sidebar-border/50 min-h-[90px]">
        {!collapsed ? (
          <div className="w-full animate-in fade-in zoom-in duration-300">
            <CompanySwitcher />
          </div>
        ) : (
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center mx-auto shadow-lg shadow-primary/30">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
        )}

        {/* Collapse Button */}
        {!collapsed && (
          <button
            onClick={() => setCollapsed(true)}
            className="absolute -right-3 top-10 bg-card border border-border rounded-full p-1.5 hover:bg-primary hover:text-white transition-all shadow-md hover:scale-110 z-50 text-muted-foreground"
          >
            <ChevronLeft className="w-3 h-3" />
          </button>
        )}
        {collapsed && (
          <button
            onClick={() => setCollapsed(false)}
            className="w-full mt-4 p-1 flex justify-center hover:bg-white/5 rounded transition-colors group"
          >
            <ChevronLeft className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors rotate-180" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-6 px-3 scrollbar-thin scrollbar-thumb-muted/10 hover:scrollbar-thumb-muted/30 transition-colors">
        <nav className="space-y-6">
          {menuGroups.map((group) => (
            collapsed ? (
              // Simple icon when collapsed
              <div key={group.title} className="flex flex-col gap-2 items-center mb-6">
                <div className="p-2 rounded-lg bg-sidebar-accent/30 mb-1 ring-1 ring-inset ring-white/5" title={group.title}>
                  <group.icon className="w-5 h-5 text-muted-foreground" />
                </div>
                {group.items.map(item => (
                  <NavLink
                    key={item.title}
                    to={item.url}
                    className="p-2.5 rounded-lg hover:bg-primary/10 hover:text-primary text-muted-foreground transition-all duration-200 relative group"
                    activeClassName="bg-primary text-white shadow-lg shadow-primary/30 hover:bg-primary hover:text-white"
                  >
                    <item.icon className="w-5 h-5" />
                    {/* Tooltip on hover for collapsed state */}
                    <span className="absolute left-14 bg-popover text-popover-foreground px-2 py-1 rounded-md text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-xl border border-border/50">
                      {item.title}
                    </span>
                  </NavLink>
                ))}
              </div>
            ) : (
              // Collapsible Group when expanded
              <Collapsible
                key={group.title}
                open={openGroups.includes(group.title)}
                onOpenChange={() => toggleGroup(group.title)}
                className="space-y-1"
              >
                <CollapsibleTrigger className="flex items-center justify-between w-full px-3 py-2 text-[10px] font-bold text-muted-foreground/70 hover:text-primary transition-colors uppercase tracking-[1.5px] group">
                  <span className="flex items-center gap-2">
                    {group.title}
                  </span>
                  <ChevronDown className={cn("w-3 h-3 transition-transform duration-300 opacity-50 group-hover:opacity-100", openGroups.includes(group.title) ? "" : "-rotate-90")} />
                </CollapsibleTrigger>

                <CollapsibleContent className="space-y-1 pt-1 transition-all data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down overflow-hidden">
                  {group.items.map((item) => (
                    <NavLink
                      key={item.title}
                      to={item.url}
                      end={item.url === "/"}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-muted-foreground hover:bg-sidebar-accent/50 hover:text-foreground transition-all duration-200 ml-2 border border-transparent"
                      activeClassName="bg-gradient-to-r from-primary/10 to-transparent text-primary font-semibold border-l-2 border-l-primary !border-transparent shadow-sm"
                    >
                      <item.icon className="w-4 h-4 shrink-0 opacity-80" />
                      <span className="text-sm">{item.title}</span>
                    </NavLink>
                  ))}
                </CollapsibleContent>
              </Collapsible>
            )
          ))}
        </nav>
      </div>

      {/* Logout */}
      <div className="p-4 border-t border-sidebar-border/50 bg-black/10">
        <button
          onClick={handleLogout}
          className={cn(
            "flex items-center gap-3 px-4 py-3 rounded-xl text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all w-full group",
            collapsed && "justify-center px-0"
          )}>
          <LogOut className="w-5 h-5 group-hover:scale-110 transition-transform" />
          {!collapsed && <span className="text-sm font-medium">Sair da Conta</span>}
        </button>
      </div>
    </motion.aside>
  );
}
