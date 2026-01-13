import { cn } from "@/lib/utils";

type BadgeVariant = "elite" | "pro" | "start" | "ativo" | "inativo" | "pendente" | "aprovado" | "pago" | "cancelado" | "analise" | "moderado" | "conservador" | "arrojado" | "prospecto";

interface BadgeStatusProps {
  variant: BadgeVariant;
  children: React.ReactNode;
}

const variantStyles: Record<BadgeVariant, string> = {
  elite: "bg-amber/20 text-amber border-amber/30",
  pro: "bg-chart-2/20 text-chart-2 border-chart-2/30",
  start: "bg-primary/20 text-primary border-primary/30",
  ativo: "bg-primary/20 text-primary border-primary/30",
  inativo: "bg-rose/20 text-rose border-rose/30",
  pendente: "bg-muted text-muted-foreground border-border",
  aprovado: "bg-primary/20 text-primary border-primary/30",
  pago: "bg-primary/20 text-primary border-primary/30",
  cancelado: "bg-rose/20 text-rose border-rose/30",
  analise: "bg-amber/20 text-amber border-amber/30",
  moderado: "bg-amber/20 text-amber border-amber/30",
  conservador: "bg-chart-2/20 text-chart-2 border-chart-2/30",
  arrojado: "bg-orange/20 text-orange border-orange/30",
  prospecto: "bg-muted text-muted-foreground border-border",
};

export function BadgeStatus({ variant, children }: BadgeStatusProps) {
  return (
    <span className={cn(
      "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
      variantStyles[variant]
    )}>
      {children}
    </span>
  );
}
