import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCompany } from "@/contexts/FilterContext";
import { Database } from "@/integrations/supabase/types";

export type Budget = Database['public']['Tables']['budgets']['Row'];
export type InsertBudget = Database['public']['Tables']['budgets']['Insert'];

export const useBudgets = () => {
    const { selectedCompany } = useCompany();
    const queryClient = useQueryClient();

    const { data: budgets, isLoading, error } = useQuery({
        queryKey: ["budgets", selectedCompany],
        queryFn: async () => {
            let query = supabase.from("budgets").select("*");

            if (selectedCompany !== 'consolidado') {
                query = query.eq('company', selectedCompany);
            }

            const { data, error } = await query;

            if (error) {
                console.error("Error fetching budgets:", error);
                return [];
            }

            return data as Budget[];
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
    });

    const createBudget = useMutation({
        mutationFn: async (newBudget: InsertBudget) => {
            const { data, error } = await (supabase.from("budgets") as any).insert(newBudget).select().single();
            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["budgets"] });
        },
    });

    return {
        budgets,
        isLoading,
        error,
        createBudget
    };
};
