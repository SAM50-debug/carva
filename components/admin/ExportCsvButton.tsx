"use client";

import { Download } from "lucide-react";

type ExportCsvButtonProps = {
  data: any[];
  filename: string;
};

export default function ExportCsvButton({ data, filename }: ExportCsvButtonProps) {
  const handleDownload = () => {
    if (!data || data.length === 0) {
      alert("No data available to export.");
      return;
    }

    // Get all unique keys from the data to act as headers
    const headers = Array.from(
      new Set(data.flatMap(item => Object.keys(item)))
    ).filter(key => key !== "_id"); // exclude MongoDB ids if they exist at root

    // Build CSV content
    const csvRows = [];
    
    // Header row
    csvRows.push(headers.join(","));

    // Data rows
    for (const row of data) {
      const values = headers.map(header => {
        let val = row[header];
        
        // Convert objects/arrays to JSON strings
        if (typeof val === "object" && val !== null) {
          val = JSON.stringify(val);
        }
        
        // Escape quotes and wrap in quotes if there's a comma
        const stringVal = String(val ?? "").replace(/"/g, '""');
        return `"${stringVal}"`;
      });
      csvRows.push(values.join(","));
    }

    const csvContent = csvRows.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <button
      onClick={handleDownload}
      className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white px-4 py-2 rounded-xl transition-colors text-sm font-medium"
    >
      <Download className="w-4 h-4" />
      Export CSV
    </button>
  );
}
