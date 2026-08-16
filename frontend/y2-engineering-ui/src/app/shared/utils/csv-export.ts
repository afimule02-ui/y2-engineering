export function exportToCsv<T extends Record<string, any>>(data: T[], filename: string, columns?: { key: string; label: string }[]): void {
  if (!data.length) return;

  const keys = columns ? columns.map(c => c.key) : Object.keys(data[0]);
  const headers = columns ? columns.map(c => c.label) : keys;

  const csvRows = [
    headers.join(','),
    ...data.map(row =>
      keys.map(key => {
        let val = row[key];
        if (val === null || val === undefined) val = '';
        val = String(val).replace(/"/g, '""');
        return `"${val}"`;
      }).join(',')
    )
  ];

  const csvContent = csvRows.join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${filename}_${new Date().toISOString().substring(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(link.href);
}
