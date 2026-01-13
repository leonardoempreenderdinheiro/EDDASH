
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCompany } from "@/contexts/FilterContext";
import { Database } from "@/types/database.types";
import { MOCK_PROFILES } from "@/data/mockData";

export interface Profile {
    id: string;
    email?: string;
    full_name?: string;
    role?: string;
    company?: string;
    status?: string;
    created_at: string;
}

export interface NewProfile {
    email: string;
    full_name: string;
    role?: string;
    company?: string;
    status?: string;
}

export const useProfiles = () => {
    const { selectedCompany } = useCompany();
    const queryClient = useQueryClient();

    const query = useQuery({
        queryKey: ["profiles", selectedCompany],
        queryFn: async () => {
            let query = supabase
                .from("profiles")
                .select("*")
                .order("created_at", { ascending: false });

            if (selectedCompany !== 'consolidado') {
                query = query.eq('company', selectedCompany);
            }

            const { data, error } = await query;

            if (error) {
                console.warn("⚠️ fetching profiles failed, using MOCK data:", error);
                return MOCK_PROFILES as unknown as Profile[];
            }

            if (!data || data.length === 0) {
                console.log("ℹ️ No profiles found, using MOCK data.");
                return MOCK_PROFILES as unknown as Profile[];
            }

            return data as Profile[];
        },
        staleTime: 1000 * 60 * 15,
        refetchOnWindowFocus: true,
    });

    const createProfile = useMutation({
        mutationFn: async (newProfile: NewProfile) => {
            // Generate a UUID for the profile
            const id = crypto.randomUUID();

            const { data, error } = await supabase
                .from("profiles")
                .insert({
                    id,
                    email: newProfile.email,
                    full_name: newProfile.full_name,
                    role: newProfile.role || 'Equipe',
                    company: newProfile.company || selectedCompany,
                    status: newProfile.status || 'active',
                    created_at: new Date().toISOString(),
                })
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["profiles"] });
        },
    });

    const updateProfile = useMutation({
        mutationFn: async (profile: Partial<Profile> & { id: string }) => {
            const { data, error } = await supabase
                .from("profiles")
                .update(profile)
                .eq("id", profile.id)
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["profiles"] });
        },
    });

    const deleteProfile = useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase
                .from("profiles")
                .delete()
                .eq("id", id);

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["profiles"] });
        },
    });

    return {
        ...query,
        createProfile,
        updateProfile,
        deleteProfile,
    };
};
