
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCompany } from "@/contexts/FilterContext";
import { Database } from "@/types/database.types";
import { MOCK_LEADS } from "@/data/mockData";

export type Lead = Database['public']['Tables']['leads']['Row'];

export const useLeads = () => {
    const { selectedCompany } = useCompany();

    return useQuery({
        queryKey: ["leads", selectedCompany],
        queryFn: async () => {
            let query = supabase.from("leads").select("*");

            if (selectedCompany !== 'consolidado') {
                query = query.eq('company', selectedCompany);
            }

            const { data, error } = await query;

            if (error) {
                console.warn("⚠️ fetching leads failed, using MOCK data:", error);
                return MOCK_LEADS as unknown as Lead[];
            }

            if (!data || data.length === 0) {
                console.log("ℹ️ No leads found, using MOCK data.");
                return MOCK_LEADS as unknown as Lead[];
            }

            return data as Lead[];
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
        refetchOnWindowFocus: false,
    });
};
