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
          textAlign: 'center',
        },
        tableCell: {
          padding: 5,
          borderRightWidth: 0.5,
          borderRightColor: '#b1b0b0',
          textAlign: 'center',
          fontSize: 6,
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
          flex: 1.2,
        },
        colon: {
          fontSize: 10,
          fontWeight: '600',
          marginHorizontal: 3,
        },
        subText: {
          fontSize: 10,
          flex: 2,
        },
        totalRow: {
          backgroundColor: '#E8F0FE',
          minHeight: 25,
          flexDirection: 'row',

        },
        totalCell: {
          padding: 5,
          borderRightWidth: 0.5,
          borderRightColor: '#b1b0b0',
          textAlign: 'center',
          fontSize: 6,
          fontWeight: 'bold',
          color: '#1a237e',
        },
      }),
    []
  );

export default function OtherLoanCloseSummaryPdf({
  selectedBranch,
  configs,
  data,
  filterData,
  total,
}) {
  const styles = useStyles();

  const {
    percentage,
    rate,
    otherLoanAmount,
    totalInterestAmt,
    pendingInterest,
    day,
    closeAmt,
    closingCharge,
    totalCharge,
    otherCharge
  } = total;

  const headers = [
    { label: '#', flex: 0.2 },
    { label: 'Code', flex: 0.5 },
    { label: 'Loan No', flex: 2.5 },
    { label: 'Customer Name', flex: 3 },
    { label: 'Other name', flex: 0.6 },
    { label: 'Other no.', flex: 1.1 },
    { label: 'int rate (%)', flex: 0.35 },
    { label: 'Fund', flex: 1 },
    { label: 'Date', flex: 1 },
    { label: 'Other loan amt', flex: 1 },
    { label: 'Other Total int.', flex: 1 },
    { label: 'Day', flex: 0.3 },
    { label: 'closeAmt', flex: 1 },
    { label: 'Pending amt', flex: 1 },
    { label: 'Close date', flex: 1 },
    { label: 'other Charge', flex: 0.8 },
    { label: 'Int. Charge', flex: 0.8 },
    { label: 'Closing Charge', flex: 0.8 },
    { label: 'Total close amt', flex: 1 },
  ];
  const dataFilter = [
    { value: filterData.otherName, label: 'Other Name' },
    { value: fDate(filterData.startDate), label: 'Start Date' },
    { value: fDate(filterData.endDate), label: 'End Date' },
    { value: fDate(filterData.startCloseDate), label: 'Start Close Date' },
    { value: fDate(filterData.endCloseDate), label: 'End Close Date'},
    { value: filterData.branch, label: 'Branch'},
    { value: fDate(new Date()), label: 'Date' },
  ];

  const firstPageRows = 12;
  const otherPagesRows = 16;
  const pages = [];
  let currentPageRows = [];
  let currentPageIndex = 0;
  let rowsOnCurrentPage = 0;
  let maxRowsForCurrentPage = firstPageRows;

  data?.forEach((row, index) => {
    const isAlternateRow = index % 2 !== 0;
    const isLastRow = index === data.length - 1;

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
        <Text style={[styles.tableCell, { flex: 0.2 }]}>{index + 1}</Text>
        <Text style={[styles.tableCell, { flex: 0.5 }]}>{row.code || 0}</Text>
        <Text style={[styles.tableCell, { flex: 2.5 }]}>{row.loan.loanNo}</Text>
        <Text style={[styles.tableCell, { flex: 3, fontSize: 7, padding: 5 }]}>
          {`${row.loan.customer.firstName} ${row.loan.customer.middleName}\n ${row.loan.customer.lastName}`}
        </Text>
        <Text style={[styles.tableCell, { flex: 0.6 }]}>{row.otherName}</Text>
        <Text style={[styles.tableCell, { flex: 1.1 }]}>{row.otherNumber}</Text>
        <Text style={[styles.tableCell, { flex: 0.35 }]}>{row.percentage}</Text>
        <Text style={[styles.tableCell, { flex: 1 }]}>{row.rate}</Text>
        <Text style={[styles.tableCell, { flex: 1 }]}>{fDate(row.date)}</Text>
        <Text style={[styles.tableCell, { flex: 1 }]}>{row.otherLoanAmount}</Text>
        <Text style={[styles.tableCell, { flex: 1 }]}>{row.totalInterestAmt}</Text>
        <Text style={[styles.tableCell, { flex: 0.3 }]}>
          {row.day.toFixed(0) > 0 ? row.day.toFixed(0) : 0}
        </Text>
        <Text style={[styles.tableCell, { flex: 1 }]}>{(row.closingAmount || 0).toFixed(2)}</Text>
        <Text style={[styles.tableCell, { flex: 1 }]}>
          {(row.otherLoanAmount - row.closingAmount || 0).toFixed(2)}
        </Text>
        <Text style={[styles.tableCell, { flex: 1 }]}>{fDate(row.closeDate)}</Text>
        <Text style={[styles.tableCell, { flex: 0.8 }]}>{(row.otherCharge || 0).toFixed(2)}</Text>
        <Text style={[styles.tableCell, { flex: 0.8 }]}>{(row.totalCharge || 0).toFixed(2)}</Text>
        <Text style={[styles.tableCell, { flex: 0.8 }]}>{(row.closingCharge || 0).toFixed(2)}</Text>
        <Text style={[styles.tableCell, { flex: 1 }]}>
          {(row.totalInterestAmt + row.closingAmount + row.closingCharge || 0).toFixed(2)}
        </Text>
      </View>
    );

    rowsOnCurrentPage++;

    const isPageFull = rowsOnCurrentPage === maxRowsForCurrentPage;
    if (isPageFull || isLastRow) {
      const isFirstPage = currentPageIndex === 0;
      pages.push(
        <Page key={currentPageIndex} size="A4" style={styles.page} orientation="landscape">
          {isFirstPage && (
            <>
              <InvoiceHeader selectedBranch={selectedBranch} configs={configs} landscape={true} />
              <View style={{ position: 'absolute', top: 20, right: 5, width: 200 }}>
                {dataFilter.map((item, index) => (
                  <View key={index} style={styles.row}>
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
                <Text style={styles.termsAndConditionsHeaders}>OTHER LOAN CLOSE REPORTS</Text>
              </View>{' '}
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
              {isLastRow && (
                <View style={[styles.totalRow, { textAlign: 'center' }]}>
                  <Text style={[styles.totalCell, { flex: 0.2 }]}></Text>
                  <Text style={[styles.totalCell, { flex: 0.5 }]}></Text>
                  <Text style={[styles.totalCell, { flex: 2.5 }]}>TOTAL</Text>
                  <Text style={[styles.totalCell, { flex: 3 }]}></Text>
                  <Text style={[styles.totalCell, { flex: 0.6 }]}></Text>
                  <Text style={[styles.totalCell, { flex: 1.1 }]}></Text>
                  <Text style={[styles.totalCell, { flex: 0.35 }]}>
                    {(percentage / data.length).toFixed(2)}
                  </Text>
                  <Text style={[styles.totalCell, { flex: 1 }]}>{rate.toFixed(0)}</Text>
                  <Text style={[styles.totalCell, { flex: 1 }]}></Text>
                  <Text style={[styles.totalCell, { flex: 1 }]}>{otherLoanAmount.toFixed(0)}</Text>
                  <Text style={[styles.totalCell, { flex: 1 }]}>{totalInterestAmt.toFixed(0)}</Text>
                  <Text style={[styles.totalCell, { flex: 0.3 }]}>
                    {(day / data.length).toFixed(0)}
                  </Text>
                  <Text style={[styles.totalCell, { flex: 1 }]}>{closeAmt.toFixed(0)}</Text>
                  <Text style={[styles.totalCell, { flex: 1 }]}>{pendingInterest.toFixed(0)}</Text>
                  <Text style={[styles.totalCell, { flex: 1 }]}></Text>
                  <Text style={[styles.totalCell, { flex: 0.8 }]}>{otherCharge.toFixed(0)}</Text>
                  <Text style={[styles.totalCell, { flex: 0.8 }]}>{totalCharge.toFixed(0)}</Text>
                  <Text style={[styles.totalCell, { flex: 0.8 }]}>{closingCharge.toFixed(0)}</Text>
                  <Text style={[styles.totalCell, { flex: 1 }]}>
                    {(totalInterestAmt + closeAmt + closingCharge).toFixed(0)}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </Page>
      );
      currentPageRows = [];
      currentPageIndex++;
      rowsOnCurrentPage = 0;
      maxRowsForCurrentPage = otherPagesRows;
    }
  });

  return <Document>{pages}</Document>;
}
