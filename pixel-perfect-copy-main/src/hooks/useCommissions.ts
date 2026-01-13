import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCompany } from "@/contexts/FilterContext";
import { Database } from "@/types/database.types";

export type Commission = Database['public']['Tables']['commissions']['Row'] & {
    consultant_name?: string;
    // UI Helpers
    tipo?: string;
    tipoVariant?: "start" | "pro" | "elite";
    nivelColor?: string;
    valor?: string;
};

export const useCommissions = () => {
    const { selectedCompany } = useCompany();

    return useQuery({
        queryKey: ["commissions", selectedCompany],
        queryFn: async () => {
            let query = supabase
                .from("commissions")
                .select(`
                    *,
                    profiles!inner (
                        full_name,
                        company
                    )
                `);

            if (selectedCompany !== 'consolidado') {
                query = query.eq('profiles.company', selectedCompany);
            }

            const { data, error } = await query;

            if (error) {
                console.error("Error fetching commissions:", error);
                return [];
            }

            return (data || []).map((item: any) => {
                // UI Mappings logic
                let variant: "start" | "pro" | "elite" = "start";
                if (item.type === 'Recorrencia') variant = "pro";
                if (item.type === 'Licenca') variant = "elite";

                let nColor = "text-primary";
                if (item.level === 'N1') nColor = "text-chart-2";
                if (item.level === 'N2') nColor = "text-amber";

                return {
                    ...item,
                    consultant_name: item.profiles?.full_name,
                    tipo: item.type === 'Adesao' ? 'Seguro M1' : item.type,
                    tipoVariant: variant,
                    nivelColor: nColor,
                    valor: new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(item.amount || 0),
                };
            }) as Commission[];
        },
        staleTime: 1000 * 60 * 5,
        refetchOnWindowFocus: false,
    });
};
