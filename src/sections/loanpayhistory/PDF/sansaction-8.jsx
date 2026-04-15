import React, { useMemo } from 'react';
import { Document, Font, Image, Page, StyleSheet, Text, View } from '@react-pdf/renderer';
import logo from 'src/assets/logo/logo.png';
import { fDate } from 'src/utils/format-time.js';
import InvoiceHeader from '../../../components/invoise/invoice-header.jsx';

// ----------------------------------------------------------------------

Font.register({
  family: 'Roboto',
  fonts: [{ src: '/fonts/Roboto-Regular.ttf' }, { src: '/fonts/Roboto-Bold.ttf' }],
});

Font.register({
  family: 'NotoSansGujarati',
  src: '/fonts/NotoSansGujarati-VariableFont_wdth,wght.ttf',
});

Font.register({
  family: 'Poppins',
  src: '/fonts/Overpass-VariableFont_wght.ttf',
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
          position: 'relative',
          border: '3px solid #000',
          padding: '1px',
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
        pagePadding: {
          padding: '0px 24px 24px 24px',
          height: '72%',
        },
        gujaratiText: {
          fontFamily: 'Mukta Vaani',
        },
        flexContainer: {
          flexDirection: 'row',
          marginTop: 10,
          justifyContent: 'space-between',
          alignItems: 'center',
        },
        gridContainer: {
          flexDirection: 'row',
          justifyContent: 'space-between',
        },
        logoContainer: {
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
        },
        wriitenBy: {
          fontSize: 14,
          width: '100%',
          textAlign: 'right',
          marginTop: 10,
          fontFamily: 'Mukta Vaani',
          letterSpacing: 0.5,
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
        row: {
          flexDirection: 'row',
          marginVertical: 2,
        },
        subHeading: {
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
          borderRadius: 10,
          flex: 2,
        },
        tableFooter: {
          borderTop: '1px solid #232C4B',
          fontWeight: 'bold',
          borderBottomLeftRadius: 10,
          borderBottomRightRadius: 10,
          paddingVertical: 8,
        },
        tableHeader: {
          backgroundColor: '#5B9BD4',
          fontWeight: 600,
          borderTopLeftRadius: 10,
          borderTopRightRadius: 10,
          textWrap: 'nowrap',
          paddingVertical: 6,
        },
        tableRow: {
          flexDirection: 'row',
          borderStyle: 'solid',
          paddingVertical: 10,
          textWrap: 'nowrap',
          fontWeight: 600,
        },
        tableRowBorder: {
          borderBottom: '1px solid #d9d9d9',
        },
        tableCell: {
          flex: 1,
          fontSize: 10,
          paddingHorizontal: 4,
          textAlign: 'center',
          fontWeight: 600,
          fontFamily: 'Mukta Vaani',
        },
        heading: {
          fontSize: '13px',
          fontWeight: '500',
          marginBottom: 5,
        },
        propertyCellHeading: {
          fontSize: 12,
          fontWeight: '500',
          textAlign: 'center',
          marginBottom: 5,
          marginLeft: 18,
        },
        img: {
          height: '120px',
          width: '120px',
          borderRadius: 8,
        },
        tableFlex: {
          flexDirection: 'row',
          marginTop: 25,
          width: '100%',
        },
        termsAndConditionsHeaders: {
          color: '#232C4B',
          borderBottom: '1px solid #232C4B',
          textWrap: 'nowrap',
          fontSize: '12px',
          textAlign: 'center',
          paddingVertical: 5,
          fontFamily: 'Mukta Vaani',
        },
        d_flex: {
          display: 'flex',
          width: '100%',
          flexDirection: 'row',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
        },
        box: {
          width: 60,
          height: 60,
          borderWidth: 1,
          borderColor: '#232C4B',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          marginLeft: 5,
        },
        box2: {
          fontSize: 11,
          borderTop: '1px solid 232C4B',
          color: '#232C4B',
          paddingTop: 10,
          textAlign: 'center',
          width: '100px',
          fontWeight: 600,
        },
        signText: {
          fontSize: 11,
          color: '#232C4B',
          textAlign: 'center',
          fontWeight: '600',
          marginTop: 10,
        },
      }),
    []
  );

// ----------------------------------------------------------------------

export default function Sansaction8({ sansaction, configs }) {
  const styles = useStyles();
  const qty = sansaction.propertyDetails.reduce((prev, next) => prev + (Number(next?.pcs) || 0), 0);

  const totalWight = sansaction.propertyDetails.reduce(
    (prev, next) => prev + (Number(next?.totalWeight) || 0),
    0
  );

  const netWight = sansaction.propertyDetails.reduce(
    (prev, next) => prev + (Number(next?.netWeight) || 0),
    0
  );
  const amount = sansaction.loanAmount;

  function numberToWords(num) {
    if (num === 0) return 'Zero Rupees Only';

    const belowTwenty = [
      '',
      'One',
      'Two',
      'Three',
      'Four',
      'Five',
      'Six',
      'Seven',
      'Eight',
      'Nine',
      'Ten',
      'Eleven',
      'Twelve',
      'Thirteen',
      'Fourteen',
      'Fifteen',
      'Sixteen',
      'Seventeen',
      'Eighteen',
      'Nineteen',
    ];

    const tens = [
      '',
      '',
      'Twenty',
      'Thirty',
      'Forty',
      'Fifty',
      'Sixty',
      'Seventy',
      'Eighty',
      'Ninety',
    ];
    const units = ['', 'Thousand', 'Lakh', 'Crore'];

    const convertBelowHundred = (n) => {
      if (n < 20) return belowTwenty[n];
      return tens[Math.floor(n / 10)] + (n % 10 > 0 ? ' ' + belowTwenty[n % 10] : '');
    };

    const convertBelowThousand = (n) => {
      if (n < 100) return convertBelowHundred(n);
      return (
        belowTwenty[Math.floor(n / 100)] +
        ' Hundred' +
        (n % 100 > 0 ? ' ' + convertBelowHundred(n % 100) : '')
      );
    };

    const handleWholeNumber = (num) => {
      let result = '';
      let unitIndex = 0;

      while (num > 0) {
        let part = num % (unitIndex === 0 ? 1000 : 100);
        if (part > 0) {
          const unit = units[unitIndex] ? ' ' + units[unitIndex] : '';
          result = convertBelowThousand(part) + unit + (result ? ' ' + result : '');
        }
        num = Math.floor(num / (unitIndex === 0 ? 1000 : 100));
        unitIndex++;
      }
      return result.trim();
    };

    const [integerPart, decimalPart] = num.toString().split('.');
    let words = handleWholeNumber(parseInt(integerPart)) + ' Rupees';

    if (decimalPart) {
      const decimalWords = handleWholeNumber(parseInt(decimalPart));
      words += ' and ' + decimalWords + ' Paise';
    }

    return words + ' Only,';
  }

  const netAmountInWords = numberToWords(amount);
  const rules = [
    {
      rule: `હું પોતે બાહેંધરી આપું છું કે મેં આજ રોજ તારીખ ${fDate(sansaction?.issueDate)} ના રોજ ગીરવી મુકેલા ટોટલ ${qty} નંગ દાગીના નું ટોટલ વજન ${totalWight.toFixed(2)} અને નેટ વજન ${netWight.toFixed(2)} છે.જે મારી પોતાની માલીકી નું છે .જે મેં ${sansaction.jewellerName} જવેલર્સ માંથી બનાવેલ છે.જેની સંપૂર્ણં જવાબદારી મારી છે .`,
    },
    {
      rule: `આ ગોલ્ડ પર બીજી કોઈ વ્યકતિ નો હક કે હિસ્સો નથી છતાં પણ મેં ગોલ્ડ લોન લીધા પછી ગોલ્ડ બાબતે કોઈપણ વ્યક્તિ નો હક કે હિસ્સો જાહેર થાય અથવા કોઈ પણ જાત ની તકરાર આવે તો મને લોન પેટે મળેલ રકમ રૂ .${amount.toFixed(2)} શબ્દોમાં ${netAmountInWords} હું મારી કોઈ પણ જાત ની કફોડી હાલત માં પણ ભરપાઈ કરવા માટે રાજીખુશી થી બંધાયેલો છું.જો ભરપાઈ ન કરી શકું તો કંપની મારી મીલકત પર દાવો માંડીને કાયદેસરની કાર્યવાહી કરી શકે છે.જે મને મંજુર છે.`,
    },
    {
      rule: `મેં કંપની ના બધા નીયમો પુરા હોશં માં વાંચી વંચાવી જાગૃત મતે સમજેલ છે. જે મને (કબુલ) મંજુર છે.જેની હું બાહેંધરી આપું છું.`,
    },
  ];

  return (
    <>
      <Document>
        <Page size="A4" style={styles.page}>
          <View style={{ border: '1px solid #000' }}>
            <View style={styles.watermarkContainer}>
              <Image src={logo} style={styles.watermarkImage} />
            </View>
            <InvoiceHeader branch={sansaction?.customer?.branch} configs={configs} />
            <View style={styles.pagePadding}>
              <View
                style={{
                  textAlign: 'center',
                  fontSize: 18,
                  marginRight: 25,
                  marginBottom: 10,
                }}
              >
                <Text
                  style={[
                    styles.termsAndConditionsHeaders,
                    { fontSize: 14, marginTop: 5, fontWeight: 'bold', paddingVertical: 0 },
                  ]}
                >
                  બાયંધરી પત્રક
                </Text>
              </View>
              <View style={styles.flexContainer}>
                <View style={{ width: '50%' }}>
                  <View style={styles.row}>
                    <Text style={styles.subHeading}>Loan No </Text>
                    <Text style={styles.colon}>:</Text>
                    <Text style={styles.subText}>{sansaction.loanNo}</Text>
                  </View>
                  <View style={styles.row}>
                    <Text style={styles.subHeading}>Loan Type </Text>
                    <Text style={styles.colon}>:</Text>
                    <Text style={styles.subText}>{sansaction.loanType}</Text>
                  </View>
                  <View style={styles.row}>
                    <Text style={styles.subHeading}>Name </Text>
                    <Text style={styles.colon}>:</Text>
                    <Text
                      style={styles.subText}
                    >{`${sansaction.customer.firstName} ${sansaction.customer.middleName} ${sansaction.customer.lastName}`}</Text>
                  </View>
                  <View style={styles.row}>
                    <Text style={styles.subHeading}>Address </Text>
                    <Text style={styles.colon}>:</Text>
                    <Text
                      style={{
                        ...styles.subText,
                        textWrap: 'wrap',
                      }}
                    >
                      {`${sansaction.customer.temporaryAddress.street} , ${sansaction.customer.temporaryAddress.landmark} , ${sansaction.customer.temporaryAddress.city} , ${sansaction.customer.temporaryAddress.zipcode}`.toUpperCase()}
                    </Text>
                  </View>
                  <View style={styles.row}>
                    <Text style={styles.subHeading}>Pan No </Text>
                    <Text style={styles.colon}>:</Text>
                    <Text style={styles.subText}>{sansaction.customer.panCard}</Text>
                  </View>
                  <View style={styles.row}>
                    <Text style={styles.subHeading}>Aadhar Card No </Text>{' '}
                    <Text style={styles.colon}>:</Text>
                    <Text style={styles.subText}>{sansaction.customer.aadharCard}</Text>
                  </View>
                  <View style={styles.row}>
                    <Text style={styles.subHeading}>Mobile No </Text>
                    <Text style={styles.colon}>:</Text>
                    <Text style={styles.subText}>{sansaction.customer.contact}</Text>
                  </View>
                </View>
                <View
                  style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 10 }}
                >
                  <Image style={styles.img} src={sansaction.customer.avatar_url} />
                  <Image style={styles.img} src={sansaction.propertyImage} />
                </View>
              </View>
              <View style={styles.tableFlex}>
                <View style={styles.table}>
                  <View style={[styles.tableRow, styles.tableHeader]}>
                    <Text style={{ ...styles.tableCell, fontWight: 900 }}>તારીખ</Text>
                    <Text style={styles.tableCell}>અમોઉન્ટ</Text>
                    <Text style={styles.tableCell}>દાગીના</Text>
                    <Text style={styles.tableCell}>સહી</Text>
                    <Text style={styles.tableCell}>કસ્ટમર ની સહી</Text>
                    <Text style={styles.tableCell}>વિગત</Text>
                  </View>
                  <View>
                    {Array.from({ length: 5 }).map((_, index) => (
                      <View key={index} style={[styles.tableRow, styles.tableRowBorder]}>
                        {Array.from({ length: 6 }).map((_, cellIndex) => (
                          <Text key={cellIndex}></Text>
                        ))}
                      </View>
                    ))}
                  </View>
                  <View>
                    <Text
                      style={{
                        ...styles.gujaratiText,
                        fontSize: 10,
                        fontWight: 'bolder',
                        marginTop: 20,
                      }}
                    >
                      {
                        'ઉપરોકત દર્શાવેલ માહિતી પ્રમાણે મેં અહીં ગીરવી મુકેલા દાગીનાઓમાંથી તમામ દાગીનાઓ મને કોઈ પણ જાતની છેડછાડ વગર પરીપૂંર્ણ હાલતમાં મને મળી ગયેલ છે.જેની હું આપને લેખીત માં બાહેંધરી આપું છું.'
                      }
                    </Text>
                  </View>
                  <view>
                    <Text
                      style={[
                        styles.termsAndConditionsHeaders,
                        styles.gujaratiText,
                        { fontWeight: 600 },
                      ]}
                    >
                      નમૂનો-૮ કરજ ની શરતોની વીગતો દર્શાવતું વિવરણ પત્રક નિયમ -૧૬
                    </Text>
                    <View style={{ marginTop: 10 }}>
                      {rules.map((item, index) => (
                        <View
                          key={index}
                          style={{
                            flexDirection: 'row',
                            alignItems: 'flex-start',
                            marginBottom: 4,
                          }}
                        >
                          <Text style={{ fontSize: 10, marginRight: 4, marginTop: 2 }}>•</Text>{' '}
                          <Text style={{ ...styles.gujaratiText, fontSize: 10 }}>
                            {item.rule}
                          </Text>{' '}
                        </View>
                      ))}
                    </View>
                  </view>
                </View>
              </View>
            </View>
            <View style={{ ...styles.d_flex, marginBottom: 52.5 }}>
              <Text style={{ ...styles.box2, marginLeft: 35 }}>Authority Sign</Text>
              <View style={{ marginRight: 35 }}>
                <View style={styles.box}></View>
                <Text style={styles.signText}>Customer Sign</Text>
              </View>
            </View>
          </View>
        </Page>
      </Document>
    </>
  );
}
