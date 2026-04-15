import React from 'react';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { Button } from '@mui/material';
import Iconify from '../iconify';

const RHFExportExcel = ({ data = [], fileName = 'ExportedData' }) => {
  const handleExport = async () => {
    if (!data || !data.length) {
      alert('No data available to export.');
      return;
    }

    // Create workbook and worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Sheet1');

    // Capitalized header
    const headerText = fileName.toUpperCase();

    // Add header row
    const headerRow = worksheet.addRow([headerText]);
    headerRow.font = { bold: true, color: { argb: 'FF000000' }, size: 14 };
    headerRow.alignment = { horizontal: 'center', vertical: 'middle' };
    headerRow.height = 25;
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF87CEEB' } // sky blue
    };

    // Merge header across all columns
    const totalColumns = Object.keys(data[0] || {}).length;
    if (totalColumns > 1) {
      worksheet.mergeCells(1, 1, 1, totalColumns);
    }

    // Add data rows
    data.forEach((item) => {
      worksheet.addRow(Object.values(item));
    });

    // Auto width for columns
    worksheet.columns.forEach((col) => {
      let maxLength = 10;
      col.eachCell({ includeEmpty: true }, (cell) => {
        const val = cell.value ? cell.value.toString() : '';
        if (val.length > maxLength) maxLength = val.length;
      });
      col.width = maxLength + 2;
    });

    // Generate Excel file and save
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/octet-stream' });
    saveAs(blob, `${fileName}.xlsx`);
  };

  return (
    <Button sx={{ fontWeight: 'normal', p: 0 }} onClick={handleExport}>
      <Iconify icon="uiw:file-excel" /> Export to Excel
    </Button>
  );
};

export default RHFExportExcel;
