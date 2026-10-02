"use client";

import { Download } from "lucide-react";
import * as XLSX from "xlsx";

type ExportExcelButtonProps = {
  data: any[];
  filename: string;
};

export default function ExportExcelButton({ data, filename }: ExportExcelButtonProps) {
  const handleDownload = () => {
    if (!data || data.length === 0) {
      alert("No data available to export.");
      return;
    }

    // Clean up data for Excel (e.g. converting nested objects/arrays to strings if any)
    const cleanedData = data.map(row => {
      const newRow: any = {};
      for (const key in row) {
        if (key === "_id") continue; // skip mongo ids if they leak through
        let val = row[key];
        if (typeof val === "object" && val !== null) {
          val = JSON.stringify(val);
        }
        newRow[key] = val;
      }
      return newRow;
    });

    // Create workbook and worksheet
    const worksheet = XLSX.utils.json_to_sheet(cleanedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data");

    // Write file
    XLSX.writeFile(workbook, `${filename}_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <button
      onClick={handleDownload}
      className="flex items-center gap-2 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 px-4 py-2 rounded-xl transition-all active:scale-95 duration-200 text-sm font-medium"
    >
      <Download className="w-4 h-4" />
      Export Excel
    </button>
  );
}
