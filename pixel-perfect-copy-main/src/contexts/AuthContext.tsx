import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Session, User } from "@supabase/supabase-js";

interface Profile {
    id: string;
    email: string | null;
    full_name: string | null;
    role: 'Master' | 'CMO' | 'CEO' | 'CTO' | 'CCO' | 'Socio' | 'Gestor' | 'Equipe' | null;
    company: 'Ed Capital' | 'Ed Seguros' | 'Techfinance' | null;
    avatar_url: string | null;
    status: 'pending' | 'active' | 'rejected' | null;
}

interface AuthContextType {
    session: Session | null;
    user: User | null;
    profile: Profile | null;
    loading: boolean;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    session: null,
    user: null,
    profile: null,
    loading: true,
    signOut: async () => { },
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [session, setSession] = useState<Session | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // --- BYPASS LOGIN START ---
        console.warn("AuthContext: Login bypassed for UI development.");
        const mockUser = {
            id: "mock-master-id",
            email: "contas@empreenderdinheiro.com",
            aud: "authenticated",
            created_at: new Date().toISOString(),
        };
        const mockProfile: Profile = {
            id: "mock-master-id",
            email: "contas@empreenderdinheiro.com",
            full_name: "Master Developer",
            role: "Master",
            company: "Ed Capital",
            status: "active",
            avatar_url: null
        };

        setSession({
            access_token: "mock-token",
            refresh_token: "mock-refresh",
            expires_in: 3600,
            token_type: "bearer",
            user: mockUser
        } as Session);
        setUser(mockUser as User);
        setProfile(mockProfile);
        setLoading(false);
        return;
        // --- BYPASS LOGIN END ---

        // Safety timeout to ensure loading eventually stops
        const safetyTimeout = setTimeout(() => {
            if (loading) {
                console.warn("AuthContext: Safety timeout reached, forcing loading to false");
                setLoading(false);
            }
        }, 5000);

        // Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            console.log("AuthContext: Initial session:", session?.user?.email);
            setSession(session);
            setUser(session?.user ?? null);
            if (session?.user) {
                fetchProfile(session.user.id);
            } else {
                console.log("AuthContext: No session, stopping loading");
                setLoading(false);
                clearTimeout(safetyTimeout);
            }
        }).catch(err => {
            console.error("AuthContext: Error getting session:", err);
            setLoading(false);
            clearTimeout(safetyTimeout);
        });

        // Listen for changes
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            console.log("AuthContext: Auth state change:", _event, session?.user?.email);
            setSession(session);
            setUser(session?.user ?? null);
            if (session?.user) {
                fetchProfile(session.user.id);
            } else {
                console.log("AuthContext: Auth state change: No user, stopping loading");
                setProfile(null);
                setLoading(false);
            }
        });

        return () => {
            subscription.unsubscribe();
            clearTimeout(safetyTimeout);
        };
    }, []);

    const fetchProfile = async (userId: string) => {
        console.log("AuthContext: Fetching profile for:", userId);
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();

            if (error) {
                console.error('AuthContext: Error fetching profile:', error);
            } else {
                console.log("AuthContext: Profile fetched:", data);
                setProfile(data as Profile);
            }
        } catch (error) {
            console.error('AuthContext: Catch error:', error);
        } finally {
            console.log("AuthContext: Finished fetching profile, setting loading to false");
            setLoading(false);
        }
    };

    const signOut = async () => {
        await supabase.auth.signOut();
    };

    return (
        <AuthContext.Provider value={{ session, user, profile, loading, signOut }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
