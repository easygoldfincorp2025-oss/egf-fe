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
          borderColor: '#606060',
        },
        tableRow: {
          flexDirection: 'row',
          minHeight: 20,
          pageBreakInside: 'avoid',
          backgroundColor: '#FFFFFF',
        },
        tableHeader: {
          backgroundColor: '#5B9BD4',
          fontWeight: 'bold',
          textAlign: 'center',
        },
        tableCell: {
          padding: '4px 6px',
          borderRightWidth: 0.5,
          borderRightColor: '#606060',
          borderBottomWidth: 0.5,
          borderBottomColor: '#606060',
          textAlign: 'center',
          fontSize: 6.5,
          overflow: 'hidden',
          color: '#000000',
        },
        numericCell: {
          textAlign: 'center',
        },
        positiveValue: {
          color: '#008000',
        },
        negativeValue: {
          color: '#FF0000',
        },
        textCell: {
          textAlign: 'left',
          color: '#000000',
        },
        tableCellLast: {
          borderRightWidth: 0,
        },
        mainLoanCell: {
          backgroundColor: '#F2F2F2',
        },
        otherLoanCell: {
          backgroundColor: '#F2F2F2',
        },
        termsAndConditionsHeaders: {
          color: '#000000',
          borderBottom: '1px solid #000000',
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
        mergedCell: {
          padding: '4px 6px',
          borderRightWidth: 0.5,
          borderRightColor: '#b1b0b0',
          textAlign: 'center',
          fontSize: 6.5,
          overflow: 'hidden',
          backgroundColor: '#E3F2FD',
          minHeight: 20,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        },
      }),
    []
  );

export default function TotalInOutLoanReports({
  selectedBranch,
  configs,
  loans,
  filterData,
  total,
}) {
  const styles = useStyles();

  const {
    loanAmount,
    partLoanAmount,
    interestLoanAmount,
    totalWeight,
    netWeight,
    averageInterestRate,
    totalInterestAmount,
    otherLoanAmount,
    amount,
    grossWeight,
    averagePercentage,
    totalOtherInterestAmount,
    diffLoanAmount,
    diffInterestAmount,
  } = total;

  const headers = [
    { label: 'Loan No', flex: 2, width: 90 },
    { label: 'Issue date', flex: 1, width: 80 },
    { label: 'Customer name', flex: 2, width: 130 },
    { label: 'Total loan amt', flex: 1, width: 90 },
    { label: 'Int. loan amt', flex: 1, width: 90 },
    { label: 'Total wt', flex: 0.5, width: 70 },
    { label: 'Net wt', flex: 0.5, width: 70 },
    { label: 'Int. rate', flex: 0.4, width: 60 },
    { label: 'Total int.amt', flex: 1, width: 90 },
    { label: 'code', flex: 0.4, width: 40 },
    { label: 'Other no', flex: 1.2, width: 90 },
    { label: 'Date', flex: 1, width: 80 },
    { label: 'Other name', flex: 1, width: 90 },
    { label: 'Other Loan amt', flex: 1, width: 90 },
    { label: 'total Other Int. Amt', flex: 1, width: 90 },
    { label: 'Gross wt', flex: 0.5, width: 70 },
    { label: 'Net wt', flex: 0.5, width: 70 },
    { label: 'Other int(%)', flex: 0.5, width: 70 },
    { label: 'Other int amt', flex: 1, width: 90 },
    { label: 'Diff loan amt', flex: 1, width: 90 },
    { label: 'Diff int. amt', flex: 1, width: 90 },
  ];

  const dataFilter = [
    { value: fDate(filterData.startDate), label: 'Start Date' },
    { value: fDate(filterData.endDate), label: 'End Date' },
    { value: fDate(filterData.startOtherDate), label: 'Start Other Date' },
    { value: fDate(filterData.endOtherDate), label: 'End Other Date' },
    { value: filterData.branch.name, label: 'Branch' },
    { value: fDate(new Date()), label: 'Date' },
  ];

  const rowsPerPage = 14;
  const pages = [];
  let currentPageRows = [];
  let currentRowCount = 0;

  Object.entries(loans).forEach(([loanId, otherLoans], loanIndex) => {
    const firstRow = otherLoans[0];
    const rowSpan = otherLoans.length;

    otherLoans.forEach((row, index) => {
      const isLastRowInTable = currentRowCount === Object.values(loans).flat().length - 1;
      const isLastRowInGroup = index === otherLoans.length - 1;
      const conditionalSpannedStyle = !isLastRowInGroup ? { borderBottomWidth: 0 } : {};

      currentPageRows.push(
        <View key={`${loanId}-${index}`} style={[styles.tableRow]} wrap={false}>
          {index === 0 ? (
            <>
              <Text
                style={[
                  styles.tableCell,
                  { flex: headers[0].flex },
                  styles.textCell,
                  conditionalSpannedStyle,
                  styles.mainLoanCell,
                  { backgroundColor: row.loan.status === 'Closed' ? '#FFF1D6' : '#F2F2F2' },
                ]}
              >
                {row.loan.loanNo}
              </Text>
              <Text
                style={[
                  styles.tableCell,
                  { flex: headers[1].flex },
                  styles.numericCell,
                  conditionalSpannedStyle,
                  styles.mainLoanCell,
                  { backgroundColor: row.loan.status === 'Closed' ? '#FFF1D6' : '#F2F2F2' },
                ]}
              >
                {fDate(row.loan.issueDate)}
              </Text>
              <Text
                style={[
                  styles.tableCell,
                  { flex: headers[2].flex },
                  styles.textCell,
                  conditionalSpannedStyle,
                  styles.mainLoanCell,
                  { backgroundColor: row.loan.status === 'Closed' ? '#FFF1D6' : '#F2F2F2' },
                ]}
              >
                {`${row.loan.customer.firstName} ${row.loan.customer.middleName} ${row.loan.customer.lastName}`}
              </Text>
              <Text
                style={[
                  styles.tableCell,
                  { flex: headers[3].flex },
                  styles.numericCell,
                  conditionalSpannedStyle,
                  styles.mainLoanCell,
                  { backgroundColor: row.loan.status === 'Closed' ? '#FFF1D6' : '#F2F2F2' },
                ]}
              >
                {row.loan.loanAmount}
              </Text>
              <Text
                style={[
                  styles.tableCell,
                  { flex: headers[4].flex },
                  styles.numericCell,
                  conditionalSpannedStyle,
                  styles.mainLoanCell,
                  { backgroundColor: row.loan.status === 'Closed' ? '#FFF1D6' : '#F2F2F2' },
                ]}
              >
                {row.loan.interestLoanAmount.toFixed(2)}
              </Text>
              <Text
                style={[
                  styles.tableCell,
                  { flex: headers[5].flex },
                  styles.numericCell,
                  conditionalSpannedStyle,
                  styles.mainLoanCell,
                  { backgroundColor: row.loan.status === 'Closed' ? '#FFF1D6' : '#F2F2F2' },
                ]}
              >
                {row.loan.propertyDetails
                  .reduce((prev, next) => prev + (Number(next?.totalWeight) || 0), 0)
                  .toFixed(2)}
              </Text>
              <Text
                style={[
                  styles.tableCell,
                  { flex: headers[6].flex },
                  styles.numericCell,
                  conditionalSpannedStyle,
                  styles.mainLoanCell,
                  { backgroundColor: row.loan.status === 'Closed' ? '#FFF1D6' : '#F2F2F2' },
                ]}
              >
                {row.loan.propertyDetails
                  .reduce((prev, next) => prev + (Number(next?.netWeight) || 0), 0)
                  .toFixed(2)}
              </Text>
              <Text
                style={[
                  styles.tableCell,
                  { flex: headers[7].flex },
                  styles.numericCell,
                  conditionalSpannedStyle,
                  styles.mainLoanCell,
                  { backgroundColor: row.loan.status === 'Closed' ? '#FFF1D6' : '#F2F2F2' },
                ]}
              >
                {row.loan.scheme.interestRate.toFixed(2)}
              </Text>
              <Text
                style={[
                  styles.tableCell,
                  { flex: headers[8].flex },
                  styles.numericCell,
                  conditionalSpannedStyle,
                  styles.mainLoanCell,
                  { backgroundColor: row.loan.status === 'Closed' ? '#FFF1D6' : '#F2F2F2' },
                ]}
              >
                {row.totalInterestAmount.toFixed(2)}
              </Text>
              <Text
                style={[
                  styles.tableCell,
                  { flex: headers[9].flex },
                  styles.numericCell,
                  conditionalSpannedStyle,
                  styles.mainLoanCell,
                  { backgroundColor: row.status === 'Closed' ? '#FFF1D6' : '#FFF' },
                ]}
              >
                {row.code || 0}
              </Text>
            </>
          ) : (
            <>
              <Text
                style={[
                  styles.tableCell,
                  { flex: headers[0].flex },
                  conditionalSpannedStyle,
                  styles.mainLoanCell,
                  { backgroundColor: row.status === 'Closed' ? '#FFF1D6' : '#FFF' },
                ]}
              >
                {' '}
              </Text>
              <Text
                style={[
                  styles.tableCell,
                  { flex: headers[1].flex },
                  conditionalSpannedStyle,
                  styles.mainLoanCell,
                  { backgroundColor: row.status === 'Closed' ? '#FFF1D6' : '#FFF' },
                ]}
              >
                {' '}
              </Text>
              <Text
                style={[
                  styles.tableCell,
                  { flex: headers[2].flex },
                  conditionalSpannedStyle,
                  styles.mainLoanCell,
                  { backgroundColor: row.status === 'Closed' ? '#FFF1D6' : '#FFF' },
                ]}
              >
                {' '}
              </Text>
              <Text
                style={[
                  styles.tableCell,
                  { flex: headers[3].flex },
                  conditionalSpannedStyle,
                  styles.mainLoanCell,
                  { backgroundColor: row.status === 'Closed' ? '#FFF1D6' : '#FFF' },
                ]}
              >
                {' '}
              </Text>
              <Text
                style={[
                  styles.tableCell,
                  { flex: headers[4].flex },
                  conditionalSpannedStyle,
                  styles.mainLoanCell,
                  { backgroundColor: row.status === 'Closed' ? '#FFF1D6' : '#FFF' },
                ]}
              >
                {' '}
              </Text>
              <Text
                style={[
                  styles.tableCell,
                  { flex: headers[5].flex },
                  conditionalSpannedStyle,
                  styles.mainLoanCell,
                  { backgroundColor: row.status === 'Closed' ? '#FFF1D6' : '#FFF' },
                ]}
              >
                {' '}
              </Text>
              <Text
                style={[
                  styles.tableCell,
                  { flex: headers[6].flex },
                  conditionalSpannedStyle,
                  styles.mainLoanCell,
                  { backgroundColor: row.status === 'Closed' ? '#FFF1D6' : '#FFF' },
                ]}
              >
                {' '}
              </Text>
              <Text
                style={[
                  styles.tableCell,
                  { flex: headers[7].flex },
                  conditionalSpannedStyle,
                  styles.mainLoanCell,
                  { backgroundColor: row.status === 'Closed' ? '#FFF1D6' : '#FFF' },
                ]}
              >
                {' '}
              </Text>
              <Text
                style={[
                  styles.tableCell,
                  { flex: headers[8].flex },
                  conditionalSpannedStyle,
                  styles.mainLoanCell,
                  { backgroundColor: row.status === 'Closed' ? '#FFF1D6' : '#FFF' },
                ]}
              >
                {' '}
              </Text>
              <Text
                style={[
                  styles.tableCell,
                  { flex: headers[9].flex },
                  conditionalSpannedStyle,
                  styles.mainLoanCell,
                  { backgroundColor: row.status === 'Closed' ? '#FFF1D6' : '#FFF' },
                ]}
              >
                {' '}
              </Text>
            </>
          )}
          <Text
            style={[
              styles.tableCell,
              { flex: headers[10].flex },
              styles.textCell,
              { backgroundColor: row.status === 'Closed' ? '#FFF1D6' : '#FFF' },
            ]}
          >
            {row.otherNumber}
          </Text>
          <Text style={[styles.tableCell, { flex: headers[11].flex }, styles.numericCell,
            { backgroundColor: row.status === 'Closed' ? '#FFF1D6' : '#FFF' },
          ]}>
            {fDate(row.date)}
          </Text>
          <Text style={[styles.tableCell, { flex: headers[12].flex }, styles.textCell,
            { backgroundColor: row.status === 'Closed' ? '#FFF1D6' : '#FFF' },
          ]}>
            {row.otherName}
          </Text>
          <Text style={[styles.tableCell, { flex: headers[13].flex }, styles.numericCell,
            { backgroundColor: row.status === 'Closed' ? '#FFF1D6' : '#FFF' },

          ]}>
            {Number(row.amount).toFixed(2)}
          </Text>
          <Text style={[styles.tableCell, { flex: headers[14].flex }, styles.numericCell,
            { backgroundColor: row.status === 'Closed' ? '#FFF1D6' : '#FFF' },
          ]}>
            {Number(row.totalOtherInterestAmount).toFixed(2)}
          </Text>
          <Text style={[styles.tableCell, { flex: headers[15].flex }, styles.numericCell,
            { backgroundColor: row.status === 'Closed' ? '#FFF1D6' : '#FFF' },
          ]}>
            {row.grossWt}
          </Text>
          <Text style={[styles.tableCell, { flex: headers[16].flex }, styles.numericCell,
            { backgroundColor: row.status === 'Closed' ? '#FFF1D6' : '#FFF' },
          ]}>
            {row.netWt}
          </Text>
          <Text style={[styles.tableCell, { flex: headers[17].flex }, styles.numericCell,
            { backgroundColor: row.status === 'Closed' ? '#FFF1D6' : '#FFF' },
          ]}>
            {Number(row.percentage).toFixed(2)}
          </Text>
          <Text style={[styles.tableCell, { flex: headers[18].flex }, styles.numericCell,
            { backgroundColor: row.status === 'Closed' ? '#FFF1D6' : '#FFF' },
          ]}>
            {Number(row.totalOtherInterestAmount).toFixed(2)}
          </Text>
          {index === 0 ? (
            <>
              <Text
                style={[
                  styles.tableCell,
                  { flex: headers[19].flex },
                  { backgroundColor: row.status === 'Closed' ? '#FFF1D6' : '#FFF' },
                  styles.numericCell,
                  conditionalSpannedStyle,
                  (() => {
                    const totalOtherAmount = otherLoans.reduce(
                      (sum, loan) => sum + Number(loan.amount || 0),
                      0
                    );
                    const diffAmount = totalOtherAmount - row.loan.interestLoanAmount;
                    return diffAmount < 0 ? styles.negativeValue : styles.positiveValue;
                  })(),
                ]}
              >
                {(() => {
                  const totalOtherAmount = otherLoans.reduce(
                    (sum, loan) => sum + Number(loan.amount || 0),
                    0
                  );
                  const diffAmount = totalOtherAmount - row.loan.interestLoanAmount;
                  return diffAmount.toFixed(2);
                })()}
              </Text>
              <Text
                style={[
                  styles.tableCell,
                  { flex: headers[20].flex },
                  { backgroundColor: row.status === 'Closed' ? '#FFF1D6' : '#FFF' },
                  styles.numericCell,
                  conditionalSpannedStyle,
                  (() => {
                    const totalOtherInterest = otherLoans.reduce(
                      (sum, loan) => sum + Number(loan.totalOtherInterestAmount || 0),
                      0
                    );
                    const diffInterest = row.totalInterestAmount - totalOtherInterest;
                    return diffInterest < 0 ? styles.negativeValue : styles.positiveValue;
                  })(),
                ]}
              >
                {(() => {
                  const totalOtherInterest = otherLoans.reduce(
                    (sum, loan) => sum + Number(loan.totalOtherInterestAmount || 0),
                    0
                  );
                  const diffInterest = row.totalInterestAmount - totalOtherInterest;
                  return diffInterest.toFixed(2);
                })()}
              </Text>
            </>
          ) : (
            <>
              <Text style={[styles.tableCell, { flex: headers[19].flex }, conditionalSpannedStyle,
                { backgroundColor: row.status === 'Closed' ? '#FFF1D6' : '#FFF' },
              ]}>
                {' '}
              </Text>
              <Text style={[styles.tableCell, { flex: headers[20].flex }, conditionalSpannedStyle,
                { backgroundColor: row.status === 'Closed' ? '#FFF1D6' : '#FFF' },
              ]}>
                {' '}
              </Text>
            </>
          )}
        </View>
      );

      currentRowCount++;

      if (
        currentRowCount % rowsPerPage === 0 ||
        currentRowCount === Object.values(loans).flat().length
      ) {
        const isFirstPage = pages.length === 0;
        pages.push(
          <Page key={pages.length} size="A4" style={styles.page} orientation="landscape">
            {isFirstPage && (
              <>
                <InvoiceHeader branch={filterData.branch} configs={configs} landscape={true} />
                <View style={{ position: 'absolute', top: 20, right: 5, width: 200 }}>
                  {dataFilter.map((item, index) => (
                    <View style={styles.row}>
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
                  <Text style={styles.termsAndConditionsHeaders}>
                    TOTAL ALL IN OUT LOAN REPORTS
                  </Text>
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
                {currentRowCount === Object.values(loans).flat().length && (
                  <View
                    style={[
                      styles.tableRow,
                      {
                        backgroundColor: '#E8F0FE',
                        color: '#1a237e',
                        fontWeight: 'bold',
                      },
                    ]}
                  >
                    <Text style={[styles.tableCell, { flex: headers[0].flex, color: '#1a237e' }]}>
                      TOTAL
                    </Text>
                    <Text
                      style={[styles.tableCell, { flex: headers[1].flex, color: '#1a237e' }]}
                    ></Text>
                    <Text
                      style={[styles.tableCell, { flex: headers[2].flex, color: '#1a237e' }]}
                    ></Text>
                    <Text style={[styles.tableCell, { flex: headers[3].flex, color: '#1a237e' }]}>
                      {loanAmount.toFixed(0)}
                    </Text>
                    <Text style={[styles.tableCell, { flex: headers[4].flex, color: '#1a237e' }]}>
                      {interestLoanAmount.toFixed(2)}
                    </Text>
                    <Text style={[styles.tableCell, { flex: headers[5].flex, color: '#1a237e' }]}>
                      {totalWeight.toFixed(0)}
                    </Text>
                    <Text style={[styles.tableCell, { flex: headers[6].flex, color: '#1a237e' }]}>
                      {netWeight.toFixed(0)}
                    </Text>
                    <Text style={[styles.tableCell, { flex: headers[7].flex, color: '#1a237e' }]}>
                      {averageInterestRate.toFixed(2)}
                    </Text>
                    <Text style={[styles.tableCell, { flex: headers[8].flex, color: '#1a237e' }]}>
                      {totalInterestAmount.toFixed(0)}
                    </Text>
                    <Text
                      style={[styles.tableCell, { flex: headers[9].flex, color: '#1a237e' }]}
                    ></Text>
                    <Text
                      style={[styles.tableCell, { flex: headers[10].flex, color: '#1a237e' }]}
                    ></Text>
                    <Text
                      style={[styles.tableCell, { flex: headers[11].flex, color: '#1a237e' }]}
                    ></Text>
                    <Text
                      style={[styles.tableCell, { flex: headers[12].flex, color: '#1a237e' }]}
                    ></Text>
                    <Text style={[styles.tableCell, { flex: headers[13].flex, color: '#1a237e' }]}>
                      {otherLoanAmount.toFixed(0)}
                    </Text>
                    <Text style={[styles.tableCell, { flex: headers[14].flex, color: '#1a237e' }]}>
                      {totalOtherInterestAmount.toFixed(0)}
                    </Text>
                    <Text style={[styles.tableCell, { flex: headers[15].flex, color: '#1a237e' }]}>
                      {grossWeight.toFixed(0)}
                    </Text>
                    <Text style={[styles.tableCell, { flex: headers[16].flex, color: '#1a237e' }]}>
                      {netWeight.toFixed(0)}
                    </Text>
                    <Text style={[styles.tableCell, { flex: headers[17].flex, color: '#1a237e' }]}>
                      {averagePercentage.toFixed(2)}
                    </Text>
                    <Text style={[styles.tableCell, { flex: headers[18].flex, color: '#1a237e' }]}>
                      {totalOtherInterestAmount.toFixed(0)}
                    </Text>
                    <Text
                      style={[
                        styles.tableCell,
                        { flex: headers[19].flex, color: '#1a237e' },
                        diffLoanAmount < 0 ? styles.negativeValue : styles.positiveValue,
                      ]}
                    >
                      {diffLoanAmount.toFixed(0)}
                    </Text>
                    <Text
                      style={[
                        styles.tableCell,
                        { flex: headers[20].flex, color: '#1a237e' },
                        diffInterestAmount < 0 ? styles.negativeValue : styles.positiveValue,
                      ]}
                    >
                      {diffInterestAmount.toFixed(0)}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </Page>
        );
        currentPageRows = [];
      }
    });
  });

  return <Document>{pages}</Document>;
}
