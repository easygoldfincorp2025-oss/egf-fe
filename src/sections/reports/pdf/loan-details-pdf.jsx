import React from 'react';
import { Document, Page, StyleSheet, Text, View } from '@react-pdf/renderer';
import { fDate } from '../../../utils/format-time.js';
import InvoiceHeader from '../../../components/invoise/invoice-header.jsx';

const useStyles = () =>
  StyleSheet.create({
    page: {
      fontFamily: 'Roboto',
      backgroundColor: '#FFFFFF',
      fontSize: 9,
    },
    subHeading: {
      fontWeight: 'bold',
      fontSize: 16,
      textAlign: 'center',
      marginVertical: 5,
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
      display: 'flex',
      minHeight: 22,
      borderBottomWidth: 0.5,
      borderBottomColor: '#c7c6c6',
      pageBreakInside: 'avoid',
    },
    tableHeader: {
      backgroundColor: '#5B9BD4',
      fontWeight: 'bold',
      color: '#000',
      textAlign: 'center',
      minHeight: 25,
    },
    tableCell: {
      flex: 1,
      padding: 5,
      borderRightWidth: 0.5,
      borderRightColor: '#b1b0b0',
      textAlign: 'center',
      fontSize: 8,
    },
    lastCell: {
      borderRightWidth: 0,
    },
    strippedRow: {
      backgroundColor: '#F2F2F2',
    },
    lastRow: {
      borderBottomWidth: 0,
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
      fontSize: 8,
      fontWeight: 'bold',
      color: '#1a237e',
    },
    totalLabel: {
      fontSize: 7,
      textAlign: 'center',
      color: '#666',
    },
  });

export default function LoanDetailsPdf({ selectedBranch, configs, data, filterData }) {
  const styles = useStyles();
  const { intDetails, partReleaseDetails, uchakPayDetails, partPaymentDetails, loanCloseDetails } =
    data;
  const dataFilter = [
    { value: filterData.branch?.name, label: 'Branch' },
    { value: fDate(filterData.startDate), label: 'Start Date' },
    { value: fDate(filterData.endDate), label: 'End Date' },
    { value: fDate(new Date()), label: 'Date' },
  ];

  const calculateAverage = (data, field) => {
    const validValues = data.filter((item) => {
      let value;
      if (field.includes('.')) {
        const [parent, child] = field.split('.');
        value = parseFloat(item[parent]?.[child]);
      } else {
        value = parseFloat(item[field]);
      }
      return !isNaN(value) && value !== null && value !== undefined;
    });

    if (validValues.length === 0) return 0;

    const sum = validValues.reduce((acc, item) => {
      let value;
      if (field.includes('.')) {
        const [parent, child] = field.split('.');
        value = parseFloat(item[parent]?.[child]) || 0;
      } else {
        value = parseFloat(item[field]) || 0;
      }
      return acc + value;
    }, 0);

    return (sum / validValues.length).toFixed(0);
  };

  const calculateInterestRateAverage = (data) => {
    const validValues = data.filter((item) => {
      const rate = item?.scheme?.interestRate || item.loan?.scheme?.interestRate;
      return !isNaN(rate) && rate !== null && rate !== undefined;
    });

    if (validValues.length === 0) return 0;

    const sum = validValues.reduce((acc, item) => {
      const rate = parseFloat(item?.scheme?.interestRate || item.loan?.scheme?.interestRate) || 0;
      return acc + (rate > 1.5 ? 1.5 : rate);
    }, 0);

    return (sum / validValues.length).toFixed(2);
  };

  const calculateConsultingChargeAverage = (data) => {
    const validValues = data.filter((item) => {
      const charge = item?.consultingCharge || item.loan?.consultingCharge;
      return !isNaN(charge) && charge !== null && charge !== undefined;
    });

    if (validValues.length === 0) return 0;

    const sum = validValues.reduce((acc, item) => {
      const charge = parseFloat(item?.consultingCharge || item.loan?.consultingCharge) || 0;
      return acc + charge;
    }, 0);

    return (sum / validValues.length).toFixed();
  };
  const cutoffDate = new Date('2024-04-01'); // Example if you use it in condition

  return (
    <Document>
      <Page size="A4" orientation="landscape" style={styles.page}>
        <InvoiceHeader branch={filterData.branch} configs={configs} landscape />
        <View style={{ position: 'absolute', top: 20, right: -30, width: 220 }}>
          {dataFilter.map((item, index) => (
            <View style={styles.row}>
              <Text style={styles.subHeading2}>{item.label || '-'}</Text>
              <Text style={styles.colon}>:</Text>
              <Text style={styles.subText}>{item.value || '-'}</Text>
            </View>
          ))}
        </View>
        <View style={{ padding: '10px' }}>
          <View
            style={{
              textAlign: 'center',
              fontSize: 18,
              marginTop: 10,
            }}
          >
            <Text
              style={{
                color: '#232C4B',
                fontWeight: 'bold',
                fontSize: '12px',
                textAlign: 'center',
                marginBottom: 6,
              }}
            >
              LOAN DETAIL REPORT
            </Text>
            <Text style={styles.termsAndConditionsHeaders}>LOAN INTEREST DETAILS</Text>
          </View>
          <View style={styles.table}>
            {/* ==== HEADER ==== */}
            <View style={[styles.tableRow, styles.tableHeader]}>
              <Text style={[styles.tableCell, { flex: 0.4 }]}>#</Text>
              <Text style={[styles.tableCell, { flex: 1 }]}>From date</Text>
              <Text style={[styles.tableCell, { flex: 1 }]}>To date</Text>
              <Text style={[styles.tableCell, { flex: 1 }]}>Loan amt</Text>
              <Text style={[styles.tableCell, { flex: 1 }]}>Interest rate</Text>
              <Text style={[styles.tableCell, { flex: 1 }]}>Consultant int.</Text>
              <Text style={[styles.tableCell, { flex: 1 }]}>Total int.</Text>
              <Text style={[styles.tableCell, { flex: 1 }]}>Penalty amt</Text>
              <Text style={[styles.tableCell, { flex: 1 }]}>CR/DR amt</Text>
              <Text style={[styles.tableCell, { flex: 1 }]}>Uchak amt</Text>
              <Text style={[styles.tableCell, { flex: 1 }]}>Entry date</Text>
              <Text style={[styles.tableCell, { flex: 0.6 }]}>Days</Text>
              <Text style={[styles.tableCell, { flex: 1.2 }]}>Pay after adjust</Text>
              <Text style={[styles.tableCell, { flex: 1.2, borderRightWidth: 0 }]}>
                Total pay amt
              </Text>
            </View>

            {/* ==== ROWS ==== */}
            {intDetails?.map((row, index) => {
              const issueDate = row.loan.issueDate;
              const scheme = row.loan.scheme;

              return (
                <View
                  style={[
                    styles.tableRow,
                    index % 2 !== 0 && styles.strippedRow,
                    index === intDetails.length - 1 && styles.lastRow,
                  ]}
                  key={index}
                >
                  <Text style={[styles.tableCell, { flex: 0.4 }]}>{index + 1}</Text>
                  <Text style={[styles.tableCell, { flex: 1 }]}>{fDate(row.from)}</Text>
                  <Text style={[styles.tableCell, { flex: 1 }]}>{fDate(row.to)}</Text>
                  <Text style={[styles.tableCell, { flex: 1 }]}>{row.loan.loanAmount}</Text>
                  <Text style={[styles.tableCell, { flex: 1 }]}>
                    {new Date(issueDate) < cutoffDate
                      ? Number(scheme?.interestRate > 1.5 ? 1.5 : scheme?.interestRate).toFixed(2)
                      : 1}
                  </Text>
                  <Text style={[styles.tableCell, { flex: 1 }]}>{row.loan.consultingCharge}</Text>
                  <Text style={[styles.tableCell, { flex: 1 }]}>
                    {Number(row.interestAmount + row.consultingCharge).toFixed(2)}
                  </Text>
                  <Text style={[styles.tableCell, { flex: 1 }]}>{row.penalty}</Text>
                  <Text style={[styles.tableCell, { flex: 1 }]}>{row.old_cr_dr?.toFixed(2)}</Text>
                  <Text style={[styles.tableCell, { flex: 1 }]}>
                    {row.uchakInterestAmount || 0}
                  </Text>
                  <Text style={[styles.tableCell, { flex: 1 }]}>{fDate(row.createdAt)}</Text>
                  <Text style={[styles.tableCell, { flex: 0.6 }]}>{row.days.toFixed(0)}</Text>
                  <Text style={[styles.tableCell, { flex: 1.2 }]}>
                    {Number(row.interestAmount + row.consultingCharge + row.old_cr_dr).toFixed(2)}
                  </Text>
                  <Text style={[styles.tableCell, { flex: 1.2, borderRightWidth: 0 }]}>
                    {row.amountPaid}
                  </Text>
                </View>
              );
            })}

            {/* ==== TOTAL ROW ==== */}
            <View style={[styles.tableRow, styles.totalRow]}>
              <Text style={[styles.tableCell, { flex: 0.4 }]}></Text>
              <Text style={[styles.tableCell, { flex: 1 }]}>TOTAL</Text>
              <Text style={[styles.tableCell, { flex: 1 }]}></Text>
              <Text style={[styles.tableCell, { flex: 1 }]}></Text>
              <Text style={[styles.tableCell, { flex: 1 }]}>
                {intDetails
                  .reduce(
                    (prev, next) =>
                      prev +
                      (Number(
                        new Date(next.issueDate) < cutoffDate
                          ? Number(
                              next.scheme?.interestRate > 1.5 ? 1.5 : next.scheme?.interestRate
                            ).toFixed(2)
                          : 1
                      ) || 0) /
                        intDetails.length,
                    0
                  )
                  .toFixed(0)}
              </Text>
              <Text style={[styles.tableCell, { flex: 1 }]}>
                {(
                  intDetails.reduce(
                    (prev, next) => prev + (Number(next?.loan?.consultingCharge) || 0),
                    0
                  ) / intDetails?.length
                ).toFixed(2)}
              </Text>
              <Text style={[styles.tableCell, { flex: 1 }]}>
                {intDetails
                  .reduce(
                    (prev, next) =>
                      prev +
                      (Number(next?.interestAmount) || 0) +
                      (Number(next?.consultingCharge) || 0),
                    0
                  )
                  .toFixed(0)}
              </Text>
              <Text style={[styles.tableCell, { flex: 1 }]}>
                {intDetails
                  ?.reduce((sum, item) => sum + (parseFloat(item.penalty) || 0), 0)
                  .toFixed(0)}
              </Text>
              <Text style={[styles.tableCell, { flex: 1 }]}>
                {intDetails
                  .reduce((prev, next) => prev + (Number(next?.old_cr_dr) || 0), 0)
                  .toFixed(0)}
              </Text>
              <Text style={[styles.tableCell, { flex: 1 }]}>
                {intDetails.reduce(
                  (prev, next) => prev + (Number(next?.uchakInterestAmount) || 0),
                  0
                )}
              </Text>
              <Text style={[styles.tableCell, { flex: 1 }]}></Text>
              <Text style={[styles.tableCell, { flex: 0.6 }]}>
                {intDetails.reduce((prev, next) => prev + (Number(next?.days) || 0), 0) /
                  intDetails.length}
              </Text>
              <Text style={[styles.tableCell, { flex: 1.2 }]}>
                {intDetails
                  .reduce(
                    (prev, next) =>
                      prev +
                      (Number(next?.interestAmount) || 0) +
                      (Number(next?.consultingCharge) || 0) +
                      (Number(next?.old_cr_dr) || 0),
                    0
                  )
                  .toFixed(0)}
              </Text>
              <Text
                style={[
                  styles.tableCell,
                  {
                    flex: 1.2,
                    borderRightWidth: 0,
                  },
                ]}
              >
                {intDetails.reduce((prev, next) => prev + (Number(next?.amountPaid) || 0), 0)}
              </Text>
            </View>
          </View>
        </View>
      </Page>
      <Page size="A4" orientation="landscape" style={styles.page}>
        <View style={{ padding: '10px' }}>
          <View
            style={{
              textAlign: 'center',
              fontSize: 18,
              marginTop: 10,
            }}
          >
            <Text style={styles.termsAndConditionsHeaders}>LOAN PART RELEASE DETAILS</Text>
          </View>
          <View style={styles.table}>
            {/* Table Header */}
            <View style={[styles.tableRow, styles.tableHeader]}>
              <Text style={[styles.tableCell, { flex: 0.3 }]}>#</Text>
              <Text style={[styles.tableCell, { flex: 1.5 }]}>Loan no.</Text>
              <Text style={[styles.tableCell, { flex: 1.5 }]}>Loan amount</Text>
              <Text style={[styles.tableCell, { flex: 1.5 }]}>Int. loan amount</Text>
              <Text style={[styles.tableCell, { flex: 1.5 }]}>Pay amount</Text>
              <Text style={[styles.tableCell, { flex: 1.5 }]}>Pending amount</Text>
              <Text style={[styles.tableCell, { flex: 0.8 }]}>Pay date</Text>
              <Text style={[styles.tableCell, { flex: 0.8 }]}>Entry date</Text>
              <Text style={[styles.tableCell, { flex: 3 }]}>Remarks</Text>
              <Text style={[styles.tableCell, { flex: 1.5, borderRightWidth: 0 }]}>Entry by</Text>
            </View>

            {/* Table Rows */}
            {partReleaseDetails?.map((item, index) => (
              <View
                key={index}
                style={[
                  styles.tableRow,
                  index % 2 !== 0 && styles.strippedRow,
                  index === partReleaseDetails.length - 1 && styles.lastRow,
                ]}
              >
                <Text style={[styles.tableCell, { flex: 0.3 }]}>{index + 1}</Text>
                <Text style={[styles.tableCell, { flex: 1.5 }]}>{item.loan?.loanNo}</Text>
                <Text style={[styles.tableCell, { flex: 1.5 }]}>{item.loan?.loanAmount}</Text>
                <Text style={[styles.tableCell, { flex: 1.5 }]}>
                  {Number(item.interestLoanAmount).toFixed(2)}
                </Text>
                <Text style={[styles.tableCell, { flex: 1.5 }]}>{item.adjustedAmount}</Text>
                <Text style={[styles.tableCell, { flex: 1.5 }]}>{item.pendingLoanAmount}</Text>
                <Text style={[styles.tableCell, { flex: 0.8 }]}>{fDate(item.date)}</Text>
                <Text style={[styles.tableCell, { flex: 0.8 }]}>{fDate(item.createdAt)}</Text>
                <Text style={[styles.tableCell, { flex: 3 }]}>{item.remarks || '-'}</Text>
                <Text style={[styles.tableCell, { flex: 1.5, borderRightWidth: 0 }]}>
                  {item.entryBy || '-'}
                </Text>
              </View>
            ))}

            {/* Table Total Row */}
            <View style={[styles.tableRow, styles.totalRow]}>
              <Text style={[styles.tableCell, { flex: 0.3 }]}></Text>
              <Text style={[styles.tableCell, { flex: 1.5 }]}>TOTAL</Text>
              <Text style={[styles.tableCell, { flex: 1.5 }]}></Text>
              <Text style={[styles.tableCell, { flex: 1.5 }]}>
                {partReleaseDetails
                  ?.reduce((sum, item) => sum + (parseFloat(item.interestLoanAmount) || 0), 0)
                  .toFixed(0)}
              </Text>
              <Text style={[styles.tableCell, { flex: 1.5 }]}>
                {partReleaseDetails
                  ?.reduce((sum, item) => sum + (parseFloat(item.adjustedAmount) || 0), 0)
                  .toFixed(0)}
              </Text>
              <Text style={[styles.tableCell, { flex: 1.5 }]}>
                {partReleaseDetails
                  ?.reduce((sum, item) => sum + (parseFloat(item.pendingLoanAmount) || 0), 0)
                  .toFixed(0)}
              </Text>
              <Text style={[styles.tableCell, { flex: 0.8 }]}></Text>
              <Text style={[styles.tableCell, { flex: 0.8 }]}></Text>
              <Text style={[styles.tableCell, { flex: 3 }]}></Text>
              <Text style={[styles.tableCell, { flex: 1.5, borderRightWidth: 0 }]}></Text>
            </View>
          </View>
        </View>
      </Page>
      <Page size="A4" orientation="landscape" style={styles.page}>
        <View style={{ padding: '10px' }}>
          <View
            style={{
              textAlign: 'center',
              fontSize: 18,
              marginTop: 10,
            }}
          >
            <Text style={styles.termsAndConditionsHeaders}>LOAN UCHAK PAY DETAILS</Text>
          </View>
          <View style={styles.table}>
            <View style={[styles.tableRow, styles.tableHeader]}>
              <Text style={[styles.tableCell, { flex: 0.1 }]}>#</Text>
              <Text style={[styles.tableCell, { flex: 2 }]}>Uchak Pay Date</Text>
              <Text style={[styles.tableCell, { flex: 2 }]}>Uchak Int Amt</Text>
              <Text style={[styles.tableCell, { flex: 2, borderRightWidth: 0 }]}>Remarks</Text>
            </View>
            {uchakPayDetails?.map((item, index) => (
              <View
                style={[
                  styles.tableRow,
                  index % 2 !== 0 && styles.strippedRow,
                  index === uchakPayDetails.length - 1 && styles.lastRow,
                ]}
                key={index}
              >
                <Text style={[styles.tableCell, { flex: 0.1 }]}>{index + 1}</Text>
                <Text style={[styles.tableCell, { flex: 2 }]}>{fDate(item.date) || '-'}</Text>
                <Text style={[styles.tableCell, { flex: 2 }]}>{item.amountPaid}</Text>
                <Text style={[styles.tableCell, { flex: 2, borderRightWidth: 0 }]}>
                  {item.remark || '-'}
                </Text>
              </View>
            ))}
            <View style={[styles.tableRow, styles.totalRow]}>
              <Text style={[styles.tableCell, { flex: 0.1 }]}></Text>
              <Text style={[styles.tableCell, { flex: 2 }]}>TOTAL</Text>
              <Text style={[styles.tableCell, { flex: 2 }]}>
                {uchakPayDetails
                  ?.reduce((sum, item) => sum + (parseFloat(item.amountPaid) || 0), 0)
                  .toFixed(0)}
              </Text>
              <Text style={[styles.tableCell, { flex: 2, borderRightWidth: 0 }]}></Text>
            </View>
          </View>
        </View>
      </Page>
      <Page size="A4" orientation="landscape" style={styles.page}>
        <View style={{ padding: '10px' }}>
          <View
            style={{
              textAlign: 'center',
              fontSize: 18,
              marginTop: 10,
            }}
          >
            <Text style={styles.termsAndConditionsHeaders}>LOAN PART PAYMENT DETAILS</Text>
          </View>
          <View style={styles.table}>
            <View style={[styles.tableRow, styles.tableHeader]}>
              <Text style={[styles.tableCell, { flex: 0.1 }]}>#</Text>
              <Text style={[styles.tableCell, { flex: 2.5 }]}>Loan no</Text>
              <Text style={[styles.tableCell, { flex: 1.5 }]}>Loan Amount</Text>
              <Text style={[styles.tableCell, { flex: 1.5 }]}>Int. Loan amt</Text>
              <Text style={[styles.tableCell, { flex: 1.5 }]}>Pay Amount</Text>
              <Text style={[styles.tableCell, { flex: 1.5 }]}>Int Loan Amt</Text>
              <Text style={[styles.tableCell, { flex: 1.5 }]}>Pay Date</Text>
              <Text style={[styles.tableCell, { flex: 1.5 }]}>Entry Date</Text>
              <Text style={[styles.tableCell, { flex: 1.5 }]}>Remarks</Text>
              <Text style={[styles.tableCell, { flex: 1.5, borderRightWidth: 0 }]}>Entry By</Text>
            </View>
            {partPaymentDetails?.map((item, index) => (
              <View
                style={[
                  styles.tableRow,
                  index % 2 !== 0 && styles.strippedRow,
                  index === partPaymentDetails.length - 1 && styles.lastRow,
                ]}
                key={index}
              >
                <Text style={[styles.tableCell, { flex: 0.1 }]}>{index + 1}</Text>
                <Text style={[styles.tableCell, { flex: 2.5 }]}>{item.loan.loanNo}</Text>
                <Text style={[styles.tableCell, { flex: 1.5 }]}>{item.loan.loanAmount}</Text>
                <Text style={[styles.tableCell, { flex: 1.5 }]}>
                  {item.interestLoanAmount.toFixed(2)}
                </Text>
                <Text style={[styles.tableCell, { flex: 1.5 }]}>{item.amountPaid}</Text>
                <Text style={[styles.tableCell, { flex: 1.5 }]}>
                  {(item.interestLoanAmount - item.amountPaid).toFixed(2)}
                </Text>
                <Text style={[styles.tableCell, { flex: 1.5 }]}>{fDate(item.date || '-')}</Text>
                <Text style={[styles.tableCell, { flex: 1.5 }]}>{fDate(item.createdAt)}</Text>
                <Text style={[styles.tableCell, { flex: 1.5 }]}>{item.remarks || '-'}</Text>
                <Text style={[styles.tableCell, { flex: 1.5, borderRightWidth: 0 }]}>
                  {item.entryBy}
                </Text>
              </View>
            ))}
            <View style={[styles.tableRow, styles.totalRow]}>
              <Text style={[styles.tableCell, { flex: 0.1 }]}></Text>
              <Text style={[styles.tableCell, { flex: 2.5 }]}>TOTAL</Text>
              <Text style={[styles.tableCell, { flex: 1.5 }]}>
                {partPaymentDetails
                  ?.reduce((sum, item) => sum + (parseFloat(item.loan.loanAmount) || 0), 0)
                  .toFixed(0)}
              </Text>
              <Text style={[styles.tableCell, { flex: 1.5 }]}>
                {partPaymentDetails
                  ?.reduce((sum, item) => sum + (parseFloat(item.interestLoanAmount) || 0), 0)
                  .toFixed(0)}
              </Text>
              <Text style={[styles.tableCell, { flex: 1.5 }]}>
                {partPaymentDetails
                  ?.reduce((sum, item) => sum + (parseFloat(item.amountPaid) || 0), 0)
                  .toFixed(0)}
              </Text>
              <Text style={[styles.tableCell, { flex: 1.5 }]}>
                {partPaymentDetails
                  ?.reduce(
                    (sum, item) =>
                      sum + (parseFloat(item.interestLoanAmount - item.amountPaid) || 0),
                    0
                  )
                  .toFixed(0)}
              </Text>
              <Text style={[styles.tableCell, { flex: 1.5 }]}></Text>
              <Text style={[styles.tableCell, { flex: 1.5 }]}></Text>
              <Text style={[styles.tableCell, { flex: 1.5 }]}></Text>
              <Text style={[styles.tableCell, { flex: 1.5, borderRightWidth: 0 }]}></Text>
            </View>
          </View>
        </View>
      </Page>
      <Page size="A4" orientation="landscape" style={styles.page}>
        <View style={{ padding: '10px' }}>
          <View
            style={{
              textAlign: 'center',
              fontSize: 18,
              marginTop: 10,
            }}
          >
            <Text style={styles.termsAndConditionsHeaders}>LOAN CLOSE DETAILS</Text>
          </View>
          <View style={styles.table}>
            <View style={[styles.tableRow, styles.tableHeader]}>
              <Text style={[styles.tableCell, { flex: 0.1 }]}>#</Text>
              <Text style={[styles.tableCell, { flex: 2.5 }]}>Loan No</Text>
              <Text style={[styles.tableCell, { flex: 1.5 }]}>Total Loan Amt</Text>
              <Text style={[styles.tableCell, { flex: 1.5 }]}>Int. Loan Amt</Text>
              <Text style={[styles.tableCell, { flex: 1.5 }]}>Paid Loan Amt</Text>
              <Text style={[styles.tableCell, { flex: 1.5 }]}>Pay Date</Text>
              <Text style={[styles.tableCell, { flex: 1.5 }]}>Pending Loan Amt</Text>
              <Text style={[styles.tableCell, { flex: 1.5 }]}>Closing Charge</Text>
              <Text style={[styles.tableCell, { flex: 1.5 }]}>Net Amt</Text>
              <Text style={[styles.tableCell, { flex: 1.5 }]}>Entry Date</Text>
              <Text style={[styles.tableCell, { flex: 1.5, borderRightWidth: 0 }]}>Entry By</Text>
            </View>
            {loanCloseDetails?.map((item, index) => (
              <View
                style={[
                  styles.tableRow,
                  index % 2 !== 0 && styles.strippedRow,
                  index === loanCloseDetails.length - 1 && styles.lastRow,
                ]}
                key={index}
              >
                <Text style={[styles.tableCell, { flex: 0.1 }]}>{index + 1}</Text>
                <Text style={[styles.tableCell, { flex: 2.5 }]}>{item.loan.loanNo}</Text>
                <Text style={[styles.tableCell, { flex: 1.5 }]}>{item.totalLoanAmount}</Text>
                <Text style={[styles.tableCell, { flex: 1.5 }]}>
                  {item.loan.interestLoanAmount}
                </Text>
                <Text style={[styles.tableCell, { flex: 1.5 }]}>
                  {(item.netAmount - item.closingCharge || 0).toFixed(2)}
                </Text>
                <Text style={[styles.tableCell, { flex: 1.5 }]}>{fDate(item.date)}</Text>
                <Text style={[styles.tableCell, { flex: 1.5 }]}>
                  {(item.totalLoanAmount - item.netAmount || 0).toFixed(2)}
                </Text>
                <Text style={[styles.tableCell, { flex: 1.5 }]}>{item.closingCharge || 0}</Text>
                <Text style={[styles.tableCell, { flex: 1.5 }]}>
                  {item.netAmount.toFixed(0) || '-'}
                </Text>
                <Text style={[styles.tableCell, { flex: 1.5 }]}>{fDate(item.createdAt) || 0}</Text>
                <Text style={[styles.tableCell, { flex: 1.5, borderRightWidth: 0 }]}>
                  {item.entryBy || 0}
                </Text>
              </View>
            ))}
            <View style={[styles.tableRow, styles.totalRow]}>
              <Text style={[styles.tableCell, { flex: 0.1 }]}></Text>
              <Text style={[styles.tableCell, { flex: 2.5 }]}>TOTAL</Text>
              <Text style={[styles.tableCell, { flex: 1.5 }]}>
                {loanCloseDetails
                  ?.reduce((sum, item) => sum + (parseFloat(item.totalLoanAmount) || 0), 0)
                  .toFixed(0)}
              </Text>
              <Text style={[styles.tableCell, { flex: 1.5 }]}>
                {loanCloseDetails
                  ?.reduce((sum, item) => sum + (parseFloat(item.loan.interestLoanAmount) || 0), 0)
                  .toFixed(0)}
              </Text>
              <Text style={[styles.tableCell, { flex: 1.5 }]}>
                {loanCloseDetails
                  ?.reduce(
                    (sum, item) => sum + (parseFloat(item.netAmount - item.closingCharge) || 0),
                    0
                  )
                  .toFixed(0)}
              </Text>
              <Text style={[styles.tableCell, { flex: 1.5 }]}></Text>
              <Text style={[styles.tableCell, { flex: 1.5 }]}>
                {loanCloseDetails
                  ?.reduce(
                    (sum, item) => sum + (parseFloat(item.totalLoanAmount - item.netAmount) || 0),
                    0
                  )
                  .toFixed(0)}
              </Text>
              <Text style={[styles.tableCell, { flex: 1.5 }]}>
                {loanCloseDetails
                  ?.reduce((sum, item) => sum + (parseFloat(item.closingCharge) || 0), 0)
                  .toFixed(0)}
              </Text>
              <Text style={[styles.tableCell, { flex: 1.5 }]}>
                {loanCloseDetails
                  ?.reduce((sum, item) => sum + (parseFloat(item.netAmount) || 0), 0)
                  .toFixed(0)}
              </Text>
              <Text style={[styles.tableCell, { flex: 1.5 }]}></Text>
              <Text style={[styles.tableCell, { flex: 1.5, borderRightWidth: 0 }]}></Text>
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
}
