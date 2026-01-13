
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCompany } from "@/contexts/FilterContext";
import { Database } from "@/integrations/supabase/types";
import { MOCK_GOALS } from "@/data/mockData";

export type Goal = Database['public']['Tables']['goals']['Row'];
export type InsertGoal = Database['public']['Tables']['goals']['Insert'];

export const useGoals = () => {
    const { selectedCompany } = useCompany();
    const queryClient = useQueryClient();

    const { data: goals, isLoading, error } = useQuery({
        queryKey: ["goals", selectedCompany],
        queryFn: async () => {
            let query = supabase.from("goals").select("*");

            if (selectedCompany !== 'consolidado') {
                query = query.eq('company', selectedCompany);
            }

            const { data, error } = await query;

            if (error) {
                console.warn("Error fetching goals, using mock:", error);
                return MOCK_GOALS as unknown as Goal[];
            }

            if (!data || data.length === 0) {
                return MOCK_GOALS as unknown as Goal[];
            }

            return data as Goal[];
        },
        staleTime: 1000 * 60 * 5,
    });

    const createGoal = useMutation({
        mutationFn: async (newGoal: InsertGoal) => {
            const { data, error } = await (supabase.from("goals") as any).insert(newGoal).select().single();
            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["goals"] });
        },
    });

    const updateGoal = useMutation({
        mutationFn: async (goal: Partial<Goal> & { id: string }) => {
            const { data, error } = await (supabase.from("goals") as any).update(goal).eq("id", goal.id).select().single();
            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["goals"] });
        },
    });

    // Helper to get a specific goal value by sector and metric
    const getGoal = (sector: string, metric: string, defaultValue: number = 0): number => {
        const goal = goals?.find(g => (g as any).sector === sector && (g as any).metric === metric);
        return goal ? Number(goal.target_value) || defaultValue : defaultValue;
    };

    // Helper to get all goals as a flat object for a sector
    const getGoalsBySector = (sector: string): Record<string, number> => {
        const sectorGoals: Record<string, number> = {};
        goals?.filter(g => (g as any).sector === sector).forEach(g => {
            sectorGoals[(g as any).metric] = Number(g.target_value) || 0;
        });
        return sectorGoals;
    };

    return {
        goals,
        isLoading,
        error,
        createGoal,
        updateGoal,
        getGoal,
        getGoalsBySector
    };
};
