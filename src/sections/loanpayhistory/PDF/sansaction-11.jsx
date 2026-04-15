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
          height: '81.5%',
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
          // marginVertical: 2,
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
          marginTop: 3,
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
          paddingVertical: 5,
        },
        tableRow: {
          flexDirection: 'row',
          borderStyle: 'solid',
          paddingVertical: 8,
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
          fontSize: 12,
          textAlign: 'center',
          marginTop: 7,
        },
        d_flex: {
          display: 'flex',
          width: '100%',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 16.9,
        },
        signText: {
          fontSize: 11,
          borderTop: '1px solid 232C4B',
          color: '#232C4B',
          paddingTop: 10,
          textAlign: 'center',
          width: '100px',
          fontWeight: 600,
        },
      }),
    []
  );

// ----------------------------------------------------------------------

export default function Sansaction11({ sansaction, configs }) {
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

  const month =
    sansaction.scheme.renewalTime === 'Monthly'
      ? 1
      : sansaction.scheme.renewalTime === 'yearly'
        ? 12
        : parseInt(sansaction.scheme.renewalTime.split(' ')[0], 10) || 0;

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
      rule: `હું પોતે બાહેંધરી આપું છું કે મેં આજ રોજ તારીખ ${fDate(sansaction?.issueDate)} ના રોજ ગિરવે મુકેલા ટોટલ ${qty} નંગ દાગીના નું ટોટલ વજન ${totalWight} અને નેટ વજન ${netWight} છે.જે મારી પોતાની માલિકી નું છે .જે મેં ${sansaction.jewellerName} જવેલર્સ માંથી બનાવેલ છે.જેની સંપૂર્ણં જવાબદારી મારી છે .`,
    },
    {
      rule: `આ ગોલ્ડ પર બીજી કોઈ વ્યકતિ નો હક કે હિસ્સો નથી છતાં મેં પણ ગોલ્ડ લોન લીધા પછી ગોલ્ડ બાબતે કોઈપણ વ્યક્તિ નો હક કે હિસ્સો જાહેર થાય અથવા કોઈ પણ જાત ની તકરાર આવે તો મને લોન પેટે મળેલ રકમ રૂ .${amount} શબ્દોમાં ${netAmountInWords} હું મારી કોઈ પણ જાત ની કફોડી હાલત માં પણ ભરપાઈ કરવા માટે રાજીખુશી થી બંધાયેલો છું.જો ભરપાઈ ન કરી શકું તો કંપની મારી મિલકત પર દાવો માંડીને કાયદેસરની કાર્યવાહી કરી શકે છે.જે મને મંજુર છે..`,
    },
    {
      rule: `મેં કંપની ના બધા નિયમો પુરા હોશ માં વાંચી જાગૃત મતે સમજેલ છે. જે મને (કબુલ) મંજુર છે.જેની હું બાહેંધરી આપું છું.`,
    },
  ];

  const rules2 = [
    {
      rule: `બેંક બંધના દિવસે દાગીના પરત મળશે નહિ.`,
    },
    {
      rule: `દર મહીને વ્યાજ ભરી જવું.`,
    },
    {
      rule: `આપેલ બીલ સાથે લેતા આવવું.`,
    },
    {
      rule: `સરનામું બદલે ત્યારે ફેરફાર કરાવી જવું.`,
    },
    {
      rule: `દર રવીવારે ઓફીસ બંધ રહેશે.`,
    },
    {
      rule: `કરજ ની રકમ ભર્યા પછી જે વ્યક્તિના નામનું બિલ હશે તે વ્યક્તિને જ દાગીના પરત મળશે.`,
    },
    {
      rule: `નક્કી કરેલી મુદત પુરી થયા બાદ નાણાં વસુલ આપનાર પાસે ચક્રવૃદ્ધિ વ્યાજ વસુલ કરવામાં આવશે.`,
    },
    {
      rule: `(દાગીના સુરક્ષિત સ્થળે મુકેલા હોવાથી કરજ ની રકમ ભર્યા પછી બીજા દિવસે દાગીના પરત મળશે)`,
    },
  ];

  const specification = [
    {
      heading: `ખેતી વિષયક કરજ`,
      specification: `પાકના વાવેતર, ઉત્પાદન અને ખેતી સાથે સંબંધ ધરાવતા હેતુઓ માટે ધીરેલું કરજ.`,
    },
    {
      heading: `ઔદ્યોગિક કરજ`,
      specification: `માલ બનાવવાના હેતુઓ માટે ધીરેલું કરજ .`,
    },
    {
      heading: `વેપારી કરજ`,
      specification: `વેપાર, મિલકત ખરીદ અને વેચાણ માટે ધીરેલુ કરજ .`,
    },
    {
      heading: 'અંગત કરજ',
      specification:
        'લગ્નની વૃત્તિઓ , ધાર્મિક ક્રીયા , દેવા ભરપાઈ કરવા અંને અંગત જરૂરિયાતો માટે ધીરેલુ કરજ .',
    },
    {
      heading: `પ્રકીર્ણ  કરજ `,
      specification: `૧ થી ૪ માં સમાવેશ ન થયેલ હેતુઓ માટે ધીરેલુ કરજ.`,
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
              <View>
                {' '}
                <Text
                  style={[
                    styles.termsAndConditionsHeaders,
                    styles.gujaratiText,
                    { fontWeight: 'bold' },
                  ]}
                >
                  નમૂનો-૧૧ કરજ શરતોની વીગતો દર્શાવતું વિવરણ પત્રક નિયમ -૧૪
                </Text>
              </View>
              <View
                style={{
                  flexDirection: 'row',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginTop: 7,
                }}
              >
                <View style={{ width: '60%' }}>
                  <Text style={{ ...styles.spacing, marginTop: -6 }}>
                    <Text style={{ ...styles.gujaratiText, fontSize: 11 }}>બિલ નં. : </Text>{' '}
                    <Text style={styles.subText}>{sansaction.loanNo}</Text>
                    {'             '}
                    <View style={{ textAlign: 'center' }}>
                      <Text style={{ ...styles.gujaratiText, fontSize: 11 }}>
                        લા નં. : GMLSUR2425000018
                      </Text>
                    </View>
                  </Text>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 5 }}>
                    <Text
                      style={{
                        ...styles.gujaratiText,
                        fontSize: 11,
                        flex: 0.7,
                      }}
                    >
                      ૧. દેણદાર નું નામ
                    </Text>
                    <Text style={styles.colon}>:</Text>
                    <Text
                      style={{
                        flex: 2,
                        fontSize: 10,
                        marginBottom: 5,
                      }}
                    >
                      {`${sansaction.customer.firstName} ${sansaction.customer.middleName} ${sansaction.customer.lastName}`}
                    </Text>
                  </View>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 5 }}>
                    <Text style={{ ...styles.gujaratiText, fontSize: 11, flex: 0.7 }}>
                      ૨. દેણદાર નું સરનામું
                    </Text>
                    <Text style={styles.colon}>:</Text>
                    <Text
                      style={{
                        ...styles.subText,
                        flex: 2,
                      }}
                    >
                      {`${sansaction.customer.temporaryAddress.street}, ${sansaction.customer.temporaryAddress.landmark}, ${sansaction.customer.temporaryAddress.city}, ${sansaction.customer.temporaryAddress.zipcode}`.toUpperCase()}
                    </Text>
                  </View>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 5 }}>
                    <Text style={{ ...styles.gujaratiText, fontSize: 11, flex: 0.7 }}>
                      ૩. કરજ ની રકમ
                    </Text>
                    <Text style={styles.colon}>:</Text>
                    <Text style={{ ...styles.subText, flex: 2 }}>{sansaction.loanAmount}/-</Text>
                  </View>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 5 }}>
                    <Text style={{ ...styles.gujaratiText, fontSize: 11, flex: 0.7 }}>
                      ૪. ધીર્યા ની તારીખ
                    </Text>
                    <Text style={styles.colon}>:</Text>
                    <Text style={{ ...styles.subText, flex: 2, marginTop: -3 }}>
                      {fDate(sansaction.issueDate)}
                      {'             '}
                      <Text style={{ ...styles.gujaratiText, fontSize: 11 }}>
                        સવંત : {sansaction.savant}
                      </Text>
                    </Text>
                  </View>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 5 }}>
                    <Text
                      style={{
                        ...styles.gujaratiText,
                        fontSize: 11,

                        flex: 0.7,
                      }}
                    >
                      ૪-અ. કરજ નો પ્રકાર
                    </Text>
                    <Text style={styles.colon}>:</Text>
                    <Text
                      style={{
                        ...styles.subText,
                        flex: 2,
                        marginBottom: 5,
                        ...styles.gujaratiText,
                        marginTop: -3,
                      }}
                    >
                      ખેતી વિષયક,ઔદ્યોગિક વેપારી, <Text style={{ fontSize: 11 }}>અં</Text>ગત કે
                      પ્રકીર્ણ કરજ
                    </Text>
                  </View>
                  <Text style={styles.spacing}>
                    <Text style={{ ...styles.gujaratiText, fontSize: 11 }}>
                      {`૫. કરજ પાકવાની મુદ્ત માસ ${month} ની છે .`}
                    </Text>
                  </Text>
                  <Text style={styles.spacing}>
                    <Text style={{ ...styles.gujaratiText, fontSize: 11 }}>
                      ૬. વાર્ષિક વ્યાજ દર{' '}
                      {(
                        sansaction.scheme.interestRate * 12 -
                        sansaction.consultingCharge * 12
                      ).toFixed(2)}{' '}
                      ટકા.
                    </Text>
                  </Text>
                  <Text style={styles.spacing}>
                    <Text style={{ ...styles.gujaratiText, fontSize: 11 }}>૭. તારણ નો પ્રકાર</Text>
                  </Text>
                  <Text style={styles.spacing}>
                    <Text style={{ ...styles.gujaratiText, fontSize: 11 }}>સોનાના મુદ્દા</Text>
                  </Text>
                </View>
                <View style={{ width: '40%' }}>
                  <View style={{ textAlign: 'center', marginBottom: 5 }}>
                    <Text
                      style={{
                        fontSize: 10,
                      }}
                    >
                      <Text style={{ ...styles.gujaratiText, fontSize: 10 }}>તા.</Text>
                      {fDate(sansaction.issueDate)}
                    </Text>
                  </View>
                  <View
                    style={{
                      flexDirection: 'row',
                      display: 'flex',
                      justifyContent: 'center',
                    }}
                  >
                    <Image style={styles.img} src={sansaction.propertyImage} />
                  </View>
                  <View style={{ textAlign: 'center', margin: '5px 0px 5px 0px', width: '100%' }}>
                    <Text style={{ ...styles.gujaratiText, fontSize: 12 }}>
                      (વજન તારણની અંદાજેલી કિંમત વિ.)
                    </Text>
                  </View>
                  <View style={[styles.tableRow, styles.tableHeader]}>
                    <Text style={[styles.tableCell, styles.gujaratiText]}>ટોટલ વજન ગ્રા.</Text>
                    <Text style={styles.tableCell}>નેટ વજન ગ્રા.</Text>
                    <Text style={styles.tableCell}>ટોટલ નંગ </Text>
                  </View>
                  <View
                    style={[
                      {
                        ...styles.tableRow,
                        paddingVertical: 5,
                        ...styles.tableRowBorder,
                      },
                    ]}
                  >
                    <Text style={styles.tableCell}>{totalWight.toFixed(2)}</Text>
                    <Text style={styles.tableCell}>{netWight.toFixed(2)}</Text>
                    <Text style={styles.tableCell}>{qty}</Text>
                  </View>
                </View>
              </View>
              <View>
                <Text
                  style={{
                    ...styles.gujaratiText,
                    fontSize: 11,
                    marginTop: 10,
                    fontWeight: 'bold',
                  }}
                >
                  હું નીચે સહી કરનાર પ્રતીજ્ઞાપૂર્વક જણાવું છુ કે આ દાગીના ચોરીના નથી મારી પોતાની
                  માલીકીના છે.તેની સર્વ જવાબદારી મારી છે આ બિલની બધી જ શરતો મેં વાંચી છે,તે મને કબુલ
                  છે.
                </Text>
              </View>
              <View>
                <Text
                  style={{
                    ...styles.gujaratiText,
                    fontWight: 900,
                    fontSize: 14,
                    marginTop: 8,
                    color: '#232C4B',
                    textDecoration: 'underline',
                    textDecorationColor: '#232C4B',
                  }}
                >
                  નિયમો :-
                </Text>
                <View style={{ marginTop: 5 }}>
                  {rules2.map((item, index) => (
                    <View
                      key={index}
                      style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 2 }}
                    >
                      <Text style={{ fontSize: 10, marginRight: 4 }}>•</Text> {/* Bullet point */}
                      <Text
                        style={{
                          ...styles.gujaratiText,
                          fontSize: 11,
                          fontWeight: [1, 3, 7].includes(index) ? 'bold' : 'normal',
                          marginTop: -3,
                        }}
                      >
                        {item.rule}
                      </Text>{' '}
                    </View>
                  ))}
                </View>
              </View>
              <View>
                <Text
                  style={{
                    ...styles.gujaratiText,
                    fontSize: 14,
                    marginTop: 8,
                    color: '#232C4B',
                    textDecoration: 'underline',
                    textDecorationColor: '#232C4B',
                  }}
                >
                  સ્પષ્ટીકરણ :-
                </Text>
                <View style={{ marginTop: 5 }}>
                  {specification.map((item, index) => (
                    <View key={index} style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                      <Text style={{ fontSize: 10, marginRight: 4 }}>•</Text>
                      <View
                        style={{ flexDirection: 'row', flex: 1, marginTop: -3, marginBottom: 2 }}
                      >
                        <Text
                          style={{
                            ...styles.gujaratiText,
                            fontSize: 12,
                            width: 80,
                          }}
                        >
                          {item.heading}
                        </Text>
                        <Text
                          style={{
                            ...styles.gujaratiText,
                            fontSize: 12,
                          }}
                        >
                          :
                        </Text>
                        <Text
                          style={{
                            ...styles.gujaratiText,
                            fontSize: 11,
                            marginLeft: 4,
                            marginTop: 2,
                          }}
                        >
                          {item.specification}
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            </View>
            <View style={{ ...styles.d_flex, marginBottom: 32.5 }}>
              <Text style={{ ...styles.signText, marginLeft: 35 }}>Authority Sign</Text>
              <Text style={{ ...styles.signText, marginRight: 35 }}>Easy Gold FinCorp</Text>
            </View>
          </View>
        </Page>
      </Document>
    </>
  );
}
