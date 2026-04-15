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
          fontSize: 7,
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
          fontSize: 6,
          fontWeight: 'bold',
          color: '#1a237e',
        },
      }),
    []
  );

const formatCurrency = (value, precision = 2) => {
  return (value || 0).toFixed(precision);
};

export default function InterestReportsPdf({ selectedBranch, configs, data, filterData, total }) {
  const styles = useStyles();
  const headers = [
    { label: '#', flex: 0.3 },
    { label: 'Loan No', flex: 2.5 },
    { label: 'From Date', flex: 1.2 },
    { label: 'To Date', flex: 1.2 },
    { label: 'Loan Amt', flex: 1.2 },
    { label: 'Int. Loan Amt', flex: 1.2 },
    { label: 'Int. + con. Rate', flex: 0.5 },
    { label: 'Int. Amt', flex: 1.2 },
    { label: 'Con. charge', flex: 1 },
    { label: 'Penalty', flex: 1.2 },
    { label: 'Total pay', flex: 1.2 },
    { label: 'Uchak amt', flex: 1.2 },
    { label: 'Old cr/dr', flex: 0.8 },
    { label: 'Pay After Adjust', flex: 1.5 },
    { label: 'Days', flex: 0.5 },
    { label: 'Entry Date', flex: 1.2 },
    { label: 'Cash amt', flex: 1.2 },
    { label: 'Bank amt', flex: 1.2 },
    { label: 'Bank', flex: 1.5 },
    { label: 'Total Pay Amt', flex: 1.2 },
    { label: 'Entry By', flex: 2 },
  ];

  const dataFilter = [
    { value: filterData?.branch|| '-', label: 'Branch' },
    { value: fDate(filterData?.startDate) || '-', label: 'Start Date' },
    { value: fDate(filterData?.endDate) || '-', label: 'End Date' },
    { value: fDate(new Date()) || '-', label: 'Date' },
  ];

  const firstPageRows = 16;
  const otherPagesRows = 23;

  const pages = [];
  let currentPageRows = [];
  let currentPageIndex = 0;
  let rowsOnCurrentPage = 0;
  let maxRowsForCurrentPage = firstPageRows;
  const reportsData = data || [];
  const reportCount = reportsData.length || 0;

  const totals = reportsData.reduce(
    (acc, row) => ({
      interestAmount: (acc.interestAmount || 0) + (row.interestAmount || 0),
      consultingCharge: (acc.consultingCharge || 0) + (Number(row.consultingCharge) || 0),
      penalty: (acc.penalty || 0) + (Number(row.penalty) || 0),
      uchakInterestAmount: (acc.uchakInterestAmount || 0) + (Number(row.uchakInterestAmount) || 0),
      oldCrDr: (acc.oldCrDr || 0) + (Number(row.old_cr_dr) || 0),
      adjustedPay: (acc.adjustedPay || 0) + (Number(row.adjustedPay) || 0),
      cashAmount: (acc.cashAmount || 0) + (Number(row.paymentDetail?.cashAmount) || 0),
      bankAmount: (acc.bankAmount || 0) + (Number(row.paymentDetail?.bankAmount) || 0),
      totalPayAmount: (acc.totalPayAmount || 0) + (Number(row.amountPaid) || 0),
      days: (acc.totalPayAmount || 0) + (Number(row.days) || 0),
    }),
    {}
  );

  reportsData.forEach((row, index) => {
    const isAlternateRow = index % 2 !== 0;
    const isLastRow = index === reportsData.length - 1;

    currentPageRows.push(
      <View key={index} style={[styles.tableRow, isAlternateRow && styles.alternateRow]}>
        <Text style={[styles.tableCell, { flex: headers[0].flex }]}>{index + 1}</Text>
        <Text style={[styles.tableCell, { flex: headers[1].flex }]}>{row.loan.loanNo}</Text>
        <Text style={[styles.tableCell, { flex: headers[2].flex }]}>{fDate(row.from)}</Text>
        <Text style={[styles.tableCell, { flex: headers[3].flex }]}>{fDate(row.to)}</Text>
        <Text style={[styles.tableCell, { flex: headers[4].flex }]}>
          {formatCurrency(row.loan.loanAmount)}
        </Text>
        <Text style={[styles.tableCell, { flex: headers[5].flex }]}>
          {formatCurrency(row.interestLoanAmount)}
        </Text>
        <Text style={[styles.tableCell, { flex: headers[6].flex }]}>
          {row.loan.scheme.interestRate}
        </Text>
        <Text style={[styles.tableCell, { flex: headers[7].flex }]}>
          {formatCurrency(row.interestAmount)}
        </Text>
        <Text style={[styles.tableCell, { flex: headers[8].flex }]}>
          {formatCurrency(row.consultingCharge)}
        </Text>
        <Text style={[styles.tableCell, { flex: headers[9].flex }]}>
          {formatCurrency(row.penalty)}
        </Text>
        <Text style={[styles.tableCell, { flex: headers[10].flex }]}>
          {formatCurrency(row.interestAmount + row.penalty + row.consultingCharge)}
        </Text>
        <Text style={[styles.tableCell, { flex: headers[11].flex }]}>
          {formatCurrency(row.uchakInterestAmount)}
        </Text>
        <Text style={[styles.tableCell, { flex: headers[12].flex }]}>
          {formatCurrency(row.old_cr_dr)}
        </Text>
        <Text style={[styles.tableCell, { flex: headers[13].flex }]}>
          {formatCurrency(row.adjustedPay)}
        </Text>
        <Text style={[styles.tableCell, { flex: headers[14].flex }]}>{row.days}</Text>
        <Text style={[styles.tableCell, { flex: headers[15].flex }]}>{fDate(row.createdAt)}</Text>
        <Text style={[styles.tableCell, { flex: headers[16].flex }]}>
          {formatCurrency(row.paymentDetail?.cashAmount)}
        </Text>
        <Text style={[styles.tableCell, { flex: headers[17].flex }]}>
          {formatCurrency(row.paymentDetail?.bankAmount)}
        </Text>
        <Text style={[styles.tableCell, { flex: headers[18].flex, fontSize: 5 }]}>
          {row?.paymentDetail?.account?.bankName || '-'}
        </Text>
        <Text style={[styles.tableCell, { flex: headers[19].flex }]}>
          {formatCurrency(row.amountPaid)}
        </Text>
        <Text style={[styles.tableCell, { flex: headers[20].flex, fontSize: 5 }]}>
          {row.entryBy}
        </Text>
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
              <InvoiceHeader selectedBranch={selectedBranch} configs={configs} landscape={true} />
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
                <Text style={styles.termsAndConditionsHeaders}>INTEREST ENTRY REPORTS</Text>
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
                  <Text style={[styles.totalCell, { flex: headers[0].flex }]}></Text>
                  <Text style={[styles.totalCell, { flex: headers[1].flex }]}>TOTAL</Text>
                  <Text style={[styles.totalCell, { flex: headers[2].flex }]}></Text>
                  <Text style={[styles.totalCell, { flex: headers[3].flex }]}></Text>
                  <Text style={[styles.totalCell, { flex: headers[4].flex }]}></Text>
                  <Text style={[styles.totalCell, { flex: headers[5].flex }]}></Text>
                  <Text style={[styles.totalCell, { flex: headers[6].flex }]}></Text>
                  <Text style={[styles.totalCell, { flex: headers[7].flex }]}>
                    {formatCurrency(totals.interestAmount)}
                  </Text>
                  <Text style={[styles.totalCell, { flex: headers[8].flex }]}>
                    {formatCurrency(totals.consultingCharge)}
                  </Text>
                  <Text style={[styles.totalCell, { flex: headers[9].flex }]}>
                    {formatCurrency(totals.penalty)}
                  </Text>
                  <Text style={[styles.totalCell, { flex: headers[10].flex }]}>
                    {formatCurrency(
                      totals.interestAmount + totals.penalty + totals.consultingCharge
                    )}
                  </Text>
                  <Text style={[styles.totalCell, { flex: headers[11].flex }]}>
                    {formatCurrency(totals.uchakInterestAmount)}
                  </Text>
                  <Text style={[styles.totalCell, { flex: headers[12].flex }]}>
                    {formatCurrency(totals.oldCrDr)}
                  </Text>

                  <Text style={[styles.totalCell, { flex: headers[13].flex }]}>
                    {formatCurrency(totals.adjustedPay)}
                  </Text>
                  {headers.slice(14, 16).map((header, i) => (
                    <Text key={i} style={[styles.totalCell, { flex: header.flex }]} />
                  ))}
                  <Text style={[styles.totalCell, { flex: headers[16].flex }]}>
                    {formatCurrency(totals.cashAmount)}
                  </Text>
                  <Text style={[styles.totalCell, { flex: headers[17].flex }]}>
                    {formatCurrency(totals.bankAmount)}
                  </Text>
                  <Text style={[styles.totalCell, { flex: headers[18].flex }]} />
                  <Text style={[styles.totalCell, { flex: headers[19].flex }]}>
                    {formatCurrency(totals.totalPayAmount)}
                  </Text>
                  <Text style={[styles.totalCell, { flex: headers[20].flex }]} />
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
          }}
        >
          <Text style={styles.termsAndConditionsHeaders}>INTEREST REPORTS</Text>
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
