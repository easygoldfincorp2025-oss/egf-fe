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
          minHeight: 25,
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
          marginBottom: 10,
        },
        row: {
          flexDirection: 'row',
          marginVertical: 2,
        },
        subHeading2: {
          fontWeight: '600',
          fontSize: 10,
          flex: 0.7,
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
          fontWeight: 'bold',
          color: '#1a237e',
        },
      }),
    []
  );

export default function OtherInterestEntryReportsPdf({
  selectedBranch,
  configs,
  data,
  filterData,
  total,
}) {
  const { bankAmt, cashAmt, interestAmount, charge, day, payAmt, otherAmt } = total || {};
  const styles = useStyles();

  const headers = [
    { label: '#', flex: 0.2 },
    { label: 'Code', flex: 0.5 },
    { label: 'Loan No', flex: 3 },
    { label: 'Other No', flex: 1 },
    { label: 'From Date', flex: 1.2 },
    { label: 'To Date', flex: 1.2 },
    { label: 'Days', flex: 0.5 },
    { label: 'Other Amt', flex: 1.2 },
    { label: 'Int. Amt', flex: 1.2 },
    { label: 'Charge', flex: 1.2 },
    { label: 'Amt Paid', flex: 1.2 },
    { label: 'Payment Mode', flex: 1.2 },
    { label: 'Cash Amt', flex: 1.2 },
    { label: 'Bank Amt', flex: 1.2 },
    { label: 'Bank', flex: 1.5 },
    { label: 'Entry Date', flex: 1.2 },
  ];
  const dataFilter = [
    { value: filterData.branch.name || '-', label: 'Start Date' },
    { value: fDate(filterData?.startDate) || '-', label: 'Start Date' },
    { value: fDate(filterData?.endDate) || '-', label: 'End Date' },
    { value: fDate(new Date()) || '-', label: 'Date' },
  ];

  const firstPageRows = 12;
  const otherPagesRows = 16;

  const pages = [];
  let currentPageRows = [];
  let currentPageIndex = 0;
  let rowsOnCurrentPage = 0;
  let maxRowsForCurrentPage = firstPageRows;

  const reportsData = data || [];
  reportsData.forEach((row, index) => {
    const isAlternateRow = index % 2 !== 0;
    const isLastRow = index === reportsData.length - 1;

    currentPageRows.push(
      <View key={index} style={[styles.tableRow, isAlternateRow && styles.alternateRow]}>
        <Text style={[styles.tableCell, { flex: 0.2 }]}>{index + 1}</Text>
        <Text style={[styles.tableCell, { flex: 0.5 }]}>{row.code || 0}</Text>
        <Text style={[styles.tableCell, { flex: 3 }]}>{row.otherLoan.loan.loanNo}</Text>
        <Text style={[styles.tableCell, { flex: 1 }]}>{row.otherLoan.otherNumber}</Text>
        <Text style={[styles.tableCell, { flex: 1.2 }]}>{fDate(row.from) || '-'}</Text>
        <Text style={[styles.tableCell, { flex: 1.2 }]}>{fDate(row.to) || '-'}</Text>
        <Text style={[styles.tableCell, { flex: 0.5 }]}>{row.days || 0}</Text>
        <Text style={[styles.tableCell, { flex: 1.2 }]}>{row?.otherLoan.otherLoanAmount || 0}</Text>{' '}
        <Text style={[styles.tableCell, { flex: 1.2 }]}>
          {' '}
          {(Number(row?.payAfterAdjust) - Number(row.charge || 0)).toFixed(2) || '-'}
        </Text>{' '}
        <Text style={[styles.tableCell, { flex: 1.2 }]}>{row?.charge || 0}</Text>
        <Text style={[styles.tableCell, { flex: 1.2 }]}>
          {(Number(row?.payAfterAdjust)).toFixed(2) || '-'}
        </Text>
        <Text style={[styles.tableCell, { flex: 1.2 }]}>
          {row?.paymentDetail?.paymentMode || '-'}
        </Text>
        <Text style={[styles.tableCell, { flex: 1.2 }]}>
          {row?.paymentDetail?.cashAmount || 0}
        </Text>
        <Text style={[styles.tableCell, { flex: 1.2 }]}>
          {row?.paymentDetail?.bankAmount || 0}
        </Text>
        <Text style={[styles.tableCell, { flex: 1.5 }]}>{row?.paymentDetail?.bankName || '-'}</Text>
        <Text style={[styles?.tableCell, { flex: 1.2 }]}>{fDate(row?.createdAt) || '-'}</Text>
      </View>
    );

    rowsOnCurrentPage++;

    const isPageFull = rowsOnCurrentPage === maxRowsForCurrentPage;
    if (isPageFull || isLastRow) {
      const isFirstPage = currentPageIndex === 0;

      pages.push(
        <Page
          key={currentPageIndex}
          size="A4"
          style={{ ...styles.page, position: 'relative' }}
          orientation="landscape"
        >
          {isFirstPage && (
            <>
              <InvoiceHeader branch={filterData?.branch} configs={configs} landscape={true} />
              <View style={{ position: 'absolute', top: 20, right: 5, width: 200 }}>
                {dataFilter.map((item, idx) => (
                  <View key={idx} style={styles.row}>
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
                }}
              >
                <Text style={styles.termsAndConditionsHeaders}>OTHER INTEREST ENTRY REPORTS</Text>
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
              {isLastRow && (
                <View style={[styles.tableRow, styles.totalRow]}>
                  <Text style={[styles.totalCell, { flex: 0.2 }]}></Text>
                  <Text style={[styles.totalCell, { flex: 0.5 }]}></Text>
                  <Text style={[styles.totalCell, { flex: 3 }]}>TOTAL</Text>
                  <Text style={[styles.totalCell, { flex: 1 }]}></Text>
                  <Text style={[styles.totalCell, { flex: 1.2 }]}></Text>
                  <Text style={[styles.totalCell, { flex: 1.2 }]}></Text>
                  <Text style={[styles.totalCell, { flex: 0.5 }]}>{day}</Text>
                  <Text style={[styles.totalCell, { flex: 1.2 }]}>{otherAmt.toFixed(0)}</Text>
                  <Text style={[styles.totalCell, { flex: 1.2 }]}>{interestAmount.toFixed(0)}</Text>
                  <Text style={[styles.totalCell, { flex: 1.2 }]}>{charge.toFixed(0)}</Text>
                  <Text style={[styles.totalCell, { flex: 1.2 }]}>
                    {(payAmt).toFixed(0)}
                  </Text>
                  <Text style={[styles.totalCell, { flex: 1.2 }]}></Text>
                  <Text style={[styles.totalCell, { flex: 1.2 }]}>{cashAmt.toFixed(0)}</Text>
                  <Text style={[styles.totalCell, { flex: 1.2 }]}>{bankAmt.toFixed(0)}</Text>
                  <Text style={[styles.totalCell, { flex: 1.5 }]}></Text>
                  <Text style={[styles.totalCell, { flex: 1.2 }]}></Text>
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

  if (reportsData.length === 0) {
    pages.push(
      <Page
        key={0}
        size="A4"
        style={{ ...styles.page, position: 'relative' }}
        orientation="landscape"
      >
        <InvoiceHeader branch={filterData?.branch} configs={configs} landscape={true} />
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
          }}
        >
          <Text style={styles.termsAndConditionsHeaders}>OTHER INTEREST ENTRY REPORTS</Text>
        </View>
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
            <View style={[styles.tableRow, styles.lastTableRow]}>
              <Text
                style={[
                  styles.tableCell,
                  { flex: headers.reduce((acc, h) => acc + h.flex, 0), textAlign: 'center' },
                ]}
              >
                No data available
              </Text>
            </View>
          </View>
        </View>
      </Page>
    );
  }

  return <Document>{pages}</Document>;
}
