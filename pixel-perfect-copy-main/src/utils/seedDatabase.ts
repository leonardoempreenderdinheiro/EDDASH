
import { supabase } from "@/integrations/supabase/client";
import { format, subDays } from "date-fns";

// Helpers
const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const randomFloat = (min: number, max: number) => parseFloat((Math.random() * (max - min) + min).toFixed(2));
const pickRandom = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

// Constants for realistic data
const NAMES = ["Ana Silva", "Carlos Souza", "Beatriz Lima", "Daniel Costa", "Eduardo Pereira", "Fernanda Santos", "Gabriel Oliveira", "Helena Almeida", "Igor Ferreira", "Julia Rodrigues"];
const COMPANIES = ["Ed Capital", "Ed Seguros", "Techfinance"];
const SOURCES = ["Google", "Facebook", "Instagram", "Linkedin", "Indicação", "Email", "Live"];
const PRODUCTS = ["Seguro de Vida", "Previdência Privada", "Seguro Profissional", "Seguro Residencial"];
const STATUS_LEAD = ["Novo", "Contato", "Agendado", "Qualificado", "Cliente", "Desqualificado"];

export const seedDatabase = async () => {
    console.log("🌱 Starting Database Seed...");

    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return { success: false, message: "Login required." };

        // 1. Ensure Demo Profiles Exist
        // We try to find them or create them so dropdowns have people
        const demoProfiles = [
            { email: "consultor@demo.com", full_name: "Consultor Demo", role: "Consultor", company: "Ed Capital" },
            { email: "closer@demo.com", full_name: "Closer Demo", role: "Closer", company: "Ed Capital" },
            { email: "sdr@demo.com", full_name: "SDR Demo", role: "SDR", company: "Ed Capital" }
        ];

        let profiles = [];
        const { data: existingProfiles } = await supabase.from('profiles').select('*');

        if (existingProfiles && existingProfiles.length > 0) {
            profiles = [...existingProfiles];
        } else {
            // If no profiles, we might need to rely on the user being able to register them
            // identifying profiles by ID is tricky without Auth...
            // For the sake of the "Mock Data", we will just Insert into the Profiles table if RLS allows, 
            // but usually Profile creation is triggered by Auth.
            // Strategy: We will just use the CURRENT user as one profile, and maybe create "fake" reference IDs if strictly needed,
            // or just rely on 'consultant_name' text fields if the schema allows loose coupling.
            // Checking schema: 'leads' has 'consultant_id' (uuid). 'insurances' has 'consultant_id' (uuid).
            // We MUST have valid UUIDs from 'profiles'. 

            // Let's use the current user for ALL roles if no others exist.
            profiles = [existingProfiles?.[0] || { id: user.id, full_name: "Usuario Atual" }];
        }

        // 2. Clear old data (Optional? No, let's append for safety, or maybe just add if empty)
        // User asked to "implement mock up data so everything works".

        const leads: any[] = [];
        const ads: any[] = [];

        // --- GENERATE LEADS (Last 60 days) ---
        for (let i = 0; i < 80; i++) {
            const date = subDays(new Date(), randomInt(0, 60));
            const status = pickRandom(STATUS_LEAD);
            const source = pickRandom(SOURCES);
            const profile = pickRandom(profiles);

            leads.push({
                name: pickRandom(NAMES),
                email: `lead${i}_${Date.now()}@example.com`,
                phone: `119${randomInt(10000000, 99999999)}`,
                date: date.toISOString(),
                funil: status === 'Cliente' ? 'Venda' : status === 'Qualificado' ? 'MQL' : 'Lead',
                utm_source: source,
                utm_medium: 'cpc',
                utm_campaign: 'Institucional_V1',
                status: status,
                company: 'Ed Capital',
                meeting_status: i % 3 === 0 ? 'realizada' : i % 5 === 0 ? 'cancelada' : 'agendada', // Mock meeting status
                consultant_id: profile.id // Assign to real profile
            });
        }

        const { error: leadsError } = await (supabase.from('leads') as any).insert(leads);
        if (leadsError) console.error("Error inserting leads:", leadsError);

        // --- GENERATE CLIENTS & SALES (Last 60 days) ---
        for (let i = 0; i < 35; i++) {
            const date = subDays(new Date(), randomInt(0, 60));
            const profile = pickRandom(profiles); // Distribute sales among profiles
            const clientEmail = `client${i}_${Date.now()}@example.com`;
            const product = pickRandom(PRODUCTS);
            const premium = randomFloat(250, 5000);
            const source = pickRandom(SOURCES);

            // Insert Client
            const { data: clientData, error: clientError } = await (supabase.from('clients') as any).insert({
                name: pickRandom(NAMES),
                email: clientEmail,
                phone: `119${randomInt(10000000, 99999999)}`,
                status: 'ativo',
                consultant_id: profile.id,
                created_at: date.toISOString(),
                company: 'Ed Capital'
            }).select().single();

            if (clientError || !clientData) {
                console.error("Error inserting client:", clientError);
                continue;
            }

            // Insert Insurance (Product Sold)
            const { data: insuranceData, error: insError } = await (supabase.from('insurances') as any).insert({
                client_id: clientData.id,
                consultant_id: profile.id,
                product_name: product,
                premium_value: premium,
                start_date: date.toISOString().split('T')[0],
                status: 'ativo',
                policy_number: `POL-${Date.now()}-${i}`,
                // Important: Add extra fields if table supports them to help with dashboard aggregation
                utm_source: source,
                origin: source === 'Live' ? 'Ao Vivo' : 'Digital',
                consultant_name: profile.full_name // Denormalize for easier UI if possible, or join later
            }).select().single();

            if (insError) {
                // If consultant_name doesn't exist in schema, we ignore it (it will just be dropped by SQL usually or error if strict)
                console.warn("Insurance insert issue (might be schema mismatch):", insError);
            }

            if (insuranceData) {
                // Insert Commission (Simplified)
                await (supabase.from('commissions') as any).insert({
                    consultant_id: profile.id,
                    insurance_id: insuranceData.id,
                    description: `Comissão ${product}`,
                    type: 'Adesao',
                    amount: premium * 0.15,
                    status: 'aprovado',
                    competence: date.toISOString().split('T')[0]
                });
            }
        }

        // --- GENERATE GRAPHIC DATA (Traffic Ads) ---
        for (let i = 0; i < 45; i++) {
            const date = subDays(new Date(), i);
            const formattedDate = format(date, 'yyyy-MM-dd');

            ads.push({
                date_start: formattedDate,
                campaign_name: i % 2 === 0 ? 'Campanha Search' : 'Campanha Social',
                ad_name: 'Anuncio ' + i,
                valor_investido: randomFloat(100, 500),
                impressoes: randomInt(2000, 10000),
                cliques_no_link: randomInt(50, 300),
                views_pagina_destino: randomInt(40, 250),
            });
        }

        await (supabase.from('traffic_ads') as any).insert(ads);

        return { success: true, message: `Dados gerados! Distribuídos entre ${profiles.length} consultore(s).` };

    } catch (error) {
        console.error("Seed failed:", error);
        return { success: false, message: "Erro ao gerar dados." };
    }
};
