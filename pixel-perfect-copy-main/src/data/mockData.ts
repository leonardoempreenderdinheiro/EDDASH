
import { subDays, startOfMonth, subMonths } from "date-fns";

// HELPER: Generate dates
const today = new Date();
const daysAgo = (days: number) => subDays(today, days).toISOString();

// MOCK PROFILES
export const MOCK_PROFILES = [
    { id: "mock-1", full_name: "Consultor Demo", email: "consultor@demo.com", role: "Consultor", company: "Ed Capital", status: 'active', created_at: daysAgo(100) },
    { id: "mock-2", full_name: "Closer Elite", email: "closer@demo.com", role: "Closer", company: "Ed Seguros", status: 'active', created_at: daysAgo(90) },
    { id: "mock-3", full_name: "SDR Master", email: "sdr@demo.com", role: "SDR", company: "Ed Capital", status: 'active', created_at: daysAgo(80) },
];

// MOCK INSURANCES (Sales)
export const MOCK_INSURANCES = Array.from({ length: 25 }).map((_, i) => ({
    id: `mnock-ins-${i}`,
    client_id: `mock-client-${i}`,
    consultant_id: MOCK_PROFILES[i % 3].id,
    consultant_name: MOCK_PROFILES[i % 3].full_name,
    product_name: i % 2 === 0 ? "Seguro de Vida" : "Previdência Privada",
    premium_value: 500 + (i * 150), // Varied amounts
    start_date: daysAgo(i * 2),
    status: 'ativo',
    policy_number: `POL-MOCK-${i}`,
    utm_source: i % 3 === 0 ? "Google" : i % 3 === 1 ? "Facebook" : "Indicação",
    origin: i % 5 === 0 ? 'Ao Vivo' : 'Digital'
}));

// MOCK LEADS
export const MOCK_LEADS = Array.from({ length: 60 }).map((_, i) => ({
    id: `mock-lead-${i}`,
    name: `Lead Mock ${i}`,
    email: `lead${i}@mock.com`,
    phone: `1199999${i}99`,
    date: daysAgo(i),
    funil: i < 10 ? 'Venda' : i < 30 ? 'MQL' : 'Lead',
    utm_source: i % 3 === 0 ? "Google" : "Instagram",
    utm_medium: "cpc",
    utm_campaign: "Institucional",
    status: i < 10 ? 'Cliente' : i < 30 ? 'Qualificado' : 'Novo',
    meeting_status: i < 20 ? 'realizada' : 'agendada'
}));

// MOCK CLIENTS
export const MOCK_CLIENTS = Array.from({ length: 15 }).map((_, i) => ({
    id: `mock-client-${i}`,
    name: `Cliente Mock ${i}`,
    email: `cliente${i}@mock.com`,
    phone: `1198888${i}88`,
    status: 'ativo',
    consultant_id: MOCK_PROFILES[i % 3].id,
    created_at: daysAgo(i * 5),
    company: 'Ed Capital',
    active_insurances: 1
}));

// MOCK ADS
export const MOCK_ADS = Array.from({ length: 30 }).map((_, i) => ({
    id: `mock-ad-${i}`,
    date_start: subDays(today, i).toISOString().split('T')[0],
    campaign_name: 'Campanha Mock Institucional',
    ad_name: 'Ad Criativo ' + (i % 5),
    valor_investido: 150 + (i * 10),
    impressoes: 1000 + (i * 100),
    cliques_no_link: 50 + i,
    views_pagina_destino: 40 + i
}));

// MOCK GOALS
export const MOCK_GOALS = [
    { user_name: "Consultor Demo", metric: 'revenue', target_value: 50000 },
    { user_name: "Closer Elite", metric: 'revenue', target_value: 100000 },
    { user_name: "SDR Master", metric: 'sales_target', target_value: 20 },
];
