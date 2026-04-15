import React, { useMemo } from 'react';
import { Document, Font, Page, StyleSheet, Text, View } from '@react-pdf/renderer';
import { fDate } from 'src/utils/format-time.js';
import InvoiceHeader from '../../../components/invoise/invoice-header.jsx';

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
          fontSize: 10,
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
          marginBottom: 10,
        },
        loanSpacing: {
          height: 10,
          backgroundColor: '#ffffff',
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
          marginVertical: 2,
        },
        subHeading2: {
          fontWeight: '600',
          fontSize: 8,
          flex: 1,
        },
        colon: {
          fontSize: 8,
          fontWeight: '600',
          marginHorizontal: 3,
        },
        subText: {
          fontSize: 8,
          flex: 2,
        },
        loanHeader: {
          backgroundColor: '#E3E7EA',
          fontWeight: 'bold',
          fontSize: 8,
        },
        totalRow: {
          backgroundColor: '#E3E7EA',
          fontWeight: 'bold',
        },
        statementRow: {
          backgroundColor: '#FFE4DE',
        },
      }),
    []
  );

const formatCurrency = (value, precision = 2) => {
  return (value || 0).toFixed(2);
};

export default function CustomerStatementPdf({ selectedBranch, configs, data, filterData }) {
  const styles = useStyles();
  const headers = [
    { label: '#', flex: 0.3 },
    { label: 'Loan No', flex: 2 },
    { label: 'Detail', flex: 4 },
    { label: 'Credit', flex: 2 },
    { label: 'Debit', flex: 2 },
  ];

  const dataFilter = [
    { value: fDate(filterData.startDate), label: 'Start Date' },
    { value: fDate(filterData.endDate), label: 'End Date' },
    { value: fDate(new Date()), label: 'Date' },
  ];

  const rowsPerPage = 15;
  const pages = [];
  let currentPageRows = [];
  let currentPageCount = 0;

  data.forEach((row, rowIndex) => {
    if (rowIndex > 0) {
      currentPageRows.push(<View key={`spacing-${rowIndex}`} style={styles.loanSpacing} />);
      currentPageCount++;
    }

    currentPageRows.push(
      <View key={`loan-${rowIndex}`} style={[styles.tableRow, styles.loanHeader]}>
        <Text style={[styles.tableCell, { flex: 0.3 }]}>{rowIndex + 1}</Text>
        <Text style={[styles.tableCell, { flex: 2, fontWeight: 'bold' }]}>{row.loanNo}</Text>
        <Text style={[styles.tableCell, { flex: 4 }]}></Text>
        <Text style={[styles.tableCell, { flex: 2 }]}></Text>
        <Text style={[styles.tableCell, { flex: 2 }]}></Text>
      </View>
    );
    currentPageCount++;

    if (row.statements?.length > 0) {
      row.statements.forEach((statement, statementIndex) => {
        currentPageRows.push(
          <View
            key={`statement-${rowIndex}-${statementIndex}`}
            style={[styles.tableRow, statement.detail === 'Loan Close' ? styles.statementRow : {}]}
          >
            <Text style={[styles.tableCell, { flex: 0.3 }]}></Text>
            <Text style={[styles.tableCell, { flex: 2 }]}>{fDate(statement.date)}</Text>
            <Text style={[styles.tableCell, { flex: 4 }]}>{statement.detail}</Text>
            <Text style={[styles.tableCell, { flex: 2 }]}>{Number(statement.credit || 0).toFixed(2)}</Text>
            <Text style={[styles.tableCell, { flex: 2 }]}>{Number(statement.debit || 0).toFixed(2)}</Text>
          </View>
        );
        currentPageCount++;
      });

      const totals = row.statements.reduce(
        (acc, item) => {
          acc.credit += Number(item.credit) || 0;
          acc.debit += Number(item.debit) || 0;
          return acc;
        },
        { credit: 0, debit: 0 }
      );

      currentPageRows.push(
        <View key={`total-${rowIndex}`} style={[styles.tableRow, styles.totalRow]}>
          <Text style={[styles.tableCell, { flex: 0.3 }]}></Text>
          <Text style={[styles.tableCell, { flex: 2 }]}>Total</Text>
          <Text style={[styles.tableCell, { flex: 4, fontWeight: 'bold' }]}></Text>
          <Text style={[styles.tableCell, { flex: 2, fontWeight: 'bold' }]}>
            {formatCurrency(totals.credit)}
          </Text>
          <Text style={[styles.tableCell, { flex: 2, fontWeight: 'bold' }]}>
            {formatCurrency(totals.debit)}
          </Text>
        </View>
      );
      currentPageCount++;
    }

    if (currentPageCount >= rowsPerPage || rowIndex === data.length - 1) {
      pages.push(
        <Page key={pages.length} size="A4" style={styles.page} orientation="portrait">
          {pages.length === 0 && (
            <>
              <InvoiceHeader branch={filterData?.branch} configs={configs} />
              <View style={{ position: 'absolute', top: 20, right: 0, width: 120 }}>
                {dataFilter.map((item, index) => (
                  <View key={index} style={styles.row}>
                    <Text style={styles.subHeading2}>{item.label}</Text>
                    <Text style={styles.colon}>:</Text>
                    <Text style={styles.subText}>{item.value}</Text>
                  </View>
                ))}
              </View>
              <View style={{ textAlign: 'center', fontSize: 18, marginHorizontal: 15 }}>
                <Text style={styles.termsAndConditionsHeaders}>CUSTOMER STATEMENT</Text>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginTop: 10,
                  }}
                >
                  <Text style={{ fontSize: 11, fontWeight: 'bold' }}>Name : {filterData.name}</Text>
                  <Text style={{ fontSize: 11, fontWeight: 'bold' }}>
                    Customer Code : {filterData.code}
                  </Text>
                </View>
              </View>
            </>
          )}
          <View style={{ padding: '12px' }}>
            <View style={styles.table}>
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
              {currentPageRows}
            </View>
          </View>
        </Page>
      );
      currentPageRows = [];
      currentPageCount = 0;
    }
  });

  return <Document>{pages}</Document>;
}
