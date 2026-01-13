
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCompany } from "@/contexts/FilterContext";
import { Database } from "@/types/database.types";
import { MOCK_ADS } from "@/data/mockData";

export type TrafficAd = Database['public']['Tables']['traffic_ads']['Row'] & {
    plataforma?: string;
    grupo_anuncio?: string;
    campanha?: string;
};

export const useTrafficAds = () => {
    const { selectedCompany } = useCompany();

    return useQuery({
        queryKey: ["traffic_ads_db", selectedCompany],
        queryFn: async () => {
            let query = supabase.from("traffic_ads").select("*");

            if (selectedCompany !== 'consolidado') {
                query = query.eq('company', selectedCompany);
            }

            const { data, error } = await query;

            if (error) {
                console.warn("⚠️ fetching traffic ads failed, using MOCK data:", error);
                return MOCK_ADS as unknown as TrafficAd[];
            }

            if (!data || data.length === 0) {
                console.log("ℹ️ No traffic ads found, using MOCK data.");
                return MOCK_ADS as unknown as TrafficAd[];
            }

            return (data || []).map((ad: any) => ({
                ...ad,
                plataforma: 'Meta Ads',
                campanha: ad.campaign_name,
                grupo_anuncio: ad.adset_name,
            })) as TrafficAd[];
        },
        staleTime: 1000 * 60 * 10,
        refetchOnWindowFocus: false,
    });
};
