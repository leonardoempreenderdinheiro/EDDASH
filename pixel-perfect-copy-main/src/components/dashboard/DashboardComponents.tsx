import { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface KpiCardProps {
    title: string;
    value: string;
    change: string;
    positive: boolean;
    icon: React.ElementType;
}

export const KpiCard = ({ title, value, change, positive, icon: Icon }: KpiCardProps) => (
    <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
            <Icon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
            <div className="text-2xl font-bold">{value}</div>
            <p className={`text-xs ${positive ? "text-emerald-500" : "text-red-500"} flex items-center mt-1`}>
                {positive ? "+" : ""}{change}
                <span className="text-muted-foreground ml-1">vs mês anterior</span>
            </p>
        </CardContent>
    </Card>
);

export const DashboardSection = ({ title, children }: { title: string, children: ReactNode }) => (
    <div className="space-y-4 mb-8">
        <h2 className="text-xl font-bold tracking-tight text-foreground/90 border-l-4 border-primary pl-3">{title}</h2>
        {children}
    </div>
);
