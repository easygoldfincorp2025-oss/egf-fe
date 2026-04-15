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
          backgroundColor: '#ffffff',
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
        footerRow: {
          flexDirection: 'row',
          backgroundColor: '#F4F6F8',
          borderTopWidth: 1,
          borderTopColor: '#b1b0b0',
          minHeight: 25,
        },
        footerCell: {
          padding: 5,
          borderRightWidth: 0.5,
          borderRightColor: '#b1b0b0',
          textAlign: 'center',
          fontSize: 7,
          fontWeight: 'bold',
          color: '#637381',
        },
      }),
    []
  );

export default function BranchWiseLoanClosingPdf({
  selectedBranch,
  configs,
  loans,
  filterData,
  total,
}) {
  const styles = useStyles();

  const cutoffDate = new Date('2025-08-01');

  const {
    int,
    conCharge,
    totalIntPay,
    closeCharge,
    closeAmt,
    loanAmt,
    intLoanAmt,
    approvalCharge,
    day,
    cashAmt,
    bankAmt,
  } = total || {
    int: 0,
    conCharge: 0,
    totalIntPay: 0,
    closeCharge: 0,
    closeAmt: 0,
    loanAmt: 0,
    intLoanAmt: 0,
    approvalCharge: 0,
    day: 0,
  };

  const headers = [
    { label: '#', flex: 0.1 },
    { label: 'Loan No', flex: 2.1 },
    { label: 'Customer Name', flex: 4.5 },
    { label: 'Contact', flex: 1.2 },
    { label: 'Int%', flex: 0.4 },
    { label: 'Other Int%', flex: 0.4 },
    { label: 'Issue Date', flex: 1.5 },
    { label: 'Loan Amt', flex: 1 },
    { label: 'Last Int. pay date', flex: 1.2 },
    { label: 'Total Int. pay', flex: 1.3 },
    { label: 'Day', flex: 0.5 },
    { label: 'Close date', flex: 1.2 },
    { label: 'Approval Charge', flex: 1 },
    { label: 'Close charge', flex: 1 },
    { label: 'Close amt', flex: 1.3 },
    { label: 'Mode', flex: 0.5 },
    { label: 'cash Amt', flex: 1 },
    { label: 'bank Amt', flex: 1 },
    { label: 'Bank Name', flex: 1.3 },
    { label: 'Close By', flex: 2.2 },
  ];

  const dataFilter = [
    { value: filterData?.closedBy?.name || '-', label: 'Closed By' },
    { value: filterData?.branch || '-', label: 'Branch' },
    { value: fDate(filterData?.startDate) || '-', label: 'Start Date' },
    { value: fDate(filterData?.endDate) || '-', label: 'End Date' },
    { value: fDate(filterData?.startCloseDate) || '-', label: 'Start Close Date' },
    { value: fDate(filterData?.endCloseDate) || '-', label: 'End Close Date' },
    { value: fDate(new Date()) || '-', label: 'Date' },
  ];

  const firstPageRows = 14;
  const otherPagesRows = 20;

  const loansData = loans || [];
  const loanCount = loansData.length || 0;

  const pages = [];
  let currentPageRows = [];
  let currentPageIndex = 0;
  let rowsOnCurrentPage = 0;
  let maxRowsForCurrentPage = firstPageRows;

  loansData.forEach((row, index) => {
    const isAlternateRow = index % 2 !== 0;
    const isLastRow = index === loansData.length - 1;

    currentPageRows.push(
      <View
        key={index}
        style={[
          styles.tableRow,
          isAlternateRow ? styles.alternateRow : {},
          isLastRow && rowsOnCurrentPage === maxRowsForCurrentPage - 1 ? styles.lastTableRow : {},
        ]}
        wrap={false}
      >
        <Text style={[styles.tableCell, { flex: 0.1 }]}>{index + 1}</Text>
        <Text style={[styles.tableCell, { flex: 2.1 }]}>{row.loanNo || '-'}</Text>
        <Text style={[styles.tableCell, { flex: 4.5, fontSize: 6, padding: 5 }]}>
          {`${row.customer?.firstName || ''} ${row.customer?.middleName || ''} ${row.customer?.lastName || ''}`}
        </Text>
        <Text style={[styles.tableCell, { flex: 1.2 }]}>{row.customer?.contact || '-'}</Text>
        <Text style={[styles.tableCell, { flex: 0.4 }]}>
          {' '}
          {new Date(row?.loan?.issueDate) < cutoffDate
            ? Number(
                row?.loan?.scheme?.interestRate > 1.5 ? 1.5 : row?.loan?.scheme?.interestRate
              ).toFixed(2)
            : 1}
        </Text>
        <Text style={[styles.tableCell, { flex: 0.4 }]}>{row.consultingCharge || '-'}</Text>
        <Text style={[styles.tableCell, { flex: 1.5 }]}>{fDate(row.issueDate) || '-'}</Text>
        <Text style={[styles.tableCell, { flex: 1 }]}>{(row.loanAmount || 0).toFixed(2)}</Text>
        <Text style={[styles.tableCell, { flex: 1.2 }]}>
          {fDate(row.lastInstallmentDate) || '-'}
        </Text>
        <Text style={[styles.tableCell, { flex: 1.3 }]}>
          {(row.totalPaidInterest || 0).toFixed(2)}
        </Text>
        <Text style={[styles.tableCell, { flex: 0.5 }]}>{row.day > 0 ? row.day : 0}</Text>
        <Text style={[styles.tableCell, { flex: 1.2 }]}>{fDate(row.closedDate) || '-'}</Text>
        <Text style={[styles.tableCell, { flex: 1 }]}>{(row.approvalCharge || 0).toFixed(2)}</Text>
        <Text style={[styles.tableCell, { flex: 1 }]}>{(row.closeCharge || 0).toFixed(2)}</Text>
        <Text style={[styles.tableCell, { flex: 1.3 }]}>{(row?.loanAmount || 0).toFixed(2)}</Text>
        <Text style={[styles.tableCell, { flex: 0.5 }]}>{row?.paymentMode}</Text>
        <Text style={[styles.tableCell, { flex: 1 }]}>{row?.cashAmount || '-'}</Text>
        <Text style={[styles.tableCell, { flex: 1 }]}>{row?.bankAmount || '-'}</Text>
        <Text style={[styles.tableCell, { flex: 1.3 }]}>
          {row?.companyBankDetail?.account?.bankName || '-'}
        </Text>
        <Text style={[styles.tableCell, styles.tableCellLast, { flex: 2.2 }]}>
          {`${row.closedBy?.firstName || ''} ${row.closedBy?.middleName || ''} ${row.closedBy?.lastName || ''}`}
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
                {dataFilter.map((item, idx) => (
                  <View style={styles.row} key={idx}>
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
                <Text style={styles.termsAndConditionsHeaders}>LOAN CLOSING REPORT</Text>
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
              {isLastRow && (
                <View
                  style={[
                    styles.tableRow,
                    {
                      backgroundColor: '#E8F0FE',
                      minHeight: 25,
                    },
                  ]}
                >
                  <Text
                    style={[styles.tableCell, { flex: 0.1, fontWeight: 'bold', color: '#1a237e' }]}
                  ></Text>
                  <Text
                    style={[styles.tableCell, { flex: 2.1, fontWeight: 'bold', color: '#1a237e' }]}
                  >
                    TOTAL
                  </Text>
                  <Text style={[styles.tableCell, { flex: 4.5 }]}></Text>
                  <Text style={[styles.tableCell, { flex: 1.2 }]}></Text>
                  <Text
                    style={[styles.tableCell, { flex: 0.4, fontWeight: 'bold', color: '#1a237e' }]}
                  >
                    {loanCount > 0 ? (int / loanCount).toFixed(2) : '0.00'}
                  </Text>
                  <Text
                    style={[styles.tableCell, { flex: 0.4, fontWeight: 'bold', color: '#1a237e' }]}
                  >
                    {loanCount > 0 ? (conCharge / loanCount).toFixed(2) : '0.00'}
                  </Text>
                  <Text style={[styles.tableCell, { flex: 1.5 }]}></Text>
                  <Text
                    style={[styles.tableCell, { flex: 1, fontWeight: 'bold', color: '#1a237e' }]}
                  >
                    {loanAmt.toFixed(0)}
                  </Text>
                  <Text style={[styles.tableCell, { flex: 1.2 }]}></Text>
                  <Text
                    style={[styles.tableCell, { flex: 1.3, fontWeight: 'bold', color: '#1a237e' }]}
                  >
                    {totalIntPay.toFixed(0)}
                  </Text>
                  <Text
                    style={[styles.tableCell, { flex: 0.5, fontWeight: 'bold', color: '#1a237e' }]}
                  >
                    {loanCount > 0 ? (day / loanCount).toFixed(0) : '0'}
                  </Text>
                  <Text style={[styles.tableCell, { flex: 1.2 }]}></Text>
                  <Text
                    style={[styles.tableCell, { flex: 1, fontWeight: 'bold', color: '#1a237e' }]}
                  >
                    {approvalCharge.toFixed(0)}
                  </Text>
                  <Text
                    style={[styles.tableCell, { flex: 1, fontWeight: 'bold', color: '#1a237e' }]}
                  >
                    {closeCharge.toFixed(0)}
                  </Text>
                  <Text
                    style={[styles.tableCell, { flex: 1.3, fontWeight: 'bold', color: '#1a237e' }]}
                  >
                    {loanAmt.toFixed(0)}
                  </Text>
                  <Text
                    style={[styles.tableCell, { flex: 0.5, fontWeight: 'bold', color: '#1a237e' }]}
                  ></Text>
                  <Text
                    style={[
                      styles.tableCell,
                      {
                        flex: 1,
                        fontWeight: 'bold',
                        color: '#1a237e',
                      },
                    ]}
                  >
                    {bankAmt.toFixed(0)}
                  </Text>
                  <Text
                    style={[
                      styles.tableCell,
                      {
                        flex: 1,
                        fontWeight: 'bold',
                        color: '#1a237e',
                      },
                    ]}
                  >
                    {cashAmt.toFixed(0)}
                  </Text>
                  <Text
                    style={[styles.tableCell, { flex: 1.3, fontWeight: 'bold', color: '#1a237e' }]}
                  ></Text>

                  <Text style={[styles.tableCell, styles.tableCellLast, { flex: 2.2 }]}></Text>
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

  if (loansData.length === 0) {
    pages.push(
      <Page key={0} size="A4" style={styles.page} orientation="landscape">
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
          <Text style={styles.termsAndConditionsHeaders}>BRANCH WISE LOAN CLOSING REPORT</Text>
        </View>
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
