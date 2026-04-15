import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { Document, Font, Image, Page, StyleSheet, Text, View } from '@react-pdf/renderer';
import InvoiceHeader from '../../../components/invoise/invoice-header';
import { fDate } from '../../../utils/format-time';
import logo from '../../../assets/logo/pdf-logo.png';

Font.register({
  family: 'Roboto',
  fonts: [{ src: '/fonts/Roboto-Regular.ttf' }, { src: '/fonts/Roboto-Bold.ttf' }],
});

const useStyles = () =>
  useMemo(
    () =>
      StyleSheet.create({
        page: {
          fontFamily: 'Roboto',
          backgroundColor: '#FFFFFF',
          border: '3px solid #000',
          padding: '1px',
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
          flex: 0.95,
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
          backgroundColor: '#5B9BD4',
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
        termsAndConditionsHeaders: {
          color: '#232C4B',
          borderBottom: '1px solid #232C4B',
          fontWeight: 600,
          textWrap: 'nowrap',
          fontSize: '12px',
          textAlign: 'center',
          paddingVertical: 5,
        },
      }),
    []
  );

export default function LoanCloseDetailsPdf({ data, configs }) {
  const styles = useStyles();

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={{ border: '1px solid #000' }}>
          <View style={styles.watermarkContainer}>
            <Image src={logo} style={styles.watermarkImage} />
          </View>
          <InvoiceHeader selectedRow={data.loan} configs={configs} />
          <View style={styles.pagePadding}>
            <View
              style={{
                textAlign: 'center',
                fontSize: 18,
                marginRight: 25,
                marginBottom: 10,
              }}
            >
              <Text style={styles.termsAndConditionsHeaders}>LOAN CLOSE INVOICE</Text>
            </View>{' '}
            <View style={{ display: 'flex', alignItems: 'center', flexDirection: 'row' }}>
              <View style={{ width: '50%' }}>
                <View style={styles.row}>
                  <Text style={styles.subHeading}>Loan No </Text>
                  <Text style={styles.colon}>:</Text>
                  <Text style={styles.subText}>{data.loan.loanNo} </Text>
                </View>
                <View style={styles.row}>
                  <Text style={styles.subHeading}>Issue Date </Text>
                  <Text style={styles.colon}>:</Text>
                  <Text style={styles.subText}>{fDate(data.loan.issueDate)}</Text>
                </View>
                <View style={styles.row}>
                  <Text style={styles.subHeading}>Next Interest Date </Text>
                  <Text style={styles.colon}>:</Text>
                  <Text style={styles.subText}>{fDate(data.loan.nextInstallmentDate)}</Text>
                </View>
              </View>
              <View style={{ width: '50%' }}>
                <View style={styles.row}>
                  <Text style={styles.subHeading2}>Customer Name </Text>
                  <Text style={styles.colon}>:</Text>
                  <Text
                    style={styles.subText}
                  >{`${data.loan.customer.firstName} ${data.loan.customer.middleName} ${data.loan.customer.lastName}`}</Text>
                </View>
                <View style={styles.row}>
                  <Text style={styles.subHeading2}>Pan No </Text>
                  <Text style={styles.colon}>:</Text>
                  <Text style={styles.subText}>{data.loan.customer.panCard}</Text>
                </View>
                <View style={styles.row}>
                  <Text style={styles.subHeading2}>Mobile No </Text>
                  <Text style={styles.colon}>:</Text>
                  <Text style={styles.subText}>{data.loan.customer.contact}</Text>
                </View>
              </View>
            </View>
            <View>
              <Text
                style={{
                  ...styles.headerText2,
                  marginTop: 30,
                  marginBottom: 15,
                  borderBottom: '1px solid black',
                  paddingVertical: 5,
                  width: '120px',
                }}
              >
                Loan Close Details
              </Text>
              <View style={[styles.tableRow, styles.tableHeader]}>
                <Text style={styles.tableCell}>Total loan amt</Text>
                <Text style={styles.tableCell}>Paid loan amt</Text>
                <Text style={styles.tableCell}>Pending loan amt</Text>
                <Text style={styles.tableCell}>Closing charge</Text>
                <Text style={styles.tableCell}>Net amt</Text>
                <Text style={styles.tableCell}>Payment mode</Text>
                <Text style={styles.tableCell}>Cash amt</Text>
                <Text style={styles.tableCell}>Bank amt</Text>
              </View>
              <View style={styles.tableRow}>
                <Text style={styles.tableCell}>{data?.totalLoanAmount}</Text>
                <Text style={styles.tableCell}>{data?.netAmount - data?.closingCharge}</Text>
                <Text style={styles.tableCell}>
                  {data?.netAmount - data?.totalLoanAmount - data?.closingCharge}
                </Text>
                <Text style={styles.tableCell}>{data?.closingCharge}</Text>
                <Text style={styles.tableCell}>{data?.netAmount}</Text>
                <Text style={styles.tableCell}>{data?.paymentDetail?.paymentMode}</Text>
                <Text style={styles.tableCell}>{data?.paymentDetail?.cashAmount || 0}</Text>
                <Text style={styles.tableCell}>{data?.paymentDetail?.bankAmount || 0}</Text>
              </View>
            </View>
            <Text
              style={{
                marginTop: 20,
              }}
            >
              <Text style={[styles.subHeading, { fontSize: 12 }]}>Accepted & Received Amount</Text>
              <Text style={[styles.colon, { fontSize: 12 }]}> : </Text>
              <Text style={[styles.subText, { fontSize: 12, fontWeight: 'bold' }]}>
                {data.netAmount}
              </Text>
            </Text>
          </View>
          <View style={{ ...styles.d_flex, marginBottom: 52.5 }}>
            <Text style={{ ...styles.signText, marginLeft: 35 }}>Authority Sign</Text>
          </View>
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
    })
  ),
};
