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
          fontSize: 6.5,
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
          flex: 1.5,
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
          flexDirection: 'row',
          backgroundColor: '#F4F6F8',
          minHeight: 25,
        },
        totalCell: {
          padding: 5,
          borderRightWidth: 0.5,
          borderRightColor: '#b1b0b0',
          fontWeight: 'bold',
          color: '#637381',
        },
      }),
    []
  );

export default function AllBranchOtherLoanSummaryPdf({
  selectedBranch,
  configs,
  loans,
  filterData,
  total,
}) {
  const styles = useStyles();
  const { percentage, rate, amount, pendingInterest, day, charge,grossWt,netWt } = total;
  const dataFiltered = loans;

  const headers = [
    { label: '#', flex: 0.2 },
    { label: 'Code', flex: 0.5 },
    { label: 'Loan No', flex: 2 },
    { label: 'Customer Name', flex: 4 },
    { label: 'Other name', flex: 2 },
    { label: 'Other no.', flex: 1 },
    { label: 'int rate (%)', flex: 0.4 },
    { label: 'Fund', flex: 1 },
    { label: 'Open date', flex: 0.85 },
    { label: 'Other loan amt', flex: 1 },
    { label: 'Gross Wt', flex: 0.8 },
    { label: 'Net Wt', flex: 0.8 },
    { label: 'Charge', flex: 0.8 },
    { label: 'Day', flex: 0.3 },
    { label: 'Pending int.', flex: 1 },
    { label: 'Renew date', flex: 0.85 },
  ];

  const dataFilter = [
    { value: fDate(filterData.renewStartDate), label: 'Renew Start Date' },
    { value: fDate(filterData.renewEndDate), label: 'Renew End Date' },
    { value: fDate(filterData.startDate), label: 'Start Date' },
    { value: fDate(filterData.endDate), label: 'End Date' },
    { value: filterData.otherName, label: 'Other Name' },
    { value: filterData.branch, label: 'Branch' },
    { value: fDate(new Date()), label: 'Date' },
  ];

  const rowsPerPage = 16;
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
        <Text style={[styles.tableCell, { flex: 0.2 }]}>{index + 1}</Text>
        <Text style={[styles.tableCell, { flex: 0.5 }]}>{row?.code}</Text>
        <Text style={[styles.tableCell, { flex: 2 }]}>{row.loan.loanNo}</Text>
        <Text style={[styles.tableCell, { flex: 4, fontSize: 7, padding: 5 }]}>
          {`${row.loan.customer.firstName} ${row.loan.customer.middleName} ${row.loan.customer.lastName}`}
        </Text>
        <Text style={[styles.tableCell, { flex: 2 }]}>{row.otherName}</Text>
        <Text style={[styles.tableCell, { flex: 1 }]}>{row.otherNumber}</Text>
        <Text style={[styles.tableCell, { flex: 0.4 }]}>{row.percentage}</Text>
        <Text style={[styles.tableCell, { flex: 1 }]}>{row.rate}</Text>
        <Text style={[styles.tableCell, { flex: 0.85 }]}>{fDate(row.date)}</Text>
        <Text style={[styles.tableCell, { flex: 1 }]}>{row.amount}</Text>
        <Text style={[styles.tableCell, { flex: 0.8 }]}>
          {row?.loan?.propertyDetails
            .reduce((prev, next) => prev + (Number(next?.grossWeight) || 0), 0)
            .toFixed(2)}
        </Text>
        <Text style={[styles.tableCell, { flex: 0.8 }]}>
          {row?.loan?.propertyDetails
            .reduce((prev, next) => prev + (Number(next?.netWeight) || 0), 0)
            .toFixed(2)}
        </Text>

        <Text style={[styles.tableCell, { flex: 0.8 }]}>{row.otherCharge}</Text>
        <Text style={[styles.tableCell, { flex: 0.3 }]}>{row.day > 0 ? row.day : 0}</Text>
        <Text style={[styles.tableCell, { flex: 1 }]}>{row.pendingInterest.toFixed(2)}</Text>
        <Text style={[styles.tableCell, { flex: 0.85, borderRight: 0 }]}>
          {fDate(row.renewalDate)}
        </Text>
      </View>
    );

    if ((index + 1) % rowsPerPage === 0 || index === loans.length - 1) {
      const isFirstPage = pages.length === 0;
      pages.push(
        <Page key={pages.length} size="A4" style={styles.page} orientation="landscape">
          {isFirstPage && (
            <>
              <InvoiceHeader selectedBranch={selectedBranch} configs={configs} landscape={true} />
              <View style={{ position: 'absolute', top: 15, right: 0, width: 200 }}>
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
                <Text style={styles.termsAndConditionsHeaders}>OTHER LOAN REPORTS</Text>
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
              {index === loans.length - 1 && (
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
                    style={[styles.tableCell, { flex: 0.2, fontWeight: 'bold', color: '#1a237e' }]}
                  ></Text>
                  <Text
                    style={[styles.tableCell, { flex: 0.5, fontWeight: 'bold', color: '#1a237e' }]}
                  ></Text>
                  <Text
                    style={[styles.tableCell, { flex: 2, fontWeight: 'bold', color: '#1a237e' }]}
                  >
                    TOTAL
                  </Text>
                  <Text style={[styles.tableCell, { flex: 4 }]}></Text>
                  <Text style={[styles.tableCell, { flex: 2 }]}></Text>
                  <Text style={[styles.tableCell, { flex: 1 }]}></Text>
                  <Text
                    style={[styles.tableCell, { flex: 0.4, fontWeight: 'bold', color: '#1a237e' }]}
                  >
                    {(percentage / loans.length).toFixed(2)}
                  </Text>
                  <Text
                    style={[styles.tableCell, { flex: 1, fontWeight: 'bold', color: '#1a237e' }]}
                  >
                    {rate.toFixed(0)}
                  </Text>
                  <Text style={[styles.tableCell, { flex: 0.85 }]}></Text>
                  <Text
                    style={[styles.tableCell, { flex: 1, fontWeight: 'bold', color: '#1a237e' }]}
                  >
                    {amount.toFixed(0)}
                  </Text>{' '}
                  <Text
                    style={[styles.tableCell, { flex: 0.8, fontWeight: 'bold', color: '#1a237e' }]}
                  >
                    {grossWt.toFixed(2)}
                  </Text>{' '}
                  <Text
                    style={[styles.tableCell, { flex: 0.8, fontWeight: 'bold', color: '#1a237e' }]}
                  >
                    {netWt.toFixed(2)}
                  </Text>
                  <Text
                    style={[styles.tableCell, { flex: 0.8, fontWeight: 'bold', color: '#1a237e' }]}
                  >
                    {charge.toFixed(0)}
                  </Text>
                  <Text
                    style={[styles.tableCell, { flex: 0.3, fontWeight: 'bold', color: '#1a237e' }]}
                  >
                    {(day / loans.length || 0).toFixed(0)}
                  </Text>
                  <Text
                    style={[styles.tableCell, { flex: 1, fontWeight: 'bold', color: '#1a237e' }]}
                  >
                    {pendingInterest.toFixed(0)}
                  </Text>
                  <Text style={[styles.tableCell, { flex: 0.85, borderRight: 0 }]}></Text>
                </View>
              )}
            </View>
          </View>
        </Page>
      );
      currentPageRows = [];
    }
  });

  return <Document>{pages}</Document>;
}
