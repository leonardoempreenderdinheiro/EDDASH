
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCompany } from "@/contexts/FilterContext";
import { Database } from "@/types/database.types";
import { MOCK_CLIENTS } from "@/data/mockData";

export type Client = Database['public']['Tables']['clients']['Row'] & {
  consultant?: string;
  active_insurances?: number;
  profile?: string; // Add to DB schema if needed
  status?: string;  // Add to DB schema if needed
  income?: number;
  assets?: number;
  phone?: string;
  created_at: string;
};

export const useClients = () => {
  const { selectedCompany } = useCompany();

  return useQuery({
    queryKey: ["clients", selectedCompany],
    queryFn: async () => {
      let query = supabase
        .from("clients")
        .select(`
          *,
          insurances (count)
        `);

      if (selectedCompany !== 'consolidado') {
        query = query.eq('company', selectedCompany);
      }

      const { data, error } = await query;

      if (error) {
        console.warn("⚠️ fetching clients failed, using MOCK data:", error);
        return MOCK_CLIENTS as unknown as Client[];
      }

      if (!data || data.length === 0) {
        console.log("ℹ️ No clients found, using MOCK data.");
        return MOCK_CLIENTS as unknown as Client[];
      }

      // Map Supabase result to UI structure
      return (data || []).map((client: any) => ({
        ...client,
        active_insurances: client.insurances?.[0]?.count || 0, // Approximate count
        consultant: "Consultor Demo", // Need a real join on consultant_id -> profiles if available
        status: "ativo", // Mock status until added to DB
        profile: "moderado" // Mock profile until added to DB
      })) as Client[];
    },
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });
};
