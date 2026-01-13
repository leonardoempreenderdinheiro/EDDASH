import fs from 'fs';
import { createClient } from '@supabase/supabase-js';
import { parse } from 'csv-parse/sync';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables from .env file
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase URL or Key in .env file');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const fileName = 'EDVERONIX - FLUXO DE ATT.csv';
const filePath = path.join(process.cwd(), 'traffic_data_upload', fileName);

if (!fs.existsSync(filePath)) {
    console.error(`File not found: ${filePath}`);
    process.exit(1);
}

console.log(`Reading file: ${filePath}`);
const fileContent = fs.readFileSync(filePath, 'utf-8');

const records = parse(fileContent, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
    relax_column_count: true
});

console.log(`Found ${records.length} records in CSV.`);

function parseNumber(val) {
    if (!val) return null;
    if (typeof val === 'number') return val;
    // Handle BR format: 1.000,00 -> 1000.00
    // Remove dots, replace comma with dot
    const clean = val.replace(/\./g, '').replace(',', '.');
    const num = parseFloat(clean);
    return isNaN(num) ? null : num;
}

function parseDate(val) {
    if (!val) return null;
    // Attempt to parse YYYY-MM-DD or DD/MM/YYYY
    // If it's YYYY-MM-DD, Date.parse works.
    // If DD/MM/YYYY, need to flip.
    if (val.includes('/')) {
        const parts = val.split('/');
        if (parts.length === 3) {
            return `${parts[2]}-${parts[1]}-${parts[0]}`;
        }
    }
    return val;
}

const formattedRecords = records.map(record => {
    return {
        date_start: parseDate(record.date_start),
        date_stop: parseDate(record.date_stop),
        account_id: record.account_id,
        campaign_id: record.campaign_id,
        campaign_name: record.campaign_name,
        adset_id: record.adset_id,
        adset_name: record.adset_name,
        ad_id: record.ad_id,
        ad_name: record.ad_name,
        objective: record.objective,
        valor_investido: parseNumber(record.valor_investido),
        impressoes: parseNumber(record.impressoes),
        alcance: parseNumber(record.alcance),
        frequencia: parseNumber(record.frequencia),
        cliques_no_link: parseNumber(record.cliques_no_link),
        ctr_link: parseNumber(record.ctr_link),
        link_cpc: parseNumber(record.link_cpc),
        cpm_all: parseNumber(record.cpm_all),
        ctr_all: parseNumber(record.ctr_all),
        cpc_all: parseNumber(record.cpc_all),
        views_pagina_destino: parseNumber(record.views_pagina_destino),
        custo_por_view_pagina_destino: parseNumber(record.custo_por_view_pagina_destino),
        id_geral: record.id_geral || (`${record.ad_id}_${record.date_start}`) // Fallback ID if missing
    };
});

console.log('Sample parsed record:', formattedRecords[0]);

const BATCH_SIZE = 50;

async function upload() {
    console.log('Starting upload to Supabase...');
    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < formattedRecords.length; i += BATCH_SIZE) {
        const batch = formattedRecords.slice(i, i + BATCH_SIZE);

        // We try to insert. If id_geral duplicates exist, we might want to ignore or update.
        // Since we don't know the constraints, insert is safest for now.
        // If unique violation occurs, we should perhaps ignore duplicates?
        // upsert requires a unique constraint.
        const { error } = await supabase.from('traffic_ads').upsert(batch, { onConflict: 'id_geral', ignoreDuplicates: false });

        if (error) {
            console.error(`Error processing batch ${i / BATCH_SIZE + 1}:`, error.message);
            errorCount += batch.length;
        } else {
            successCount += batch.length;
            process.stdout.write('.');
        }
    }

    console.log('\nUpload complete.');
    console.log(`Successfully processed: ${successCount}`);
    console.log(`Errors: ${errorCount}`);
}

upload();
