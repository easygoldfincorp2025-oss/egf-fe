import { useMemo } from 'react';
import { Document, Font, Image, Page, StyleSheet, Text, View } from '@react-pdf/renderer';
import logo from 'src/assets/logo/pdf-logo.png';
import { fDate } from 'src/utils/format-time.js';
import InvoiceHeader from '../../../components/invoise/invoice-header.jsx';

// ----------------------------------------------------------------------

Font.register({
  family: 'Roboto',
  fonts: [
    { src: '/fonts/Roboto-Regular.ttf' },
    { src: '/fonts/Roboto-Bold.ttf', fontWeight: 'bold' },
  ],
});

Font.register({
  family: 'NotoSansGujarati',
  src: '/fonts/NotoSansGujarati-VariableFont_wdth,wght.ttf',
});

Font.register({
  family: 'Mukta Vaani',
  fonts: [
    { src: '/fonts/MuktaVaani-Regular.ttf' },
    { src: '/fonts/MuktaVaani-Bold.ttf', fontWeight: 'bold' },
  ],
});

const useStyles = () =>
  useMemo(
    () =>
      StyleSheet.create({
        col4: { width: '25%' },
        col8: { width: '75%' },
        col6: { width: '50%' },
        mb4: { marginBottom: 4 },
        my4: { marginBlock: 4 },
        mb8: { marginBottom: 8 },
        mb40: { marginBottom: 40 },
        h3: { fontSize: 16, fontWeight: 700 },
        h4: { fontSize: 13, fontWeight: 700 },
        body1: { fontSize: 10 },
        body2: { fontSize: 9 },
        subtitle1: { fontSize: 10, fontWeight: 700 },
        subtitle2: { fontSize: 9, fontWeight: 700 },
        alignRight: { textAlign: 'right' },
        page: {
          fontFamily: 'Roboto',
          backgroundColor: '#FFFFFF',
          textTransform: 'capitalize',
        },
        pagePadding: {
          padding: '0px 24px 24px 24px',
        },
        gujaratiText: {
          fontFamily: 'Mukta Vaani',
          fontSize: 12,
        },
        footer: {
          left: 0,
          right: 0,
          bottom: 0,
          padding: 24,
          margin: 'auto',
          borderTopWidth: 1,
          borderStyle: 'solid',
          position: 'absolute',
          borderColor: '#DFE3E8',
        },
        gridContainer: {
          flexDirection: 'row',
          justifyContent: 'space-between',
        },
        table: {
          display: 'flex',
          width: 'auto',
        },
        tableRow: {
          padding: '8px 0',
          flexDirection: 'row',
          borderBottomWidth: 1,
          borderStyle: 'solid',
          borderColor: '#DFE3E8',
        },
        logoContainer: {
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
        },
        logo: {
          width: 80,
          height: 80,
          marginBottom: 8,
        },
        subText: {
          color: '#FFFFFF',
          fontSize: 10,
          marginBottom: 2,
          marginTop: 10,
          fontWeight: 'bold',
          marginLeft: -145,
          width: '40%',
        },
        branchDetails: {
          color: '#FFFFFF',
          marginTop: 3,
          fontWeight: 'bold',
          textTransform: 'lowercase',
          fontSize: 10,
          textAlign: 'right',
        },
        noBorder: {
          paddingTop: 8,
          paddingBottom: 0,
          borderBottomWidth: 0,
        },
        noticeTitle: {
          width: '100%',
          marginTop: 35,
          marginBottom: 30,
          textDecoration: 'underline',
          fontSize: 20,
          fontFamily: 'Mukta Vaani',
          textAlign: 'center',
        },
        topDetails: {
          fontSize: 11,
          textAlign: 'left',
          marginTop: 3,
          fontFamily: 'Mukta Vaani',
          letterSpacing: 0.5,
        },
        bottomDetails: {
          fontSize: 12,
          marginTop: 3,
          fontFamily: 'Mukta Vaani',
          letterSpacing: 0.5,
        },
        mainText: {
          fontSize: 14,
          fontFamily: 'Roboto',
        },
        d_flex: {
          display: 'flex',
          width: '100%',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'flex-end',
          marginTop: 100,
        },
        wriitenBy: {
          fontSize: 14,
          fontFamily: 'Mukta Vaani',
          letterSpacing: 0.5,
          borderTop: '1px solid 232C4B',
          paddingTop: 10,
          textAlign: 'center',
          width: '100px',
          fontWeight: 600,
        },
        write: {
          fontSize: 14,
          textAlign: 'left',
          marginTop: 3,
          fontFamily: 'Mukta Vaani',
          letterSpacing: 0.5,
        },
        date: {
          width: '100%',
          textAlign: 'right',
          fontSize: 12,
        },
        tableCell_1: {
          width: '5%',
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
        tableCell_2: {
          width: '50%',
          paddingRight: 16,
        },
        tableCell_3: {
          width: '15%',
        },
        termsAndConditionsHeaders: {
          fontWeight: 'bold',
          textWrap: 'nowrap',
          fontSize: '12px',
          textAlign: 'center',
          paddingVertical: 5,
          fontFamily: 'Mukta Vaani',
        },
      }),
    []
  );

// ----------------------------------------------------------------------

export default function InterestNotice({ interestNoticeData, configs }) {
  const styles = useStyles();
  const date = new Date(new Date().setDate(new Date().getDate() + 10));

  return (
    <>
      <Document>
        <Page size="A4" style={styles.page}>
          <View style={styles.watermarkContainer}>
            <Image src={logo} style={styles.watermarkImage} />
          </View>
          <InvoiceHeader  branch={interestNoticeData?.customer?.branch} selectedRow={interestNoticeData} configs={configs} />
          <View style={styles.pagePadding}>
            <View>
              <Text
                style={{
                  ...styles.noticeTitle,
                  color: '#232C4B',
                  borderBottom: '1px solid #232C4B',
                  textDecoration: 'none',
                  fontWeight: 'bold',
                }}
              >
                નોટીસ
              </Text>
              <Text style={styles.date}>{fDate(new Date())}</Text>
            </View>
            <View>
              <Text
                style={styles.topDetails}
              >{`${interestNoticeData.customer.firstName} ${interestNoticeData.customer.middleName} ${interestNoticeData.customer.lastName}`}</Text>
              <Text style={styles.topDetails}>
                {`${interestNoticeData.customer.temporaryAddress.street},\n`}
                {`${interestNoticeData.customer.temporaryAddress.landmark},\n`}
                {`${interestNoticeData.customer.temporaryAddress.city} - ${interestNoticeData.customer.temporaryAddress.zipcode},\n`}
                {`${interestNoticeData.customer.temporaryAddress.state}`}
              </Text>
              <Text style={styles.topDetails}>Mo : {interestNoticeData?.customer?.contact}</Text>
            </View>
            <View>
              <Text style={styles.noticeTitle}>વિષય : ગોલ્ડ લોનનું વ્યાજ ભરપાઈ કરવા બાબત</Text>
            </View>
            <View style={styles.bottomDetails}>
              <Text style={styles.bottomDetails}>
                {' '}
                <Text>{'                     '}</Text>
                આથી જણાવવાનું કે તમે EASY GOLD FINCORP માુંથી તારીખ{' '}
                <Text style={{ fontWeight: 'bold' }}>
                  {fDate(interestNoticeData.issueDate)}{' '}
                </Text>{' '}
                ના રોજ લીધેલી ગોલ્ડ લોન જેનો લોન અકાઉન્ટ નં{' '}
                <Text style={{ fontWeight: 'bold' }}>{interestNoticeData.loanNo}</Text> છે. જે લોન
                ની રકમ અંકે રૂપિયા{' '}
                <Text style={{ fontWeight: 'bold' }}>{interestNoticeData.loanAmount}</Text> છે,
                જેમાં આપશ્રીએ કંપનીના નિયમોનુસાર રેગ્યુલર વ્યાજ ની ભરવાપાત્ર રકમ આજ દિન સઘી ભરપાય
                કરેલ નથી. જેથી આપને આ નોટિસ આપવામાં આવે છે કે તારીખ{' '}
                <Text style={{ fontWeight: 'bold' }}>{fDate(date)}</Text> સુઘી માં આજ દિન સઘી ની
                વ્યાજની બાકી રકમ નિયમ મદુત સઘી માં વ્યાજ ની બાકી રકમ ભરપાય નહી કરે અથવા કંપનીએ આપેલી
                મદુત સઘી માં રૂબરૂ ઓફીસ પર હાજર ન થતા કંપનીએ પોતાના નિયમોનુસાર વ્યાજ સાથેની બાકી{' '}
                {'\n'}નીકળતી રકમની વસુલાત કરવા માટે આગળ કાયદેસર ની કાર્યવાહી કરશે, જેમાં આપશ્રીએ કોઈ
                પણ પ્રકાર ની દલીલ કે તર-તકરાર કરવી નહિ , જે બાબતે આપશ્રીએ ખાસ નોંધ લેવી.
              </Text>
              <View style={styles.d_flex}>
                <Text style={styles.wriitenBy}>લી. મેનેજમેન્ટ</Text>
              </View>
            </View>
          </View>
        </Page>
      </Document>
    </>
  );
}
