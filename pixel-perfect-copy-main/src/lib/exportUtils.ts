/**
 * Converts an array of objects to a CSV string and triggers a download.
 */
export function exportToCSV(data: any[], fileName: string) {
    if (!data || data.length === 0) {
        console.warn("No data to export");
        return;
    }

    // 1. Get Headers from the first object keys
    const headers = Object.keys(data[0]);

    // 2. Map data to rows
    const rows = data.map(obj => {
        return headers.map(header => {
            const val = obj[header];
            // Format values for CSV (escaping quotes, handling objects)
            if (val === null || val === undefined) return '""';
            if (typeof val === 'object') return `"${JSON.stringify(val).replace(/"/g, '""')}"`;
            return `"${String(val).replace(/"/g, '""')}"`;
        }).join(',');
    });

    // 3. Assemble full CSV
    const csvContent = [
        headers.join(','),
        ...rows
    ].join('\n');

    // 4. Create Blob and trigger download
    const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.setAttribute("href", url);
    link.setAttribute("download", `${fileName}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
