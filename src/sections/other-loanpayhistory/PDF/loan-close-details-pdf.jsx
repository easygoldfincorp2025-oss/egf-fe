import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { Page, View, Text, Font, Document, StyleSheet, Image } from '@react-pdf/renderer';
import InvoiceHeader from '../../../components/invoise/invoice-header';
import { fDate } from '../../../utils/format-time';
import logo from '../../../assets/logo/pdf-logo.png';

Font.register({
  family: 'Roboto',
  fonts: [
    { src: '/fonts/Roboto-Regular.ttf' },
    { src: '/fonts/Roboto-Bold.ttf' },
  ],
});

const useStyles = () =>
  useMemo(
    () =>
      StyleSheet.create({
        page: {
          fontFamily: 'Roboto',
          backgroundColor: '#FFFFFF',
        },
        pagePadding: {
          padding: '0px 24px 0px 24px',
          height: '68%',
        },
        watermarkContainer: {
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: -1,
          justifyContent: 'center',
          alignItems: 'center',
        },
        watermarkImage: {
          width: 400,
          opacity: 0.1,
        },
        headerText2: {
          fontSize: 14,
          fontWeight: 'bold',
          marginBottom: 16,
        },
        row: {
          flexDirection: 'row',
          marginVertical: 2,
        },
        subHeading: {
          fontWeight: '600',
          fontSize: 10,
          flex: 0.9,
        },
        subHeading2: {
          fontWeight: '600',
          fontSize: 10,
          flex: 0.8,
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
        spacing: {
          marginTop: 7,
        },
        table: {
          width: 'auto',
          marginTop: 10,
          borderRadius: 10,
        },
        tableHeader: {
          color: '#fff',
          backgroundColor: '#232C4B',
          fontWeight: 'bold',
          borderTopLeftRadius: 10,
          borderTopRightRadius: 10,
        },
        tableFooter: {
          color: '#fff',
          backgroundColor: '#232C4B',
          fontWeight: 'bold',
          borderBottomLeftRadius: 10,
          borderBottomRightRadius: 10,
        },
        tableRow: {
          flexDirection: 'row',
          borderBottomWidth: 1,
          borderStyle: 'solid',
          borderColor: '#F0F0F0',
          paddingVertical: 8,
        },
        tableCell: {
          flex: 1,
          fontSize: 10,
          paddingHorizontal: 4,
          textAlign: 'center',
        },
        d_flex: {
          display: 'flex',
          width: '100%',
          flexDirection: 'row',
          marginTop: 90,
          alignItems: 'center',
          justifyContent: 'space-between',
        },
        signText: {
          fontSize: 11,
          borderTop: '1px solid black',
          paddingTop: 10,
          textAlign: 'center',
          width: '100px',
          fontWeight: 600,
        },
      }),
    [],
  );

export default function LoanCloseDetailsPdf({ data, configs }) {
  const styles = useStyles();
  return (
    <Document>
      <Page size='A4' style={styles.page}> <View style={styles.watermarkContainer}>
        <Image src={logo} style={styles.watermarkImage} />
      </View>
        <InvoiceHeader selectedRow={data.loan} configs={configs} />
        <View style={styles.pagePadding}>
          <Text style={{ ...styles.headerText2, marginTop: 25 }}>Loan Close Slip</Text>
          <View style={{ display: 'flex', alignItems: 'center', flexDirection: 'row' }}>
            <View style={{ width: '50%' }}>
              <View style={styles.row}>
                <Text style={styles.subHeading}>Loan No{' '}</Text>
                <Text style={styles.colon}>:</Text>
                <Text style={styles.subText}>{data.loan.loanNo} </Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.subHeading}>Issue Date{' '}</Text>
                <Text style={styles.colon}>:</Text>
                <Text style={styles.subText}>{fDate(data.loan.issueDate)}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.subHeading}>Next Interest Date{' '}</Text>
                <Text style={styles.colon}>:</Text>
                <Text style={styles.subText}>{fDate(data.loan.nextInstallmentDate)}</Text>
              </View>
            </View>
            <View style={{ width: '50%' }}>
              <View style={styles.row}>
                <Text style={styles.subHeading2}>Customer Name{' '}</Text>
                <Text style={styles.colon}>:</Text>
                <Text
                  style={styles.subText}>{`${data.loan.customer.firstName} ${data.loan.customer.middleName} ${data.loan.customer.lastName}`}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.subHeading2}>Pan No{' '}</Text>
                <Text style={styles.colon}>:</Text>
                <Text style={styles.subText}>{data.loan.customer.panCard}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.subHeading2}>Mobile No{' '}</Text>
                <Text style={styles.colon}>:</Text>
                <Text style={styles.subText}>{data.loan.customer.contact}</Text>
              </View>
            </View>
          </View>
          <View>
            <Text style={{ ...styles.headerText2, marginTop: 30, marginBottom: 25 }}>Loan Close Details</Text>
            <View style={[styles.tableRow, styles.tableHeader]}>
              <Text style={styles.tableCell}>Total loan amt</Text>
              <Text style={styles.tableCell}>Paid loan amt</Text>
              <Text style={styles.tableCell}>Pending loan amt</Text>
              <Text style={styles.tableCell}>Closing charge</Text>
              <Text style={styles.tableCell}>net Amt</Text>
              <Text style={styles.tableCell}>Payment mode</Text>
              <Text style={styles.tableCell}>Cash amt</Text>
              <Text style={styles.tableCell}>Bank amt</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCell}>{data?.totalLoanAmount}</Text>
              <Text style={styles.tableCell}>{data?.totalLoanAmount}</Text>
              <Text style={styles.tableCell}>{data?.netAmount}</Text>
              <Text style={styles.tableCell}>{data?.closingCharge}</Text>
              <Text style={styles.tableCell}>{data?.netAmount}</Text>
              <Text style={styles.tableCell}>{data?.paymentDetail?.paymentMode}</Text>
              <Text style={styles.tableCell}>{data?.paymentDetail?.cashAmount || 0}</Text>
              <Text style={styles.tableCell}>{data?.paymentDetail?.bankAmount || 0}</Text>
            </View>
          </View>
        </View>
        <View style={styles.d_flex}>
          <Text style={{ ...styles.signText, marginLeft: 35 }}>Authority Sign</Text>
        </View>
      </Page>
    </Document>
  );
}

LoanCloseDetailsPdf.propTypes = {
  data: PropTypes.object,
  dynamicTableData: PropTypes.arrayOf(
    PropTypes.shape({
      column1: PropTypes.string,
      column2: PropTypes.string,
      column3: PropTypes.string,
      column4: PropTypes.string,
    }),
  ),
};
