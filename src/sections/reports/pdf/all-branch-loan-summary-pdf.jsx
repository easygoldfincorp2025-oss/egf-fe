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
      }),
    []
  );

export default function AllBranchLoanSummaryPdf({
  selectedBranch,
  configs,
  loans,
  filterData,
  total,
}) {
  const {
    int,
    approvalCharge,
    conCharge,
    loanAmt,
    intLoanAmt,
    totalIntPay,
    day,
    pendingDays,
    pendingIntAmt,
    cashAmt,
    bankAmt,
    totalWt,
    grossWt,
    netWt,
  } = total;
  const styles = useStyles();

  const headers = [
    { label: '#', flex: 0.3 },
    { label: 'Loan No', flex: 2 },
    { label: 'Customer Name', flex: 4 },
    { label: 'Contact', flex: 1 },
    { label: 'Int%', flex: 0.4 },
    { label: 'Other Int%', flex: 0.6 },
    { label: 'Issue Date ', flex: 1 },
    { label: 'Total Wt', flex: 0.5 },
    { label: 'Gross Wt', flex: 0.5 },
    { label: 'Net Wt', flex: 0.5 },
    { label: 'Loan Amt', flex: 1 },
    { label: 'Last Amt Pay Date', flex: 1 },
    { label: 'Loan Amt Pay', flex: 1 },
    { label: 'Loan Int. Amt', flex: 1 },
    { label: 'Mode', flex: 0.5 },
    { label: 'cash Amt', flex: 1 },
    { label: 'bank Amt', flex: 1 },
    { label: 'Bank Name', flex: 1 },
    { label: 'Created By', flex: 1.8 },
  ];

  const branch = sessionStorage.getItem('selectedBranch');

  const dataFilter = [
    { value: filterData.issuedBy.name, label: 'Issued By' },
    { value: filterData.branch, label: 'Branch' },
    { value: fDate(filterData.startDate), label: 'Start Date' },
    { value: fDate(filterData.endDate), label: 'End Date' },
    { value: fDate(new Date()), label: 'Date' },
  ];

  const rowsPerPageFirst = 14;
  const rowsPerPageOther = 20;

  const remainingRows = loans.length - rowsPerPageFirst;
  const additionalPages = Math.ceil(Math.max(0, remainingRows) / rowsPerPageOther);
  const totalPages = 1 + additionalPages;

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
        <Text style={[styles.tableCell, { flex: 0.3 }]}>{index + 1}</Text>
        <Text style={[styles.tableCell, { flex: 2 }]}>{row.loanNo}</Text>
        <Text style={[styles.tableCell, { flex: 4, fontSize: 5.5, padding: 5 }]}>
          {`${row.customer.firstName} ${row.customer.middleName} ${row.customer.lastName}`}
        </Text>
        <Text style={[styles.tableCell, { flex: 1 }]}>{row.customer.contact}</Text>
        <Text style={[styles.tableCell, { flex: 0.4 }]}>
          {row.scheme.interestRate > 1.5 ? 1.5 : row.scheme.interestRate}
        </Text>
        <Text style={[styles.tableCell, { flex: 0.6 }]}>{row.consultingCharge}</Text>
        <Text style={[styles.tableCell, { flex: 1 }]}>{fDate(row.issueDate)}</Text>
        <Text style={[styles.tableCell, { flex: 0.5 }]}>
          {row.propertyDetails
            .reduce((prev, next) => prev + (Number(next?.totalWeight) || 0), 0)
            .toFixed(2)}
        </Text>
        <Text style={[styles.tableCell, { flex: 0.5 }]}>
          {row.propertyDetails
            .reduce((prev, next) => prev + (Number(next?.grossWeight) || 0), 0)
            .toFixed(2)}
        </Text>
        <Text style={[styles.tableCell, { flex: 0.5 }]}>
          {row.propertyDetails
            .reduce((prev, next) => prev + (Number(next?.netWeight) || 0), 0)
            .toFixed(2)}
        </Text>
        <Text style={[styles.tableCell, { flex: 1 }]}>{row.loanAmount}</Text>
        <Text style={[styles.tableCell, { flex: 1 }]}>
          {fDate(row.lastAmtPayDate) || '-'}
        </Text>
        <Text style={[styles.tableCell, { flex: 1 }]}>
          {row.loanAmount - row.interestLoanAmount || '-'}
        </Text>
        <Text style={[styles.tableCell, { flex: 1 }]}>{row.interestLoanAmount || '-'}</Text>
        <Text style={[styles.tableCell, { flex: 0.5 }]}>{row?.paymentMode || '-'}</Text>
        <Text style={[styles.tableCell, { flex: 1 }]}>{row?.cashAmount || '-'}</Text>
        <Text style={[styles.tableCell, { flex: 1 }]}>{row?.bankAmount || '-'}</Text>
        <Text style={[styles.tableCell, { flex: 1 }]}>
          {row?.companyBankDetail?.account?.bankName || '-'}
        </Text>
        <Text style={[styles.tableCell, { flex: 1.8 ,textTransform:'lowercase' }]}>{`${row.issuedBy.firstName } ${row.issuedBy.middleName } ${row.issuedBy.lastName } `|| '-'}</Text>
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

  const renderTableFooter = () => (
    <View style={[styles.tableRow, { backgroundColor: '#E8F0FE' }]} wrap={false}>
      <Text style={[styles.tableCell, { flex: 0.3, fontWeight: 'bold', color: '#1a237e' }]}></Text>
      <Text style={[styles.tableCell, { flex: 2, fontWeight: 'bold', color: '#1a237e' }]}>
        TOTAL
      </Text>
      <Text style={[styles.tableCell, { flex: 4 }]}></Text>
      <Text style={[styles.tableCell, { flex: 1 }]}></Text>
      <Text style={[styles.tableCell, { flex: 0.4, fontWeight: 'bold', color: '#1a237e' }]}>
        {(int / loans.length).toFixed(2)}
      </Text>
      <Text style={[styles.tableCell, { flex: 0.6, fontWeight: 'bold', color: '#1a237e' }]}>
        {(conCharge / loans.length).toFixed(2)}
      </Text>
      <Text style={[styles.tableCell, { flex: 1 }]}></Text>
      <Text style={[styles.tableCell, { flex: 0.5,fontWeight: 'bold', color: '#1a237e' }]}>{totalWt.toFixed(0)}</Text>
      <Text style={[styles.tableCell, { flex: 0.5,fontWeight: 'bold', color: '#1a237e' }]}>{grossWt.toFixed(0)}</Text>
      <Text style={[styles.tableCell, { flex: 0.5,fontWeight: 'bold', color: '#1a237e' }]}>{netWt.toFixed(0)}</Text>
      <Text style={[styles.tableCell, { flex: 1, fontWeight: 'bold', color: '#1a237e' }]}>
        {loanAmt.toFixed(0)}
      </Text>
      <Text style={[styles.tableCell, { flex: 1 }]}></Text>
      <Text style={[styles.tableCell, { flex: 1, fontWeight: 'bold', color: '#1a237e' }]}>
        {(loanAmt - intLoanAmt).toFixed(0)}
      </Text>
      <Text style={[styles.tableCell, { flex: 1, fontWeight: 'bold', color: '#1a237e' }]}>
        {intLoanAmt.toFixed(0)}
      </Text>{' '}
      <Text style={[styles.tableCell, { flex: 0.5, fontWeight: 'bold', color: '#1a237e' }]}></Text>{' '}
      <Text style={[styles.tableCell, { flex: 1, fontWeight: 'bold', color: '#1a237e' }]}>{bankAmt.toFixed(0)}</Text>
      <Text style={[styles.tableCell, { flex: 1, fontWeight: 'bold', color: '#1a237e' }]}>{cashAmt.toFixed(0)}</Text>
      <Text style={[styles.tableCell, { flex: 1, fontWeight: 'bold', color: '#1a237e' }]}></Text>{' '}
      <Text style={[styles.tableCell, { flex: 1.8, fontWeight: 'bold', color: '#1a237e' }]}></Text>{' '}
    </View>
  );

  const firstPageRows = loans
    .slice(0, rowsPerPageFirst)
    .map((row, index) =>
      renderRow(row, index, index === rowsPerPageFirst - 1 && loans.length === rowsPerPageFirst)
    );

  pages.push(
    <Page key={0} size="A4" style={styles.page} orientation="landscape">
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
          marginTop: 10,
        }}
      >
        <Text style={styles.termsAndConditionsHeaders}>LOAN REPORT</Text>
      </View>
      <View style={{ flexGrow: 1, padding: '12px' }}>
        <View style={styles.table}>
          {renderTableHeader()}
          {firstPageRows}
          {loans.length <= rowsPerPageFirst && renderTableFooter()}
        </View>
      </View>
    </Page>
  );

  if (loans.length > rowsPerPageFirst) {
    for (let pageIndex = 0; pageIndex < additionalPages; pageIndex++) {
      const startIndex = rowsPerPageFirst + pageIndex * rowsPerPageOther;
      const endIndex = Math.min(startIndex + rowsPerPageOther, loans.length);
      const isLastPage = endIndex === loans.length;

      const pageRows = loans.slice(startIndex, endIndex).map((row, index) => {
        const actualIndex = startIndex + index;
        return renderRow(row, actualIndex, actualIndex === loans.length - 1);
      });

      pages.push(
        <Page key={pageIndex + 1} size="A4" style={styles.page} orientation="landscape">
          <View style={{ flexGrow: 1, padding: '12px' }}>
            <View style={styles.table}>
              {renderTableHeader()}
              {pageRows}
              {isLastPage && renderTableFooter()}
            </View>
          </View>
        </Page>
      );
    }
  }

  return <Document>{pages}</Document>;
}
