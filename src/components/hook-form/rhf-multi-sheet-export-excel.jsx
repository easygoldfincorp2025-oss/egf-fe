import React from 'react';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { Button } from '@mui/material';
import Iconify from '../iconify';

const RHFMultiSheetExportExcel = ({ sheets, fileName = 'ExportedData' }) => {
  const handleExport = () => {
    if (!sheets || !sheets.length) {
      alert('No data available to export.');
      return;
    }

    const workbook = XLSX.utils.book_new();

    sheets.forEach((sheet) => {
      if (sheet.data && sheet.data.length > 0) {
        const worksheet = XLSX.utils.json_to_sheet(sheet.data);
        XLSX.utils.book_append_sheet(workbook, worksheet, sheet.sheetName);
      }
    });

    if (workbook.SheetNames.length === 0) {
      alert('No valid data in any sheet to export.');
      return;
    }

    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });

    saveAs(blob, `${fileName}.xlsx`);
  };

  return (
    <Button sx={{ fontWeight: 'normal', p: 0 }} onClick={handleExport}>
      <Iconify icon="uiw:file-excel" />
      Export to Excel
    </Button>
  );
};

export default RHFMultiSheetExportExcel; 