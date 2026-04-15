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
          backgroundColor: '#5b9bd4',
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
          fontSize: 12,
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
          flex: 0.9,
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

export default function PaymentInOutPdf({ configs, paymentData, filterData, party }) {
  const styles = useStyles();

  /* ===================== BANK STATEMENT HEADERS ===================== */
  const headers = [
    { label: '#', flex: 0.3 },
    { label: 'Date', flex: 0.8 },
    { label: 'Ref / Party', flex: 1.5 },
    { label: 'Particulars', flex: 3 },
    {label: 'Mode', flex: 0.8 },
    { label: 'Debit', flex: 1 },
    { label: 'Credit', flex: 1 },
    { label: 'Balance', flex: 1 },
  ];

  const dataFilter = [
    { value: filterData.party, label: 'Party' },
    { value: filterData.category, label: 'Category' },
    { value: fDate(filterData.startDate), label: 'Start Date' },
    { value: fDate(filterData.endDate), label: 'End Date' },
    { value: filterData.transactions, label: 'Transactions' },
    { value: fDate(new Date()), label: 'Date' },
  ];

  const rowsPerPageFirst = 14;
  const rowsPerPageOther = 22;

  /* ===================== AMOUNT & BALANCE ===================== */
  let runningBalance = 0;

  const getAmount = (row) => {
    const cash = Number(row?.paymentDetail?.cashAmount || 0);
    const bank = Number(row?.paymentDetail?.bankAmount || 0);
    return cash + bank;
  };

  const renderRow = (row, index, isLastRow) => {
    const amount = getAmount(row);
    const isDebit = row.status === 'Payment Out';
    const isCredit = row.status === 'Payment In';

    if (isDebit) runningBalance -= amount;
    if (isCredit) runningBalance += amount;

    const isAlternateRow = index % 2 !== 0;

    return (
      <View
        key={index}
        style={[
          styles.tableRow,
          isAlternateRow && styles.alternateRow,
          isLastRow && styles.lastTableRow,
        ]}
        wrap={false}
      >
        <Text style={[styles.tableCell, { flex: 0.3 }]}>{index + 1}</Text>

        <Text style={[styles.tableCell, { flex: 0.8 }]}>{fDate(row.date)}</Text>
        <Text style={[styles.tableCell, { flex: 1.5 }]}>{row?.party?.name || '-'}</Text>
        <Text style={[styles.tableCell, { flex: 3, textAlign: 'left' }]}>
          {row.description || '-'}
        </Text>

        <Text style={[styles.tableCell, { flex: 0.8 }]}>{row?.paymentDetail?.paymentMode}</Text>

        <Text style={[styles.tableCell, styles.numericCell, { flex: 1 }]}>
          {isDebit ? amount.toFixed(2) : '-'}
        </Text>

        <Text style={[styles.tableCell, styles.numericCell, { flex: 1 }]}>
          {isCredit ? amount.toFixed(2) : '-'}
        </Text>

        <Text style={[styles.tableCell, styles.numericCell, { flex: 1 }]}>
          {runningBalance.toFixed(2)}
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

  /* ===================== FIRST PAGE ===================== */
  const firstPageRows = paymentData
    .slice(0, rowsPerPageFirst)
    .map((row, index) =>
      renderRow(
        row,
        index,
        index === rowsPerPageFirst - 1 && paymentData.length === rowsPerPageFirst
      )
    );

  /* ===================== TOTALS (UNCHANGED) ===================== */
  const receivableAmt = party?.reduce(
    (prev, next) => prev + (Number(next.amount <= 0 && next?.amount) || 0),
    0
  );

  const payableAmt = party?.reduce(
    (prev, next) => prev + (Number(next.amount >= 0 && next?.amount) || 0),
    0
  );

  const receivable = paymentData.reduce((prev, next) => {
    if (next.status === 'Payment In') {
      return prev + getAmount(next);
    }
    return prev;
  }, 0);

  const payable = paymentData.reduce((prev, next) => {
    if (next.status === 'Payment Out') {
      return prev + getAmount(next);
    }
    return prev;
  }, 0);

  const pages = [];

  pages.push(
    <Page key={0} size="A4" style={styles.page} orientation="landscape">
      <InvoiceHeader configs={configs} landscape />
      <View style={{ position: 'absolute', top: 20, right: 5, width: 200 }}>
        {dataFilter.map((item, idx) => (
          <View key={idx} style={styles.row}>
            <Text style={styles.subHeading2}>{item.label}</Text>
            <Text style={styles.colon}>:</Text>
            <Text style={styles.subText}>{item.value || '-'}</Text>
          </View>
        ))}
      </View>

      <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 10, marginTop: 10 }}>
        <Text style={{ fontSize: 12, fontWeight: 'bold' }}>
          Receivable : <Text style={{ color: 'green' }}>{receivable.toFixed(2)}</Text>
        </Text>
        <Text style={{ fontSize: 12, fontWeight: 'bold' }}>
          Payable : <Text style={{ color: 'red' }}>{payable.toFixed(2)}</Text>
        </Text>
      </View>

      <View style={{ marginTop: 10 }}>
        <Text style={styles.termsAndConditionsHeaders}>PARTIES STATEMENT</Text>
      </View>

      <View style={{ flexGrow: 1, padding: '12px' }}>
        <View style={styles.table}>
          {renderTableHeader()}
          {firstPageRows}
        </View>
      </View>
    </Page>
  );

  /* ===================== OTHER PAGES ===================== */
  if (paymentData.length > rowsPerPageFirst) {
    const remainingRows = paymentData.length - rowsPerPageFirst;
    const additionalPages = Math.ceil(remainingRows / rowsPerPageOther);

    for (let pageIndex = 0; pageIndex < additionalPages; pageIndex++) {
      const startIndex = rowsPerPageFirst + pageIndex * rowsPerPageOther;
      const endIndex = Math.min(startIndex + rowsPerPageOther, paymentData.length);

      const pageRows = paymentData.slice(startIndex, endIndex).map((row, index) => {
        const actualIndex = startIndex + index;
        return renderRow(row, actualIndex, actualIndex === paymentData.length - 1);
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
