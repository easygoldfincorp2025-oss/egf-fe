import React, { useMemo } from 'react';
import { Document, Font, Page, StyleSheet, Text, View } from '@react-pdf/renderer';
import { fDate } from 'src/utils/format-time.js';
import InvoiceHeader from '../../../../components/invoise/invoice-header.jsx';

Font.register({
  family: 'Roboto',
  fonts: [
    { src: '/fonts/Roboto-Regular.ttf' },
    { src: '/fonts/Roboto-Bold.ttf', fontWeight: 'bold' },
  ],
});

const useStyles = () =>
  useMemo(
    () =>
      StyleSheet.create({
        page: {
          fontFamily: 'Roboto',
          backgroundColor: '#ffff',
          fontSize: 8,
          position: 'relative',
        },
        subHeading: {
          fontWeight: 'bold',
          fontSize: 16,
          textAlign: 'center',
          marginTop: 10,
        },
        table: {
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          borderWidth: 1,
          borderColor: '#b1b0b0',
        },
        tableRow: {
          flexDirection: 'row',
          minHeight: 22,
          borderBottomWidth: 0.5,
          borderBottomColor: '#c7c6c6',
          pageBreakInside: 'avoid',
        },
        lastTableRow: {
          borderBottomWidth: 0,
        },
        tableHeader: {
          backgroundColor: '#5B9BD4',
          fontWeight: 'bold',
          color: '#000',
          textAlign: 'center',
        },
        tableCell: {
          padding: 5,
          borderRightWidth: 0.5,
          borderRightColor: '#b1b0b0',
          textAlign: 'center',
        },
        numericCell: {
          textAlign: 'right',
        },
        tableCellLast: {
          borderRightWidth: 0,
        },
        alternateRow: {
          backgroundColor: '#F2F2F2',
        },
        termsAndConditionsHeaders: {
          color: '#232C4B',
          borderBottom: '1px solid #232C4B',
          fontWeight: 'bold',
          textWrap: 'nowrap',
          fontSize: '12px',
          textAlign: 'center',
          paddingVertical: 5,
        },
        row: {
          flexDirection: 'row',
          marginVertical: 1.5,
        },
        subHeading2: {
          fontWeight: '600',
          fontSize: 9,
          flex: 0.6,
        },
        colon: {
          fontSize: 10,
          fontWeight: '600',
          marginHorizontal: 3,
        },
        subText: {
          fontSize: 8,
          flex: 2,
        },
      }),
    []
  );

export default function CashInPdf({ configs, cashData, filterData }) {
  const styles = useStyles();

  const headers = [
    { label: '#', flex: 0.2 },
    { label: 'Type', flex: 1 },
    { label: 'Detail', flex: 4 },
    { label: 'Category', flex: 1 },
    { label: 'Date', flex: 1 },
    { label: 'Amount', flex: 1 },
  ];

  const dataFilter = [
    { value: filterData.status, label: 'Status' },
    { value: filterData.category, label: 'Category' },
    { value: fDate(filterData.startDate), label: 'Start Date' },
    { value: fDate(filterData.endDate), label: 'End Date' },
    { value: fDate(new Date()), label: 'Date' },
  ];

  const rowsPerPageFirst = 16;
  const rowsPerPageOther = 22;

  const remainingRows = cashData.length - rowsPerPageFirst;
  const additionalPages = Math.ceil(Math.max(0, remainingRows) / rowsPerPageOther);

  const pages = [];
  const renderRow = (row, index, isLastRow) => {
    const isAlternateRow = index % 2 !== 0;
    return (
      <View
        key={index}
        style={[
          styles.tableRow,
          isAlternateRow ? styles.alternateRow : {},
          isLastRow ? styles.lastTableRow : {},
        ]}
        wrap={false}
      >
        <Text style={[styles.tableCell, { flex: 0.2 }]}>{index + 1}</Text>
        <Text style={[styles.tableCell, { flex: 1 }]}>{row.status || '-'}</Text>
        <Text style={[styles.tableCell, { flex: 4 }]}>
          {row.ref ? `${row.detail} (${row.ref})` : row.detail || '-'}
        </Text>
        <Text style={[styles.tableCell, { flex: 1 }]}>{row.category || '-'}</Text>
        <Text style={[styles.tableCell, { flex: 1 }]}>{fDate(row.date) || '-'}</Text>
        <Text
          style={[
            styles.tableCell,
            { flex: 1, color: row.category === 'Payment Out' ? 'red' : 'green' },
          ]}
        >
          {row.amount || '-'}
        </Text>
      </View>
    );
  };

  const renderTableHeader = () => (
    <View style={[styles.tableRow, styles.tableHeader]}>
      {headers.map((header, i) => (
        <Text
          key={i}
          style={[
            styles.tableCell,
            { flex: header.flex },
            i === headers.length - 1 ? styles.tableCellLast : {},
          ]}
        >
          {header.label}
        </Text>
      ))}
    </View>
  );

  const firstPageRows = cashData
    .slice(0, rowsPerPageFirst)
    .map((row, index) =>
      renderRow(row, index, index === rowsPerPageFirst - 1 && cashData.length === rowsPerPageFirst)
    );
  const cashIn = cashData
    .filter((e) => e.category === 'Payment In')
    .reduce((prev, next) => prev + (Number(next?.amount) || 0), 0);

  const cashOut = cashData
    .filter((e) => e.category === 'Payment Out')
    .reduce((prev, next) => prev + (Number(next?.amount) || 0), 0);

  pages.push(
    <Page key={0} size="A4" style={styles.page} orientation="landscape">
      <InvoiceHeader configs={configs} landscape={true} />
      <View style={{ position: 'absolute', top: 20, right: 5, width: 200 }}>
        {dataFilter.map((item, idx) => (
          <View key={idx} style={styles.row}>
            <Text style={styles.subHeading2}>{item.label || '-'}</Text>
            <Text style={styles.colon}>:</Text>
            <Text style={styles.subText}>{item.value || '-'}</Text>
          </View>
        ))}

        <Text style={{ fontSize: 12, fontWeight: 'bold', marginBottom: 10 }}>
          Cash In  :{' '}
          <Text style={{ color: 'green' }}>
            {Object.values(filterData).some(Boolean)
              ? Math.abs(cashIn).toFixed(2)
              : cashIn.toFixed(2)}
          </Text>
        </Text>
        <Text style={{ fontSize: 12, fontWeight: 'bold' }}>
          Cash Out :{' '}
          <Text style={{ color: 'red' }}>
            {Object.values(filterData).some(Boolean)
              ? Math.abs(cashOut).toFixed(2)
              : cashOut.toFixed(2)}
          </Text>
        </Text>
      </View>
      <View
        style={{
          textAlign: 'center',
          fontSize: 18,
          marginHorizontal: 15,
          marginTop: 10,
        }}
      >
        <Text style={styles.termsAndConditionsHeaders}>CASH IN HAND</Text>
      </View>

      <View style={{ flexGrow: 1, padding: '12px' }}>
        <View style={styles.table}>
          {renderTableHeader()}
          {firstPageRows}
        </View>
      </View>
    </Page>
  );

  if (cashData.length > rowsPerPageFirst) {
    for (let pageIndex = 0; pageIndex < additionalPages; pageIndex++) {
      const startIndex = rowsPerPageFirst + pageIndex * rowsPerPageOther;
      const endIndex = Math.min(startIndex + rowsPerPageOther, cashData.length);
      const isLastPage = endIndex === cashData.length;

      const pageRows = cashData.slice(startIndex, endIndex).map((row, index) => {
        const actualIndex = startIndex + index;
        return renderRow(row, actualIndex, actualIndex === cashData.length - 1);
      });

      pages.push(
        <Page key={pageIndex + 1} size="A4" style={styles.page} orientation="landscape">
          <View style={{ flexGrow: 1, padding: '12px' }}>
            <View style={styles.table}>
              {renderTableHeader()}
              {pageRows}
            </View>
          </View>
        </Page>
      );
    }
  }

  return <Document>{pages}</Document>;
}
