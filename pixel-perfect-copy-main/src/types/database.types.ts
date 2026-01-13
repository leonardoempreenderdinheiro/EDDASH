export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            leads: {
                Row: {
                    id: string
                    created_at: string
                    name: string | null
                    email: string | null
                    phone: string | null
                    status: string | null
                    company: string | null
                    utm_source: string | null
                    utm_medium: string | null
                    utm_campaign: string | null
                    utm_content: string | null
                    utm_term: string | null
                    valid_lead: boolean | null
                    date: string | null
                    funil: string | null
                    is_mql: boolean | null
                    sdr_id: string | null
                    origin_detailed: string | null
                    meeting_date: string | null
                    meeting_status: string | null
                }
                Insert: {
                    id?: string
                    created_at?: string
                    name?: string | null
                    email?: string | null
                    phone?: string | null
                    status?: string | null
                    company?: string | null
                    utm_source?: string | null
                    utm_medium?: string | null
                    utm_campaign?: string | null
                    utm_content?: string | null
                    utm_term?: string | null
                    valid_lead?: boolean | null
                    date?: string | null
                    funil?: string | null
                    is_mql?: boolean | null
                    sdr_id?: string | null
                    origin_detailed?: string | null
                    meeting_date?: string | null
                    meeting_status?: string | null
                }
                Update: {
                    id?: string
                    created_at?: string
                    name?: string | null
                    email?: string | null
                    phone?: string | null
                    status?: string | null
                    company?: string | null
                    utm_source?: string | null
                    utm_medium?: string | null
                    utm_campaign?: string | null
                    utm_content?: string | null
                    utm_term?: string | null
                    valid_lead?: boolean | null
                    date?: string | null
                    funil?: string | null
                    is_mql?: boolean | null
                    sdr_id?: string | null
                    origin_detailed?: string | null
                    meeting_date?: string | null
                    meeting_status?: string | null
                }
            }
            traffic_ads: {
                Row: {
                    id: string
                    created_at: string
                    ad_name: string | null
                    campaign_name: string | null
                    adset_name: string | null
                    status: string | null
                    company: string | null
                    valor_investido: number | null
                    impressoes: number | null
                    cliques: number | null
                    cliques_no_link: number | null
                    ctr: number | null
                    ctr_link: number | null
                    link_cpc: number | null
                    alcance: number | null
                    conversoes: number | null
                    custo_conversao: number | null
                    date_start: string | null
                    date_stop: string | null
                    views_pagina_destino: number | null
                    custo_por_view_pagina_destino: number | null
                    frequencia: number | null
                    cpm_all: number | null
                    ctr_all: number | null
                    cpc_all: number | null
                }
                Insert: {
                    id?: string
                    created_at?: string
                    ad_name?: string | null
                    campaign_name?: string | null
                    adset_name?: string | null
                    status?: string | null
                    company?: string | null
                    valor_investido?: number | null
                    impressoes?: number | null
                    cliques?: number | null
                    cliques_no_link?: number | null
                    ctr?: number | null
                    ctr_link?: number | null
                    link_cpc?: number | null
                    alcance?: number | null
                    conversoes?: number | null
                    custo_conversao?: number | null
                    date_start?: string | null
                    date_stop?: string | null
                    views_pagina_destino?: number | null
                    custo_por_view_pagina_destino?: number | null
                    frequencia?: number | null
                    cpm_all?: number | null
                    ctr_all?: number | null
                    cpc_all?: number | null
                }
                Update: {
                    id?: string
                    created_at?: string
                    ad_name?: string | null
                    campaign_name?: string | null
                    adset_name?: string | null
                    status?: string | null
                    company?: string | null
                    valor_investido?: number | null
                    impressoes?: number | null
                    cliques?: number | null
                    cliques_no_link?: number | null
                    ctr?: number | null
                    ctr_link?: number | null
                    link_cpc?: number | null
                    alcance?: number | null
                    conversoes?: number | null
                    custo_conversao?: number | null
                    date_start?: string | null
                    date_stop?: string | null
                    views_pagina_destino?: number | null
                    custo_por_view_pagina_destino?: number | null
                    frequencia?: number | null
                    cpm_all?: number | null
                    ctr_all?: number | null
                    cpc_all?: number | null
                }
            }
            insurances: {
                Row: {
                    id: string
                    created_at: string
                    client_id: string | null
                    consultant_id: string | null
                    product_name: string | null
                    premium_value: number | null
                    status: string | null
                    company: string | null
                    start_date: string | null
                    policy_number: string | null
                    utm_source: string | null
                }
                Insert: {
                    id?: string
                    created_at?: string
                    client_id?: string | null
                    consultant_id?: string | null
                    product_name?: string | null
                    premium_value?: number | null
                    status?: string | null
                    company?: string | null
                    start_date?: string | null
                    policy_number?: string | null
                    utm_source?: string | null
                }
                Update: {
                    id?: string
                    created_at?: string
                    client_id?: string | null
                    consultant_id?: string | null
                    product_name?: string | null
                    premium_value?: number | null
                    status?: string | null
                    company?: string | null
                    start_date?: string | null
                    policy_number?: string | null
                    utm_source?: string | null
                }
            }
            commissions: {
                Row: {
                    id: string
                    created_at: string
                    consultant_id: string | null
                    insurance_id: string | null
                    description: string | null
                    type: string | null
                    level: string | null
                    amount: number | null
                    competence: string | null
                    status: string | null
                }
                Insert: {
                    id?: string
                    created_at?: string
                    consultant_id?: string | null
                    insurance_id?: string | null
                    description?: string | null
                    type?: string | null
                    level?: string | null
                    amount?: number | null
                    competence?: string | null
                    status?: string | null
                }
                Update: {
                    id?: string
                    created_at?: string
                    consultant_id?: string | null
                    insurance_id?: string | null
                    description?: string | null
                    type?: string | null
                    level?: string | null
                    amount?: number | null
                    competence?: string | null
                    status?: string | null
                }
            }
            clients: {
                Row: {
                    id: string
                    name: string
                    email: string | null
                    company: string | null
                }
                Insert: {
                    id?: string
                    name?: string
                    email?: string | null
                    company?: string | null
                }
                Update: {
                    id?: string
                    name?: string
                    email?: string | null
                    company?: string | null
                }
            }
            profiles: {
                Row: {
                    id: string
                    full_name: string | null
                    company: string | null
                    role: string | null
                }
                Insert: {
                    id?: string
                    full_name?: string | null
                    company: string | null
                    role?: string | null
                }
                Update: {
                    id?: string
                    full_name?: string | null
                    company: string | null
                    role?: string | null
                }
            }
            goals: {
                Row: {
                    id: string
                    created_at: string
                    company: string
                    sector: string
                    metric: string
                    target_value: number
                    period: string
                    current_value: number | null
                    profile_id: string | null
                }
                Insert: {
                    id?: string
                    created_at?: string
                    company: string
                    sector: string
                    metric: string
                    target_value: number
                    period: string
                    current_value?: number | null
                    profile_id?: string | null
                }
                Update: {
                    id?: string
                    created_at?: string
                    company?: string
                    sector?: string
                    metric?: string
                    target_value?: number
                    period?: string
                    current_value?: number | null
                    profile_id?: string | null
                }
            }
            budgets: {
                Row: {
                    id: string
                    created_at: string
                    company: string
                    project: string | null
                    platform: string | null
                    amount: number
                    period: string
                }
                Insert: {
                    id?: string
                    created_at?: string
                    company: string
                    project?: string | null
                    platform?: string | null
                    amount: number
                    period: string
                }
                Update: {
                    id?: string
                    created_at?: string
                    company?: string
                    project?: string | null
                    platform?: string | null
                    amount?: number
                    period?: string
                }
            }
        }
    }
}
