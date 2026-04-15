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
          fontSize: 7,
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
          marginVertical: 2,
        },
        subHeading2: {
          fontWeight: '600',
          fontSize: 10,
          flex: 1.4,
        },
        colon: {
          fontSize: 10,
          fontWeight: '600',
          marginHorizontal: 3,
        },
        subText: {
          fontSize: 10,
          flex: 2.5,
        },
        footerRow: {
          backgroundColor: '#F4F6F8',
          borderTopWidth: 1,
          borderTopColor: '#b1b0b0',
          flexDirection: 'row',
          minHeight: 22,
        },
        footerCell: {
          padding: 5,
          borderRightWidth: 0.5,
          borderRightColor: '#b1b0b0',
          textAlign: 'center',
          fontWeight: 'bold',
          color: '#637381',
        },
      }),
    []
  );

export default function OtherLoanInterestPdf({
  selectedBranch,
  configs,
  loans,
  filterData,
  total,
}) {
  const styles = useStyles();
  const {
    percentage,
    amount,
    totalInterestAmt,
    pendingInterest,
    day,
    penDay,
    totalCharge,
    otherCharge,
    closingCharge,
  } = total;

  const headers = [
    { label: '#', flex: 0.3 },
    { label: 'Code', flex: 0.5 },
    { label: 'Loan No', flex: 2.5 },
    { label: 'Customer Name', flex: 3 },
    { label: 'Other name', flex: 1 },
    { label: 'Other no.', flex: 1.1 },
    { label: 'int rate', flex: 1 },
    { label: 'Open date', flex: 1 },
    { label: 'Open loan amt', flex: 1 },
    { label: 'charge', flex: 1 },
    { label: 'Day', flex: 0.3 },
    { label: 'Int.', flex: 1 },
    { label: 'Pay Date', flex: 1 },
    { label: 'Pen. day', flex: 0.3 },
    { label: 'Pending int.', flex: 1 },
    { label: 'Renew Date', flex: 1 },
    { label: 'Status', flex: 1 },
  ];

  const dataFilter = [
    { value: fDate(filterData.startDate), label: 'Start Date' },
    { value: fDate(filterData.endDate), label: 'End Date' },
    { value: fDate(filterData.startPayDate), label: 'Start Pay Date' },
    { value: fDate(filterData.endPayDate), label: 'End Pay Date' },
    { value: filterData.branch, label: 'Branch' },
    { value: fDate(new Date()), label: 'Date' },
  ];
  const rowsPerPage = 12;
  const pages = [];
  let currentPageRows = [];

  loans.forEach((row, index) => {
    const isAlternateRow = index % 2 !== 0;
    const isLastRow = index === loans.length - 1;

    currentPageRows.push(
      <View
        key={index}
        style={[
          styles.tableRow,
          isAlternateRow ? styles.alternateRow : {},
          isLastRow ? styles.lastTableRow : {},
        ]}
        wrap={false}
      >
        <Text style={[styles.tableCell, { flex: 0.3 }]}>{index + 1}</Text>
        <Text style={[styles.tableCell, { flex: 0.5 }]}>{row.code || 0}</Text>
        <Text style={[styles.tableCell, { flex: 2.5 }]}>{row.loan.loanNo}</Text>
        <Text style={[styles.tableCell, { flex: 3, fontSize: 7, padding: 5 }]}>
          {`${row.loan.customer.firstName} ${row.loan.customer.middleName}\n ${row.loan.customer.lastName}`}
        </Text>
        <Text style={[styles.tableCell, { flex: 1 }]}>{row.otherName}</Text>
        <Text style={[styles.tableCell, { flex: 1.1 }]}>{row.otherNumber}</Text>
        <Text style={[styles.tableCell, { flex: 1 }]}>{row.percentage}</Text>
        <Text style={[styles.tableCell, { flex: 1 }]}>{fDate(row.date)}</Text>
        <Text style={[styles.tableCell, { flex: 1 }]}>{row.amount}</Text>
        <Text style={[styles.tableCell, { flex: 1 }]}>
          {(row.otherCharge + row.closingCharge + row.totalCharge || 0).toFixed(2)}
        </Text>
        <Text style={[styles.tableCell, { flex: 0.3 }]}>{row.day > 0 ? row.day : 0}</Text>
        <Text style={[styles.tableCell, { flex: 1 }]}>
          {' '}
          {(row.totalInterestAmt - row.totalCharge).toFixed(2)}
        </Text>
        <Text style={[styles.tableCell, { flex: 1 }]}>{fDate(row.date)}</Text>
        <Text style={[styles.tableCell, { flex: 0.3 }]}>
          {row.pendingDay > 0 ? row.pendingDay : 0}
        </Text>
        <Text style={[styles.tableCell, { flex: 1 }]}>{(row.pendingInterest || 0).toFixed(2)}</Text>
        <Text style={[styles.tableCell, { flex: 1 }]}>{fDate(row.renewalDate)}</Text>
        <Text style={[styles.tableCell, { flex: 1 }]}>{row.status}</Text>
      </View>
    );

    if ((index + 1) % rowsPerPage === 0 || index === loans.length - 1) {
      const isFirstPage = pages.length === 0;
      pages.push(
        <Page key={pages.length} size="A4" style={styles.page} orientation="landscape">
          {isFirstPage && (
            <>
              <InvoiceHeader selectedBranch={selectedBranch} configs={configs} landscape={true} />
              <View style={{ position: 'absolute', top: 20, right: 5, width: 200 }}>
                {dataFilter.map((item, index) => (
                  <View style={styles.row} key={index}>
                    <Text style={styles.subHeading2}>{item.label || '-'}</Text>
                    <Text style={styles.colon}>:</Text>
                    <Text style={styles.subText}>{item.value || '-'}</Text>
                  </View>
                ))}
              </View>
              <View
                style={{
                  textAlign: 'center',
                  fontSize: 18,
                  marginHorizontal: 15,
                  marginTop: 10,
                }}
              >
                <Text style={styles.termsAndConditionsHeaders}>OTHER LOAN INTEREST REPORTS</Text>
              </View>
            </>
          )}
          <View style={{ flexGrow: 1, padding: '12px' }}>
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
              <View style={styles.footerRow}>
                <Text style={[styles.footerCell, { flex: 0.3 }]}></Text>
                <Text style={[styles.footerCell, { flex: 0.5 }]}></Text>
                <Text style={[styles.footerCell, { flex: 2.5 }]}>TOTAL</Text>
                <Text style={[styles.footerCell, { flex: 3 }]}></Text>
                <Text style={[styles.footerCell, { flex: 1 }]}></Text>
                <Text style={[styles.footerCell, { flex: 1.1 }]}></Text>
                <Text style={[styles.footerCell, { flex: 1 }]}>
                  {loans.length > 0 ? (percentage / loans.length).toFixed(2) : '0.00'}
                </Text>
                <Text style={[styles.footerCell, { flex: 1 }]}></Text>
                <Text style={[styles.footerCell, { flex: 1 }]}>{amount.toFixed(0)}</Text>
                <Text style={[styles.footerCell, { flex: 1 }]}>
                  {(totalCharge + closingCharge + otherCharge).toFixed(0)}
                </Text>
                <Text style={[styles.footerCell, { flex: 0.3 }]}>
                  {loans.length > 0 ? (day / loans.length).toFixed(0) : '0'}
                </Text>
                <Text style={[styles.footerCell, { flex: 1 }]}>
                  {(totalInterestAmt - totalCharge).toFixed(0)}
                </Text>
                <Text style={[styles.footerCell, { flex: 1 }]}></Text>
                <Text style={[styles.footerCell, { flex: 0.3 }]}>
                  {loans.length > 0 ? (penDay / loans.length).toFixed(0) : '0'}
                </Text>
                <Text style={[styles.footerCell, { flex: 1 }]}>{pendingInterest.toFixed(0)}</Text>
                <Text style={[styles.footerCell, { flex: 1 }]}></Text>
                <Text style={[styles.footerCell, { flex: 1 }]}></Text>
              </View>
            </View>
          </View>
        </Page>
      );
      currentPageRows = [];
    }
  });

  return <Document>{pages}</Document>;
}
