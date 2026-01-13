import { Trophy, Medal, Award } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { BadgeStatus } from "@/components/ui/badge-status";

const consultants = [
  { rank: 1, name: "Maria Silva", initials: "MS", license: "elite", value: "R$ 12.450,00", sales: 45 },
  { rank: 2, name: "João Santos", initials: "JS", license: "pro", value: "R$ 9.870,00", sales: 38 },
  { rank: 3, name: "Ana Costa", initials: "AC", license: "elite", value: "R$ 8.540,00", sales: 32 },
  { rank: 4, name: "Pedro Lima", initials: "PL", license: "pro", value: "R$ 7.230,00", sales: 28 },
  { rank: 5, name: "Carla Mendes", initials: "CM", license: "start", value: "R$ 5.980,00", sales: 24 },
];

const RankIcon = ({ rank }: { rank: number }) => {
  if (rank === 1) return <Trophy className="w-5 h-5 text-amber" />;
  if (rank === 2) return <Medal className="w-5 h-5 text-muted-foreground" />;
  if (rank === 3) return <Award className="w-5 h-5 text-orange" />;
  return <span className="text-sm text-muted-foreground w-5 text-center">{rank}º</span>;
};

export function TopConsultants() {
  return (
    <div className="bg-card rounded-xl border border-border p-5">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-foreground">Top Consultores</h3>
        <p className="text-sm text-muted-foreground">Ranking do mês atual</p>
      </div>
      
      <div className="space-y-3">
        {consultants.map((consultant) => (
          <div 
            key={consultant.rank}
            className="flex items-center gap-4 p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
          >
            <RankIcon rank={consultant.rank} />
            
            <Avatar className="h-9 w-9 bg-muted">
              <AvatarFallback className="text-sm font-medium bg-muted text-foreground">
                {consultant.initials}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <p className="font-medium text-foreground truncate">{consultant.name}</p>
              <BadgeStatus variant={consultant.license as "elite" | "pro" | "start"}>
                {consultant.license.charAt(0).toUpperCase() + consultant.license.slice(1)}
              </BadgeStatus>
            </div>
            
            <div className="text-right">
              <p className="font-semibold text-foreground">{consultant.value}</p>
              <p className="text-sm text-muted-foreground">{consultant.sales} vendas</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
