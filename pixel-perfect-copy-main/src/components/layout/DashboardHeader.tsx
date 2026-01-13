import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { useFilters } from "@/contexts/FilterContext";
import { exportToCSV } from "@/lib/exportUtils";
import { ReactNode } from "react";

interface DashboardHeaderProps {
    title: string;
    subtitle?: string;
    exportData?: any[];
    exportFileName?: string;
    children?: ReactNode; // For extra filters (e.g. project select)
}

export function DashboardHeader({
    title,
    subtitle,
    exportData,
    exportFileName = "export",
    children
}: DashboardHeaderProps) {
    const { dateRange, setDateRange } = useFilters();

    const handleExport = () => {
        if (exportData) {
            exportToCSV(exportData, exportFileName);
        }
    };

    return (
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
                {subtitle && <p className="text-muted-foreground">{subtitle}</p>}
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                {children}

                <div className="flex items-center gap-2">
                    <DatePickerWithRange date={dateRange} setDate={setDateRange} />
                    {exportData && (
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={handleExport}
                            title="Exportar dados para CSV"
                        >
                            <Download className="h-4 w-4" />
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}
