import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface ReportData {
    headers: string[];
    rows: (string | number)[][];
    title: string;
}

/**
 * Exports data to an Excel file
 */
export const exportToExcel = (data: ReportData, fileName: string) => {
    const ws = XLSX.utils.aoa_to_sheet([data.headers, ...data.rows]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Relatório');

    // Auto-size columns
    const colWidths = data.headers.map((header, i) => {
        const maxLength = Math.max(
            header.length,
            ...data.rows.map(row => String(row[i] || '').length)
        );
        return { wch: Math.min(maxLength + 2, 50) };
    });
    ws['!cols'] = colWidths;

    XLSX.writeFile(wb, `${fileName}.xlsx`);
};

/**
 * Exports data to a PDF file
 */
export const exportToPDF = (data: ReportData, fileName: string) => {
    const doc = new jsPDF();

    // Add title
    doc.setFontSize(18);
    doc.setTextColor(33, 33, 33);
    doc.text(data.title, 14, 22);

    // Add date
    doc.setFontSize(10);
    doc.setTextColor(128, 128, 128);
    doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')}`, 14, 30);

    // Add table
    autoTable(doc, {
        head: [data.headers],
        body: data.rows,
        startY: 40,
        theme: 'striped',
        headStyles: {
            fillColor: [59, 130, 246], // Blue
            textColor: [255, 255, 255],
            fontStyle: 'bold',
        },
        styles: {
            fontSize: 9,
            cellPadding: 3,
        },
        alternateRowStyles: {
            fillColor: [245, 247, 250],
        },
    });

    doc.save(`${fileName}.pdf`);
};

/**
 * Formats currency for reports
 */
export const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    }).format(value);
};

/**
 * Formats date for reports
 */
export const formatDate = (date: string | Date): string => {
    return new Date(date).toLocaleDateString('pt-BR');
};

/**
 * Generates consultants report data
 */
export const generateConsultantsReport = (profiles: any[]): ReportData => ({
    title: 'Relatório de Consultores',
    headers: ['Nome', 'Email', 'Cargo', 'Empresa', 'Status', 'Data Cadastro'],
    rows: profiles.map(p => [
        p.full_name || '-',
        p.email || '-',
        p.role || '-',
        p.company || '-',
        p.status === 'active' ? 'Ativo' : 'Pendente',
        p.created_at ? formatDate(p.created_at) : '-',
    ]),
});

/**
 * Generates insurances/sales report data
 */
export const generateSalesReport = (insurances: any[]): ReportData => ({
    title: 'Relatório de Vendas de Seguros',
    headers: ['Produto', 'Cliente', 'Valor Premium', 'Status', 'Data Início', 'Apólice'],
    rows: insurances.map(i => [
        i.product_name || '-',
        i.client_id || '-',
        formatCurrency(i.premium_value || 0),
        i.status || '-',
        i.start_date ? formatDate(i.start_date) : '-',
        i.policy_number || '-',
    ]),
});

/**
 * Generates commissions report data
 */
export const generateCommissionsReport = (commissions: any[]): ReportData => ({
    title: 'Relatório de Comissões',
    headers: ['Descrição', 'Tipo', 'Nível', 'Valor', 'Competência', 'Status'],
    rows: commissions.map(c => [
        c.description || '-',
        c.type || '-',
        c.level || '-',
        formatCurrency(c.amount || 0),
        c.competence || '-',
        c.status === 'aprovado' ? 'Aprovado' : 'Pendente',
    ]),
});

/**
 * Generates leads report data
 */
export const generateLeadsReport = (leads: any[]): ReportData => ({
    title: 'Relatório de Leads',
    headers: ['Nome', 'Email', 'Telefone', 'Funil', 'Origem', 'Campanha', 'Status', 'Data'],
    rows: leads.map(l => [
        l.name || '-',
        l.email || '-',
        l.phone || '-',
        l.funil || '-',
        l.utm_source || '-',
        l.utm_campaign || '-',
        l.status || '-',
        l.date ? formatDate(l.date) : '-',
    ]),
});

/**
 * Generates clients report data
 */
export const generateClientsReport = (clients: any[]): ReportData => ({
    title: 'Relatório de Clientes',
    headers: ['Nome', 'Email', 'Telefone', 'Renda', 'Patrimônio', 'Perfil', 'Status'],
    rows: clients.map(c => [
        c.name || '-',
        c.email || '-',
        c.phone || '-',
        formatCurrency(c.income || 0),
        formatCurrency(c.assets || 0),
        c.profile || '-',
        c.status || '-',
    ]),
});

/**
 * Generates traffic ads report data
 */
export const generateTrafficReport = (ads: any[]): ReportData => ({
    title: 'Relatório de Tráfego Pago',
    headers: ['Campanha', 'Anúncio', 'Investimento', 'Impressões', 'Cliques', 'CTR', 'CPC', 'Data'],
    rows: ads.map(a => [
        a.campaign_name || '-',
        a.ad_name || '-',
        formatCurrency(a.valor_investido || 0),
        a.impressoes || 0,
        a.cliques_no_link || 0,
        `${(a.ctr_link || 0).toFixed(2)}%`,
        formatCurrency(a.link_cpc || 0),
        a.date_start ? formatDate(a.date_start) : '-',
    ]),
});
