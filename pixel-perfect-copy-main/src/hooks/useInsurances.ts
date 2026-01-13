
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useFilters } from "@/contexts/FilterContext";
import { Database } from "@/types/database.types";
import { MOCK_INSURANCES } from "@/data/mockData";

export type Insurance = Database['public']['Tables']['insurances']['Row'] & {
    consultant_name?: string;
};

export const useInsurances = () => {
    const { selectedCompany } = useFilters();

    return useQuery({
        queryKey: ["insurances", selectedCompany],
        queryFn: async () => {
            let query = supabase
                .from("insurances")
                .select(`
                    *,
                    profiles!insurances_consultant_id_fkey (
                        full_name
                    )
                `);

            if (selectedCompany !== 'consolidado') {
                query = query.eq('company', selectedCompany);
            }

            const { data, error } = await query;

            if (error) {
                console.warn("⚠️ fetching insurances failed, using MOCK data:", error);
                return MOCK_INSURANCES as unknown as Insurance[];
            }

            if (!data || data.length === 0) {
                console.log("ℹ️ No insurances found, using MOCK data.");
                return MOCK_INSURANCES as unknown as Insurance[];
            }

            return (data || []).map((item: any) => ({
                ...item,
                consultant_name: item.profiles?.full_name || 'Desconhecido',
            })) as Insurance[];
        },
        staleTime: 1000 * 60 * 5,
        refetchOnWindowFocus: false,
    });
};
