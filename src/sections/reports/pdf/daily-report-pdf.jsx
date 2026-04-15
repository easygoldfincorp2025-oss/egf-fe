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
      fontSize: 6.5,
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
    },
    totalCell: {
      padding: 5,
      borderRightWidth: 0.5,
      borderRightColor: '#b1b0b0',
      textAlign: 'center',
      fontSize: 7,
      fontWeight: 'bold',
      color: '#1a237e',
    },
    totalLabel: {
      fontSize: 7,
      textAlign: 'center',
      color: '#666',
    },
  });

export default function DailyReportPdf({ selectedBranch, configs, data, filterData }) {
  const styles = useStyles();
  const {
    loanDetails,
    loanIntDetails,
    partReleaseDetails,
    uchakIntDetails,
    partPaymentDetails,
    closedLoans,
  } = data;
  const dataFilter = [
    { value: filterData.branch.name, label: 'Branch' },
    { value: fDate(filterData.date), label: 'Report Date' },
    { value: fDate(new Date()), label: 'Date' },
  ];
  const cutoffDate = new Date('2025-08-01');

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
      return (
        acc +
        (new Date(item?.loan?.issueDate) < cutoffDate
          ? Number(
              item?.loan?.scheme?.interestRate > 1.5 ? 1.5 : item.loan?.scheme?.interestRate
            ).toFixed(2)
          : 1)
      );
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
          {loanDetails && (
            <>
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
                  DAILY REPORT
                </Text>
                <Text style={styles.termsAndConditionsHeaders}>NEW GOLD LOAN DETAILS</Text>
              </View>{' '}
              <View style={styles.table}>
                <View style={[styles.tableRow, styles.tableHeader]}>
                  <Text style={[styles.tableCell, { flex: 0.2 }]}>#</Text>
                  <Text style={[styles.tableCell, { flex: 2 }]}>Loan No</Text>
                  <Text style={[styles.tableCell, { flex: 4 }]}>Customer Name</Text>
                  <Text style={[styles.tableCell, { flex: 0.8 }]}>Loan Amt</Text>
                  <Text style={[styles.tableCell, { flex: 0.5 }]}>Pay By</Text>
                  <Text style={[styles.tableCell, { flex: 1 }]}>Cash Amt</Text>
                  <Text style={[styles.tableCell, { flex: 1 }]}>Bank Amt</Text>
                  <Text style={[styles.tableCell, { flex: 0.8 }]}>Bank Name</Text>
                  <Text style={[styles.tableCell, { flex: 0.4 }]}>Int. (%)</Text>
                  <Text style={[styles.tableCell, { flex: 0.4 }]}>Con. (%)</Text>
                  <Text style={[styles.tableCell, { flex: 1 }]}>Approval Charge</Text>
                  <Text style={[styles.tableCell, { flex: 0.5 }]}>Pay By</Text>
                  <Text style={[styles.tableCell, { flex: 1 }]}>Cash Amt</Text>
                  <Text style={[styles.tableCell, { flex: 1 }]}>Bank Amt</Text>
                  <Text style={[styles.tableCell, { flex: 0.8 }]}>Bank Name</Text>
                  <Text style={[styles.tableCell, { flex: 1 }]}>Issue Date</Text>
                  <Text style={[styles.tableCell, { flex: 3.2, borderRightWidth: 0 }]}>
                    Entry by
                  </Text>
                </View>
                {loanDetails.map((item, index) => (
                  <View
                    style={[
                      styles.tableRow,
                      index % 2 !== 0 && styles.strippedRow,
                      index === loanDetails.length - 1 && styles.lastRow,
                      { fontSize: 5 },
                    ]}
                    key={index}
                  >
                    <Text style={[styles.tableCell, { flex: 0.2 }]}>{index + 1}</Text>
                    <Text style={[styles.tableCell, { flex: 2 }]}>{item.loanNo}</Text>
                    <Text style={[styles.tableCell, { flex: 4 }]}>
                      {`${item?.customer?.firstName} ${item?.customer?.middleName} ${item?.customer?.lastName}`}
                    </Text>
                    <Text style={[styles.tableCell, { flex: 0.8 }]}>{item.loanAmount}</Text>
                    <Text style={[styles.tableCell, { flex: 0.5 }]}>{item.paymentMode}</Text>{' '}
                    <Text style={[styles.tableCell, { flex: 1 }]}>{item.cashAmount}</Text>{' '}
                    <Text style={[styles.tableCell, { flex: 1 }]}>{item.bankAmount}</Text>{' '}
                    <Text style={[styles.tableCell, { flex: 0.8, fontSize: 6 }]}>
                      {item?.companyBankDetail?.account?.bankName || '-'}
                    </Text>
                    <Text style={[styles.tableCell, { flex: 0.4 }]}>
                      {new Date(item?.loan?.issueDate) < cutoffDate
                        ? Number(
                            item?.loan?.scheme?.interestRate > 1.5
                              ? 1.5
                              : item?.loan?.scheme?.interestRate
                          ).toFixed(2)
                        : 1}
                    </Text>{' '}
                    <Text style={[styles.tableCell, { flex: 0.4 }]}>{item.consultingCharge}</Text>
                    <Text style={[styles.tableCell, { flex: 1 }]}>{item.approvalCharge}</Text>
                    <Text style={[styles.tableCell, { flex: 0.5 }]}>
                      {item.chargePaymentDetail.paymentMode || '-'}
                    </Text>{' '}
                    <Text style={[styles.tableCell, { flex: 1 }]}>
                      {item.chargePaymentDetail.cashAmount || 0}
                    </Text>{' '}
                    <Text style={[styles.tableCell, { flex: 1 }]}>
                      {item.chargePaymentDetail.bankAmount || 0}
                    </Text>{' '}
                    <Text style={[styles.tableCell, { flex: 0.8, fontSize: 6 }]}>
                      {item?.companyBankDetail?.account?.bankName || '-'}
                    </Text>
                    <Text style={[styles.tableCell, { flex: 1 }]}>{fDate(item.issueDate)}</Text>
                    <Text style={[styles.tableCell, { flex: 3.2, borderRightWidth: 0 }]}>
                      {`${item.issuedBy.firstName} ${item.issuedBy.middleName} ${item.issuedBy.lastName}`.toUpperCase()}
                    </Text>
                  </View>
                ))}
                <View style={[styles.tableRow, styles.totalRow]}>
                  <Text style={[styles.totalCell, { flex: 0.2 }]}></Text>
                  <Text style={[styles.totalCell, { flex: 2 }]}>TOTAL</Text>
                  <Text style={[styles.totalCell, { flex: 4 }]}></Text>
                  <Text style={[styles.totalCell, { flex: 0.8 }]}>
                    {loanDetails
                      .reduce((sum, item) => sum + (parseFloat(item.loanAmount) || 0), 0)
                      .toFixed(0)}
                  </Text>
                  <Text style={[styles.totalCell, { flex: 0.5 }]}></Text>
                  <Text style={[styles.tableCell, { flex: 1 }]}>
                    {closedLoans
                      .reduce((sum, item) => sum + (parseFloat(item.cashAmount) || 0), 0)
                      .toFixed(0)}
                  </Text>
                  <Text style={[styles.tableCell, { flex: 1 }]}>
                    {closedLoans
                      .reduce((sum, item) => sum + (parseFloat(item.bankAmount) || 0), 0)
                      .toFixed(0)}
                  </Text>
                  <Text style={[styles.totalCell, { flex: 0.8 }]}></Text>
                  <Text style={[styles.totalCell, { flex: 0.4 }]}>
                    {calculateInterestRateAverage(loanDetails)}
                  </Text>
                  <Text style={[styles.totalCell, { flex: 0.4 }]}>
                    {calculateConsultingChargeAverage(loanDetails)}
                  </Text>
                  <Text style={[styles.totalCell, { flex: 1 }]}></Text>
                  <Text style={[styles.totalCell, { flex: 0.5 }]}></Text>
                  <Text style={[styles.tableCell, { flex: 1 }]}>
                    {closedLoans
                      .reduce(
                        (sum, item) => sum + (parseFloat(item.chargePaymentDetail.cashAmount) || 0),
                        0
                      )
                      .toFixed(0)}
                  </Text>
                  <Text style={[styles.tableCell, { flex: 1 }]}>
                    {closedLoans
                      .reduce(
                        (sum, item) => sum + (parseFloat(item.chargePaymentDetail.bankAmount) || 0),
                        0
                      )
                      .toFixed(0)}
                  </Text>
                  <Text style={[styles.totalCell, { flex: 0.8 }]}></Text>
                  <Text style={[styles.totalCell, { flex: 1 }]}></Text>
                  <Text style={[styles.totalCell, { flex: 3.2, borderRightWidth: 0 }]}></Text>
                </View>
              </View>
            </>
          )}
        </View>
      </Page>
      {loanIntDetails && loanIntDetails.length > 0 && (
        <Page size="A4" orientation="landscape" style={styles.page}>
          <View style={{ padding: '10px' }}>
            <View
              style={{
                textAlign: 'center',
                fontSize: 18,
                marginTop: 10,
              }}
            >
              <Text style={styles.termsAndConditionsHeaders}>GOLD LOAN INTEREST DETAILS</Text>
            </View>
            <View style={styles.table}>
              <View style={[styles.tableRow, styles.tableHeader]}>
                <Text style={[styles.tableCell, { flex: 0.3 }]}>#</Text>
                <Text style={[styles.tableCell, { flex: 2.7 }]}>Loan No</Text>
                <Text style={[styles.tableCell, { flex: 5 }]}>Customer Name</Text>
                <Text style={[styles.tableCell, { flex: 1 }]}>Loan Amt</Text>
                <Text style={[styles.tableCell, { flex: 0.5 }]}>Int. (%)</Text>
                <Text style={[styles.tableCell, { flex: 0.5 }]}>Con. (%)</Text>
                <Text style={[styles.tableCell, { flex: 1 }]}>Issue Date</Text>
                <Text style={[styles.tableCell, { flex: 1.3 }]}>Loan int. amt</Text>
                <Text style={[styles.tableCell, { flex: 1 }]}>From date</Text>
                <Text style={[styles.tableCell, { flex: 1 }]}>To date</Text>
                <Text style={[styles.tableCell, { flex: 0.4 }]}>Days</Text>
                <Text style={[styles.tableCell, { flex: 0.8 }]}>Pay by</Text>
                <Text style={[styles.tableCell, { flex: 1 }]}>Cash Amt</Text>
                <Text style={[styles.tableCell, { flex: 1 }]}>Bank Amt</Text>
                <Text style={[styles.tableCell, { flex: 0.8 }]}>Bank Name</Text>
                <Text style={[styles.tableCell, { flex: 0.8 }]}>Int</Text>
                <Text style={[styles.tableCell, { flex: 0.8 }]}>penalty</Text>
                <Text style={[styles.tableCell, { flex: 1, borderRightWidth: 0 }]}>Total Pay</Text>
              </View>
              {loanIntDetails.map((item, index) => (
                <View
                  style={[
                    styles.tableRow,
                    index % 2 !== 0 && styles.strippedRow,
                    index === loanIntDetails.length - 1 && styles.lastRow,
                  ]}
                  key={index}
                >
                  <Text style={[styles.tableCell, { flex: 0.3 }]}>{index + 1}</Text>
                  <Text style={[styles.tableCell, { flex: 2.7 }]}>{item.loan.loanNo}</Text>
                  <Text style={[styles.tableCell, { flex: 5 }]}>
                    {`${item.loan.customer.firstName} ${item.loan.customer.middleName} ${item.loan.customer.lastName}`}
                  </Text>
                  <Text style={[styles.tableCell, { flex: 1 }]}>{item.loan.loanAmount}</Text>
                  <Text style={[styles.tableCell, { flex: 0.5 }]}>
                    {new Date(item?.loan?.issueDate) < cutoffDate ? Number(item?.loan?.scheme?.interestRate > 1.5 ? 1.5 : item?.loan?.scheme?.interestRate).toFixed(2) : 1}
                  </Text>
                  <Text style={[styles.tableCell, { flex: 0.5 }]}>
                    {item.loan.consultingCharge}
                  </Text>
                  <Text style={[styles.tableCell, { flex: 1 }]}>{fDate(item.loan.issueDate)}</Text>
                  <Text style={[styles.tableCell, { flex: 1.3 }]}>
                    {item.loan.interestLoanAmount}
                  </Text>
                  <Text style={[styles.tableCell, { flex: 1 }]}>{fDate(item.from)}</Text>
                  <Text style={[styles.tableCell, { flex: 1 }]}>{fDate(item.to)}</Text>
                  <Text style={[styles.tableCell, { flex: 0.4 }]}>{item.days}</Text>
                  <Text style={[styles.tableCell, { flex: 0.8 }]}>
                    {item?.paymentDetail?.paymentMode}
                  </Text>{' '}
                  <Text style={[styles.tableCell, { flex: 1 }]}>
                    {item?.paymentDetail?.cashAmount || 0}
                  </Text>{' '}
                  <Text style={[styles.tableCell, { flex: 1 }]}>
                    {item?.paymentDetail?.bankAmount || 0}
                  </Text>{' '}
                  <Text style={[styles.tableCell, { flex: 0.8 }]}>
                    {item?.paymentDetail?.account?.bankName}
                  </Text>
                  <Text style={[styles.tableCell, { flex: 0.8 }]}>{item?.interestAmount}</Text>
                  <Text style={[styles.tableCell, { flex: 0.8 }]}>{item.penalty}</Text>
                  <Text style={[styles.tableCell, { flex: 1, borderRightWidth: 0 }]}>
                    {item.amountPaid}
                  </Text>
                </View>
              ))}
              <View style={[styles.tableRow, styles.totalRow]}>
                <Text style={[styles.totalCell, { flex: 0.3 }]}></Text>
                <Text style={[styles.totalCell, { flex: 2.7 }]}>TOTAL</Text>
                <Text style={[styles.totalCell, { flex: 5 }]}></Text>
                <Text style={[styles.totalCell, { flex: 1 }]}>
                  {loanIntDetails
                    .reduce((sum, item) => sum + (parseFloat(item.loan.loanAmount) || 0), 0)
                    .toFixed(0)}
                </Text>
                <Text style={[styles.totalCell, { flex: 0.5 }]}>
                  {calculateInterestRateAverage(loanIntDetails)}
                </Text>
                <Text style={[styles.totalCell, { flex: 0.5 }]}>
                  {calculateConsultingChargeAverage(loanIntDetails)}
                </Text>
                <Text style={[styles.totalCell, { flex: 1 }]}></Text>
                <Text style={[styles.totalCell, { flex: 1.3 }]}>
                  {loanIntDetails
                    .reduce((sum, item) => sum + (parseFloat(item.loan.interestLoanAmount) || 0), 0)
                    .toFixed(0)}
                </Text>
                <Text style={[styles.totalCell, { flex: 1 }]}></Text>
                <Text style={[styles.totalCell, { flex: 1 }]}></Text>
                <Text style={[styles.totalCell, { flex: 0.4 }]}>
                  {calculateAverage(loanIntDetails, 'days')}
                </Text>
                <Text style={[styles.totalCell, { flex: 0.8 }]}></Text>
                <Text style={[styles.totalCell, { flex: 1 }]}>
                  {loanIntDetails
                    .reduce(
                      (sum, item) => sum + (parseFloat(item.paymentDetail?.cashAmount) || 0),
                      0
                    )
                    .toFixed(0)}
                </Text>
                <Text style={[styles.totalCell, { flex: 1 }]}>
                  {' '}
                  {loanIntDetails
                    .reduce(
                      (sum, item) => sum + (parseFloat(item.paymentDetail?.bankAmount) || 0),
                      0
                    )
                    .toFixed(0)}
                </Text>
                <Text style={[styles.totalCell, { flex: 0.8 }]}></Text>
                <Text style={[styles.totalCell, { flex: 0.8 }]}>
                  {loanIntDetails
                    .reduce((sum, item) => sum + (parseFloat(item.interestAmount) || 0), 0)
                    .toFixed(0)}
                </Text>
                <Text style={[styles.totalCell, { flex: 0.8 }]}>
                  {loanIntDetails
                    .reduce((sum, item) => sum + (parseFloat(item.penalty) || 0), 0)
                    .toFixed(0)}
                </Text>
                <Text style={[styles.totalCell, { flex: 1, borderRightWidth: 0 }]}>
                  {loanIntDetails
                    .reduce((sum, item) => sum + (parseFloat(item.amountPaid) || 0), 0)
                    .toFixed(0)}
                </Text>
              </View>
            </View>
          </View>
        </Page>
      )}
      {partReleaseDetails && partReleaseDetails.length > 0 && (
        <Page size="A4" orientation="landscape" style={styles.page}>
          <View style={{ padding: '10px' }}>
            <View
              style={{
                textAlign: 'center',
                fontSize: 18,
                marginTop: 10,
              }}
            >
              <Text style={styles.termsAndConditionsHeaders}>GOLD LOAN PART CLOSE</Text>
            </View>{' '}
            <View style={styles.table}>
              <View style={[styles.tableRow, styles.tableHeader]}>
                <Text style={[styles.tableCell, { flex: 0.25 }]}>#</Text>
                <Text style={[styles.tableCell, { flex: 1.9 }]}>Loan No</Text>
                <Text style={[styles.tableCell, { flex: 5 }]}>Customer Name</Text>
                <Text style={[styles.tableCell, { flex: 1 }]}>Loan Amt</Text>
                <Text style={[styles.tableCell, { flex: 0.4 }]}>Int (%)</Text>
                <Text style={[styles.tableCell, { flex: 0.4 }]}>Con (%)</Text>
                <Text style={[styles.tableCell, { flex: 1 }]}>Issue Date</Text>
                <Text style={[styles.tableCell, { flex: 1 }]}>Loan int. amt</Text>
                <Text style={[styles.tableCell, { flex: 1 }]}>Total pay amt</Text>
                <Text style={[styles.tableCell, { flex: 0.3 }]}>Pay by</Text>
                <Text style={[styles.tableCell, { flex: 1 }]}>Cash Amt</Text>
                <Text style={[styles.tableCell, { flex: 1 }]}>Bank Amt</Text>
                <Text style={[styles.tableCell, { flex: 1 }]}>Bank Name</Text>
                <Text style={[styles.tableCell, { flex: 1.1, borderRightWidth: 0 }]}>
                  Entry date
                </Text>
              </View>
              {partReleaseDetails.map((item, index) => (
                <View
                  style={[
                    styles.tableRow,
                    index % 2 !== 0 && styles.strippedRow,
                    index === partReleaseDetails.length - 1 && styles.lastRow,
                  ]}
                  key={index}
                >
                  <Text style={[styles.tableCell, { flex: 0.25 }]}>{index + 1}</Text>
                  <Text style={[styles.tableCell, { flex: 1.9 }]}>{item.loan.loanNo}</Text>
                  <Text style={[styles.tableCell, { flex: 5 }]}>
                    {`${item.loan.customer.firstName} ${item.loan.customer.middleName} ${item.loan.customer.lastName}`}
                  </Text>
                  <Text style={[styles.tableCell, { flex: 1 }]}>{item.loan.loanAmount}</Text>
                  <Text style={[styles.tableCell, { flex: 0.4 }]}>
                    {new Date(item?.loan?.issueDate) < cutoffDate ? Number(item?.loan?.scheme?.interestRate > 1.5 ? 1.5 : item?.loan?.scheme?.interestRate).toFixed(2) : 1}
                  </Text>
                  <Text style={[styles.tableCell, { flex: 0.4 }]}>
                    {item.loan.consultingCharge}
                  </Text>
                  <Text style={[styles.tableCell, { flex: 1 }]}>{fDate(item.loan.issueDate)}</Text>
                  <Text style={[styles.tableCell, { flex: 1 }]}>
                    {item.loan.interestLoanAmount || 0}
                  </Text>
                  <Text style={[styles.tableCell, { flex: 1 }]}>{item.adjustedAmount}</Text>
                  <Text style={[styles.tableCell, { flex: 0.3 }]}>
                    {item.paymentDetail.paymentMode}
                  </Text>
                  <Text style={[styles.tableCell, { flex: 1 }]}>
                    {item.paymentDetail.cashAmount || 0}
                  </Text>
                  <Text style={[styles.tableCell, { flex: 1 }]}>
                    {item.paymentDetail.bankAmount || 0}
                  </Text>
                  <Text style={[styles.tableCell, { flex: 1 }]}>
                    {item.paymentDetail?.bankName || '-'}
                  </Text>
                  <Text style={[styles.tableCell, { flex: 1.1, borderRightWidth: 0 }]}>
                    {fDate(item.createdAt)}
                  </Text>
                </View>
              ))}
              <View style={[styles.tableRow, styles.totalRow]}>
                <Text style={[styles.tableCell, { flex: 0.25 }]}></Text>
                <Text style={[styles.tableCell, { flex: 1.9 }]}>TOTAL</Text>
                <Text style={[styles.tableCell, { flex: 5 }]}></Text>
                <Text style={[styles.tableCell, { flex: 1 }]}>
                  {partReleaseDetails
                    .reduce((sum, item) => sum + (parseFloat(item.loan.loanAmount) || 0), 0)
                    .toFixed(0)}
                </Text>
                <Text style={[styles.tableCell, { flex: 0.4 }]}>
                  {calculateInterestRateAverage(partReleaseDetails)}
                </Text>
                <Text style={[styles.tableCell, { flex: 0.4 }]}>
                  {calculateConsultingChargeAverage(partReleaseDetails)}
                </Text>
                <Text style={[styles.tableCell, { flex: 1 }]}></Text>
                <Text style={[styles.tableCell, { flex: 1 }]}>
                  {partReleaseDetails
                    .reduce((sum, item) => sum + (parseFloat(item.loan.interestLoanAmount) || 0), 0)
                    .toFixed(0)}
                </Text>
                <Text style={[styles.tableCell, { flex: 1 }]}>
                  {partReleaseDetails
                    .reduce((sum, item) => sum + (parseFloat(item.adjustedAmount) || 0), 0)
                    .toFixed(0)}
                </Text>
                <Text style={[styles.tableCell, { flex: 0.3 }]}></Text>
                <Text style={[styles.tableCell, { flex: 1 }]}>
                  {partReleaseDetails
                    .reduce(
                      (sum, item) => sum + (parseFloat(item.paymentDetail.cashAmount) || 0),
                      0
                    )
                    .toFixed(0)}
                </Text>
                <Text style={[styles.tableCell, { flex: 1 }]}>
                  {partReleaseDetails
                    .reduce(
                      (sum, item) => sum + (parseFloat(item.paymentDetail.bankAmount) || 0),
                      0
                    )
                    .toFixed(0)}
                </Text>
                <Text style={[styles.tableCell, { flex: 1 }]}></Text>
                <Text style={[styles.tableCell, { flex: 1.1, borderRightWidth: 0 }]}></Text>
              </View>
            </View>
          </View>
        </Page>
      )}
      {partPaymentDetails && partPaymentDetails.length > 0 && (
        <Page size="A4" orientation="landscape" style={styles.page}>
          <View style={{ padding: '10px' }}>
            <View
              style={{
                textAlign: 'center',
                fontSize: 18,
                marginTop: 10,
              }}
            >
              <Text style={styles.termsAndConditionsHeaders}>GOLD LOAN PART PAYMENT</Text>
            </View>{' '}
            <View style={styles.table}>
              <View style={[styles.tableRow, styles.tableHeader]}>
                <Text style={[styles.tableCell, { flex: 0.25 }]}>#</Text>
                <Text style={[styles.tableCell, { flex: 1.8 }]}>Loan No</Text>
                <Text style={[styles.tableCell, { flex: 5 }]}>Customer Name</Text>
                <Text style={[styles.tableCell, { flex: 1 }]}>Loan Amt</Text>
                <Text style={[styles.tableCell, { flex: 0.4 }]}>Int. (%)</Text>
                <Text style={[styles.tableCell, { flex: 0.4 }]}>Con. (%)</Text>
                <Text style={[styles.tableCell, { flex: 1 }]}>Issue Date</Text>
                <Text style={[styles.tableCell, { flex: 1 }]}>Loan int. amt</Text>
                <Text style={[styles.tableCell, { flex: 1 }]}>Total pay amt</Text>
                <Text style={[styles.tableCell, { flex: 0.3 }]}>Pay by</Text>
                <Text style={[styles.tableCell, { flex: 1 }]}>Cash Amt</Text>
                <Text style={[styles.tableCell, { flex: 1 }]}>Bank Amt</Text>
                <Text style={[styles.tableCell, { flex: 1 }]}>Bank Name</Text>
                <Text style={[styles.tableCell, { flex: 1.1, borderRightWidth: 0 }]}>
                  Entry date
                </Text>
              </View>
              {partPaymentDetails.map((item, index) => (
                <View
                  style={[
                    styles.tableRow,
                    index % 2 !== 0 && styles.strippedRow,
                    index === partPaymentDetails.length - 1 && styles.lastRow,
                  ]}
                  key={index}
                >
                  <Text style={[styles.tableCell, { flex: 0.25 }]}>{index + 1}</Text>
                  <Text style={[styles.tableCell, { flex: 1.8 }]}>{item.loan.loanNo}</Text>
                  <Text style={[styles.tableCell, { flex: 5 }]}>
                    {`${item.loan.customer.firstName} ${item.loan.customer.middleName} ${item.loan.customer.lastName}`}
                  </Text>
                  <Text style={[styles.tableCell, { flex: 1 }]}>{item.loan.loanAmount}</Text>
                  <Text style={[styles.tableCell, { flex: 0.4 }]}>
                    {new Date(item?.loan?.issueDate) < cutoffDate ? Number(item?.loan?.scheme?.interestRate > 1.5 ? 1.5 : item?.loan?.scheme?.interestRate).toFixed(2) : 1}
                  </Text>
                  <Text style={[styles.tableCell, { flex: 0.4 }]}>
                    {item.loan.consultingCharge}
                  </Text>
                  <Text style={[styles.tableCell, { flex: 1 }]}>{fDate(item.loan.issueDate)}</Text>
                  <Text style={[styles.tableCell, { flex: 1 }]}>
                    {fDate(item.loan.interestLoanAmount)}
                  </Text>
                  <Text style={[styles.tableCell, { flex: 1 }]}>{item.amountPaid}</Text>
                  <Text style={[styles.tableCell, { flex: 0.3 }]}>
                    {item.paymentDetail.paymentMode}
                  </Text>
                  <Text style={[styles.tableCell, { flex: 1 }]}>
                    {item.paymentDetail.cashAmount || 0}
                  </Text>
                  <Text style={[styles.tableCell, { flex: 1 }]}>
                    {item.paymentDetail.bankAmount || 0}
                  </Text>
                  <Text style={[styles.tableCell, { flex: 1 }]}>
                    {item.paymentDetail?.bankName || '-'}
                  </Text>
                  <Text style={[styles.tableCell, { flex: 1.1, borderRightWidth: 0 }]}>
                    {fDate(item.createdAt)}
                  </Text>
                </View>
              ))}
              <View style={[styles.tableRow, styles.totalRow]}>
                <Text style={[styles.tableCell, { flex: 0.25 }]}></Text>
                <Text style={[styles.tableCell, { flex: 1.8 }]}>TOTAL</Text>
                <Text style={[styles.tableCell, { flex: 5 }]}></Text>
                <Text style={[styles.tableCell, { flex: 1 }]}>
                  {partPaymentDetails
                    .reduce((sum, item) => sum + (parseFloat(item.loan.loanAmount) || 0), 0)
                    .toFixed(2)}
                </Text>
                <Text style={[styles.tableCell, { flex: 0.4 }]}>
                  {calculateInterestRateAverage(partPaymentDetails)}
                </Text>
                <Text style={[styles.tableCell, { flex: 0.4 }]}>
                  {calculateConsultingChargeAverage(partPaymentDetails)}
                </Text>
                <Text style={[styles.tableCell, { flex: 1 }]}></Text>
                <Text style={[styles.tableCell, { flex: 1 }]}>
                  {partPaymentDetails
                    .reduce((sum, item) => sum + (parseFloat(item.loan.interestLoanAmount) || 0), 0)
                    .toFixed(0)}
                </Text>
                <Text style={[styles.tableCell, { flex: 1 }]}>
                  {partPaymentDetails
                    .reduce((sum, item) => sum + (parseFloat(item.amountPaid) || 0), 0)
                    .toFixed(0)}
                </Text>
                <Text style={[styles.tableCell, { flex: 0.3 }]}></Text>
                <Text style={[styles.tableCell, { flex: 1 }]}>
                  {partReleaseDetails
                    .reduce(
                      (sum, item) => sum + (parseFloat(item.paymentDetail.cashAmount) || 0),
                      0
                    )
                    .toFixed(0)}
                </Text>
                <Text style={[styles.tableCell, { flex: 1 }]}>
                  {partReleaseDetails
                    .reduce(
                      (sum, item) => sum + (parseFloat(item.paymentDetail.bankAmount) || 0),
                      0
                    )
                    .toFixed(0)}
                </Text>
                <Text style={[styles.tableCell, { flex: 1 }]}></Text>
                <Text style={[styles.tableCell, { flex: 1.1, borderRightWidth: 0 }]}></Text>
              </View>
            </View>
          </View>
        </Page>
      )}
      {uchakIntDetails && uchakIntDetails.length > 0 && (
        <Page size="A4" orientation="landscape" style={styles.page}>
          <View style={{ padding: '10px' }}>
            <View
              style={{
                textAlign: 'center',
                fontSize: 18,
                marginTop: 10,
              }}
            >
              <Text style={styles.termsAndConditionsHeaders}>GOLD LOAN UCHAK PART DETAILS</Text>
            </View>{' '}
            <View style={styles.table}>
              <View style={[styles.tableRow, styles.tableHeader]}>
                <Text style={[styles.tableCell, { flex: 0.2 }]}>#</Text>
                <Text style={[styles.tableCell, { flex: 2 }]}>Loan No</Text>
                <Text style={[styles.tableCell, { flex: 5 }]}>Customer Name</Text>
                <Text style={[styles.tableCell, { flex: 1 }]}>Loan Amt</Text>
                <Text style={[styles.tableCell, { flex: 0.3 }]}>Int. (%)</Text>
                <Text style={[styles.tableCell, { flex: 0.3 }]}>Con. (%)</Text>
                <Text style={[styles.tableCell, { flex: 1 }]}>Issue Date</Text>
                <Text style={[styles.tableCell, { flex: 1 }]}>Loan int. amt</Text>
                <Text style={[styles.tableCell, { flex: 1 }]}>Uchak Amt</Text>
                <Text style={[styles.tableCell, { flex: 0.3 }]}>Pay by</Text>
                <Text style={[styles.tableCell, { flex: 1 }]}>Cash Amt</Text>
                <Text style={[styles.tableCell, { flex: 1 }]}>Bank Amt</Text>
                <Text style={[styles.tableCell, { flex: 1 }]}>Bank Name</Text>
                <Text style={[styles.tableCell, { flex: 0.8 }]}>Pay date</Text>
                <Text style={[styles.tableCell, { flex: 0.8, borderRightWidth: 0 }]}>
                  Entry date
                </Text>
              </View>
              {uchakIntDetails.map((item, index) => (
                <View
                  style={[
                    styles.tableRow,
                    index % 2 !== 0 && styles.strippedRow,
                    index === uchakIntDetails.length - 1 && styles.lastRow,
                  ]}
                  key={index}
                >
                  <Text style={[styles.tableCell, { flex: 0.2 }]}>{index + 1}</Text>
                  <Text style={[styles.tableCell, { flex: 2 }]}>{item.loan.loanNo}</Text>
                  <Text style={[styles.tableCell, { flex: 5 }]}>
                    {`${item.loan.customer.firstName} ${item.loan.customer.middleName} ${item.loan.customer.lastName}`}
                  </Text>
                  <Text style={[styles.tableCell, { flex: 1 }]}>{item.loan.loanAmount}</Text>
                  <Text style={[styles.tableCell, { flex: 0.3 }]}>
                    {new Date(item?.loan?.issueDate) < cutoffDate ? Number(item?.loan?.scheme?.interestRate > 1.5 ? 1.5 : item?.loan?.scheme?.interestRate).toFixed(2) : 1}
                  </Text>
                  <Text style={[styles.tableCell, { flex: 0.3 }]}>
                    {item.loan.consultingCharge}
                  </Text>
                  <Text style={[styles.tableCell, { flex: 1 }]}>{fDate(item.issueDate)}</Text>
                  <Text style={[styles.tableCell, { flex: 1 }]}>
                    {item.loan.interestLoanAmount}
                  </Text>
                  <Text style={[styles.tableCell, { flex: 1 }]}>{item.amountPaid}</Text>
                  <Text style={[styles.tableCell, { flex: 0.3 }]}>
                    {item.paymentDetail.paymentMode}
                  </Text>
                  <Text style={[styles.tableCell, { flex: 1 }]}>
                    {item.paymentDetail.cashAmount || 0}
                  </Text>
                  <Text style={[styles.tableCell, { flex: 1 }]}>
                    {item.paymentDetail.bankAmount || 0}
                  </Text>
                  <Text style={[styles.tableCell, { flex: 1 }]}>
                    {item.paymentDetail?.bankName || '-'}
                  </Text>
                  <Text style={[styles.tableCell, { flex: 0.8 }]}>{fDate(item.date)}</Text>
                  <Text style={[styles.tableCell, { flex: 0.8, borderRightWidth: 0 }]}>
                    {fDate(item.createdAt)}
                  </Text>
                </View>
              ))}
              <View style={[styles.tableRow, styles.totalRow]}>
                <Text style={[styles.tableCell, { flex: 0.2 }]}></Text>
                <Text style={[styles.tableCell, { flex: 2 }]}>TOTAL</Text>
                <Text style={[styles.tableCell, { flex: 5 }]}></Text>
                <Text style={[styles.tableCell, { flex: 1 }]}>
                  {uchakIntDetails
                    .reduce((sum, item) => sum + (parseFloat(item.loan.loanAmount) || 0), 0)
                    .toFixed(2)}
                </Text>
                <Text style={[styles.tableCell, { flex: 0.3 }]}>
                  {calculateInterestRateAverage(uchakIntDetails)}
                </Text>
                <Text style={[styles.tableCell, { flex: 0.3 }]}>
                  {calculateConsultingChargeAverage(uchakIntDetails)}
                </Text>
                <Text style={[styles.tableCell, { flex: 1 }]}></Text>
                <Text style={[styles.tableCell, { flex: 1 }]}>
                  {uchakIntDetails
                    .reduce((sum, item) => sum + (parseFloat(item.loan.interestLoanAmount) || 0), 0)
                    .toFixed(2)}
                </Text>
                <Text style={[styles.tableCell, { flex: 1 }]}>
                  {uchakIntDetails
                    .reduce((sum, item) => sum + (parseFloat(item.amountPaid) || 0), 0)
                    .toFixed(2)}
                </Text>
                <Text style={[styles.tableCell, { flex: 0.3 }]}></Text>
                <Text style={[styles.tableCell, { flex: 1 }]}>
                  {partReleaseDetails
                    .reduce(
                      (sum, item) => sum + (parseFloat(item.paymentDetail.cashAmount) || 0),
                      0
                    )
                    .toFixed(0)}
                </Text>
                <Text style={[styles.tableCell, { flex: 1 }]}>
                  {partReleaseDetails
                    .reduce(
                      (sum, item) => sum + (parseFloat(item.paymentDetail.bankAmount) || 0),
                      0
                    )
                    .toFixed(0)}
                </Text>
                <Text style={[styles.tableCell, { flex: 1 }]}></Text>
                <Text style={[styles.tableCell, { flex: 0.8 }]}></Text>
                <Text style={[styles.tableCell, { flex: 0.8, borderRightWidth: 0 }]}></Text>
              </View>
            </View>
          </View>
        </Page>
      )}{' '}
      {closedLoans && closedLoans.length > 0 && (
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
            </View>{' '}
            <View style={styles.table}>
              <View style={[styles.tableRow, styles.tableHeader]}>
                <Text style={[styles.tableCell, { flex: 0.2 }]}>#</Text>
                <Text style={[styles.tableCell, { flex: 2 }]}>Loan No</Text>
                <Text style={[styles.tableCell, { flex: 3 }]}>Customer Name</Text>
                <Text style={[styles.tableCell, { flex: 1 }]}>Total loan amt</Text>
                <Text style={[styles.tableCell, { flex: 1 }]}>Paid Loan amt</Text>
                <Text style={[styles.tableCell, { flex: 0.5 }]}>Pay By</Text>
                <Text style={[styles.tableCell, { flex: 1 }]}>Cash Amt</Text>
                <Text style={[styles.tableCell, { flex: 1 }]}>Bank Amt</Text>
                <Text style={[styles.tableCell, { flex: 0.8 }]}>Bank Name</Text>
                <Text style={[styles.tableCell, { flex: 1 }]}>pending loan amt</Text>
                <Text style={[styles.tableCell, { flex: 1 }]}>Pay date</Text>
                <Text style={[styles.tableCell, { flex: 1 }]}>Closing date</Text>
                <Text style={[styles.tableCell, { flex: 0.5 }]}>Closing charge</Text>
                <Text style={[styles.tableCell, { flex: 0.5 }]}>Pay By</Text>
                <Text style={[styles.tableCell, { flex: 1 }]}>Cash Amt</Text>
                <Text style={[styles.tableCell, { flex: 1 }]}>Bank Amt</Text>
                <Text style={[styles.tableCell, { flex: 0.8 }]}>Bank Name</Text>
                <Text style={[styles.tableCell, { flex: 1 }]}>Net amt</Text>
                <Text style={[styles.tableCell, { flex: 1.8, borderRightWidth: 0 }]}>Entry by</Text>
              </View>
              {closedLoans.map((item, index) => (
                <View
                  style={[
                    styles.tableRow,
                    index % 2 !== 0 && styles.strippedRow,
                    index === uchakIntDetails.length - 1 && styles.lastRow,
                  ]}
                  key={index}
                >
                  <Text style={[styles.tableCell, { flex: 0.2 }]}>{index + 1}</Text>
                  <Text style={[styles.tableCell, { flex: 2 }]}>{item.loan.loanNo}</Text>
                  <Text style={[styles.tableCell, { flex: 3 }]}>
                    {`${item.loan.customer.firstName} ${item.loan.customer.middleName} ${item.loan.customer.lastName}`}
                  </Text>
                  <Text style={[styles.tableCell, { flex: 1 }]}>{item.totalLoanAmount}</Text>
                  <Text style={[styles.tableCell, { flex: 1 }]}>
                    {(item.netAmount - item.closingCharge).toFixed(2)}
                  </Text>
                  <Text style={[styles.tableCell, { flex: 0.5 }]}>
                    {item.paymentDetail.paymentMode}
                  </Text>{' '}
                  <Text style={[styles.tableCell, { flex: 1 }]}>
                    {item.paymentDetail.cashAmount || 0}
                  </Text>{' '}
                  <Text style={[styles.tableCell, { flex: 1 }]}>
                    {item.paymentDetail.bankAmount || 0}
                  </Text>{' '}
                  <Text style={[styles.tableCell, { flex: 0.8 }]}>
                    {item.paymentDetail.bankName || '-'}
                  </Text>
                  <Text style={[styles.tableCell, { flex: 1 }]}>
                    {item.totalLoanAmount - (item.netAmount - item.closingCharge)}
                  </Text>{' '}
                  <Text style={[styles.tableCell, { flex: 1, fontSize: 6 }]}>
                    {fDate(item.date)}
                  </Text>
                  <Text style={[styles.tableCell, { flex: 1, fontSize: 6 }]}>
                    {fDate(item.createdAt)}
                  </Text>
                  <Text style={[styles.tableCell, { flex: 0.5 }]}>{item.closingCharge}</Text>
                  <Text style={[styles.tableCell, { flex: 0.5 }]}>
                    {item.chargePaymentDetail.chargePaymentMode}
                  </Text>{' '}
                  <Text style={[styles.tableCell, { flex: 1 }]}>
                    {item.chargePaymentDetail.chargeCashAmount || 0}
                  </Text>{' '}
                  <Text style={[styles.tableCell, { flex: 1 }]}>
                    {item.chargePaymentDetail.chargeBankAmount || 0}
                  </Text>{' '}
                  <Text style={[styles.tableCell, { flex: 0.8 }]}>
                    {item.chargePaymentDetail.bankName || '-'}
                  </Text>
                  <Text style={[styles.tableCell, { flex: 1 }]}>{item.netAmount.toFixed(2)}</Text>
                  <Text style={[styles.tableCell, { flex: 1.8, borderRightWidth: 0, fontSize: 6 }]}>
                    {item.entryBy}
                  </Text>
                </View>
              ))}
              <View style={[styles.tableRow, styles.totalRow]}>
                <Text style={[styles.tableCell, { flex: 0.2 }]}></Text>
                <Text style={[styles.tableCell, { flex: 2 }]}>TOTAL</Text>
                <Text style={[styles.tableCell, { flex: 3 }]}></Text>
                <Text style={[styles.tableCell, { flex: 1 }]}>
                  {closedLoans
                    .reduce((sum, item) => sum + (parseFloat(item.totalLoanAmount) || 0), 0)
                    .toFixed(0)}
                </Text>
                <Text style={[styles.tableCell, { flex: 1 }]}>
                  {closedLoans
                    .reduce((sum, item) => sum + (parseFloat(item.netAmount) || 0), 0)
                    .toFixed(0)}
                </Text>
                <Text style={[styles.tableCell, { flex: 0.5 }]}></Text>
                <Text style={[styles.tableCell, { flex: 1 }]}>
                  {closedLoans
                    .reduce(
                      (sum, item) => sum + (parseFloat(item.paymentDetail.cashAmount) || 0),
                      0
                    )
                    .toFixed(0)}
                </Text>
                <Text style={[styles.tableCell, { flex: 1 }]}>
                  {closedLoans
                    .reduce(
                      (sum, item) => sum + (parseFloat(item.paymentDetail.bankAmount) || 0),
                      0
                    )
                    .toFixed(0)}
                </Text>
                <Text style={[styles.tableCell, { flex: 0.8 }]}></Text>
                <Text style={[styles.tableCell, { flex: 1 }]}>
                  {closedLoans
                    .reduce(
                      (sum, item) => sum + (parseFloat(item.totalLoanAmount - item.netAmount) || 0),
                      0
                    )
                    .toFixed(0)}
                </Text>
                <Text style={[styles.tableCell, { flex: 1 }]}></Text>
                <Text style={[styles.tableCell, { flex: 1 }]}></Text>
                <Text style={[styles.tableCell, { flex: 0.5 }]}>
                  {closedLoans
                    .reduce((sum, item) => sum + (parseFloat(item.closingCharge) || 0), 0)
                    .toFixed(0)}
                </Text>
                <Text style={[styles.tableCell, { flex: 0.5 }]}></Text>
                <Text style={[styles.tableCell, { flex: 1 }]}>
                  {closedLoans
                    .reduce(
                      (sum, item) =>
                        sum + (parseFloat(item.chargePaymentDetail.chargeCashAmount) || 0),
                      0
                    )
                    .toFixed(0)}
                </Text>
                <Text style={[styles.tableCell, { flex: 1 }]}>
                  {closedLoans
                    .reduce(
                      (sum, item) =>
                        sum + (parseFloat(item.chargePaymentDetail.chargeBankAmount) || 0),
                      0
                    )
                    .toFixed(0)}
                </Text>
                <Text style={[styles.tableCell, { flex: 0.8 }]}></Text>
                <Text style={[styles.tableCell, { flex: 1 }]}>
                  {closedLoans
                    .reduce((sum, item) => sum + (parseFloat(item.netAmount) || 0), 0)
                    .toFixed(0)}
                </Text>
                <Text style={[styles.tableCell, { flex: 1.8, borderRightWidth: 0 }]}></Text>
              </View>
            </View>
          </View>
        </Page>
      )}
    </Document>
  );
}
