import { UserPlus, Shield, DollarSign, TrendingUp } from "lucide-react";

const activities = [
  { 
    icon: UserPlus, 
    title: "Novo consultor cadastrado", 
    description: "Maria Silva - Licença Pro",
    time: "Há 2 minutos",
    iconBg: "bg-primary/20 text-primary"
  },
  { 
    icon: Shield, 
    title: "Venda de seguro", 
    description: "João Santos vendeu seguro básico",
    time: "Há 15 minutos",
    iconBg: "bg-chart-2/20 text-chart-2"
  },
  { 
    icon: DollarSign, 
    title: "Comissão paga", 
    description: "R$ 1.250,00 para Pedro Lima",
    time: "Há 1 hora",
    iconBg: "bg-amber/20 text-amber"
  },
  { 
    icon: TrendingUp, 
    title: "Upgrade de licença", 
    description: "Ana Costa - Start → Pro",
    time: "Há 2 horas",
    iconBg: "bg-orange/20 text-orange"
  },
  { 
    icon: UserPlus, 
    title: "Novo consultor cadastrado", 
    description: "Carlos Mendes - Licença Start",
    time: "Há 3 horas",
    iconBg: "bg-primary/20 text-primary"
  },
];

export function RecentActivity() {
  return (
    <div className="bg-card rounded-xl border border-border p-5">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-foreground">Atividade Recente</h3>
        <p className="text-sm text-muted-foreground">Últimas ações na plataforma</p>
      </div>
      
      <div className="space-y-4">
        {activities.map((activity, index) => (
          <div key={index} className="flex items-start gap-4">
            <div className={`p-2 rounded-lg ${activity.iconBg}`}>
              <activity.icon className="w-4 h-4" />
            </div>
            
            <div className="flex-1 min-w-0">
              <p className="font-medium text-foreground text-sm">{activity.title}</p>
              <p className="text-sm text-muted-foreground truncate">{activity.description}</p>
            </div>
            
            <span className="text-xs text-muted-foreground whitespace-nowrap">{activity.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
