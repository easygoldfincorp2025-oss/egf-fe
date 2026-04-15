import React, { useMemo } from 'react';
import address from 'src/assets/icon/icons8-location-50.png';
import background from 'src/assets/icon/Frame 1@2x (1).png';
import { Page, View, Text, Image, Document, StyleSheet, Font, Link } from '@react-pdf/renderer';

Font.register({
  family: 'Roboto',
  fonts: [{ src: '/fonts/Roboto-Regular.ttf' }, { src: '/fonts/Roboto-Bold.ttf' }],
});

const useStyles = () =>
  useMemo(
    () =>
      StyleSheet.create({
        page: {
          padding: 40,
          fontSize: 10,
          fontFamily: 'Roboto',
        },
        headerbox2: {
          position: 'absolute',
          top: '-45px',
          right: 0,
          width: '80%',
          height: '100px',
          backgroundColor: '#5B9BD4',
          borderTopLeftRadius: '50%',
          borderBottomLeftRadius: '50%',
        },
        headerText: {
          color: '#fff',
          fontWeight: 'bold',
          flexShrink: 1,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          width: '100%',
          fontSize: '24px', // Default font size
        },

        dynamicHeaderText: {
          color: '#fff',
          fontWeight: 'bold',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          width: '100%',
          textAlign: 'left',
        },

        companyNameContainer: {
          flex: 1.5,
          justifyContent: 'center',
          alignItems: 'center',
        },
        headerDetailsParent: {
          margin: '60px 30px',
          color: '#fff',
        },
        headerDetails: {
          color: '#fff',
          fontSize: 11,
        },
        icon: {
          height: '10px',
          width: '10px',
        },
        rowContainer: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 2,
          marginBottom: 8,
        },
        flexContainer: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          width: '100%',
        },
        separator: {
          marginHorizontal: 2,
          fontSize: '10px',
          fontWeight: '400',
        },
        header: {
          width: '100%',
          position: 'relative',
          overflow: 'hidden',
        },
        backgroundImage: {
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
        },
        headerbox1Parent: {
          position: 'relative',
          zIndex: 1,
          width: '100%',
          height: '100%',
        },
        headerbox1: {
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          paddingLeft: 6,
        },
        logoParent: {
          borderRadius: '10px',
          overflow: 'hidden',
          marginRight: 5,
        },
        logo: {
          height: '100%',
          width: '100%',
          objectFit: 'contain',
        },
        companyName: {
          fontSize: 24,
          color: '#fff',
          fontWeight: 'bold',
        },
        letterSpacingText: {
          letterSpacing: 6,
        },
      }),
    []
  );

export default function InvoiceHeader({ configs, landscape,branch }) {
  const styles = useStyles();
  const logo = configs?.company?.logo_url;
  const company = configs?.headersConfig?.companyDetail;
  const webUrl = configs?.headersConfig?.companyDetail?.webUrl;
  const branchAddress = typeof (branch) === 'object'
    ? `${branch?.address?.street}, ${branch?.address?.landmark}, ${branch?.address?.city}`
    : '';
  const branchName = branch?.name || 'Branch Name Not Available';
  const branchCode = branch?.branchCode || 'Branch Code Not Available';
  const branchEmail = branch?.email || 'Email Not Available';
  const branchContact = branch?.contact || 'Contact Not Available';

  return (
    <View style={{ ...styles.header, height: landscape ? 120 : 100 }}>
      <View style={styles.headerbox1Parent}>
        <Image style={styles.backgroundImage} src={background} />
        <View
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            marginTop: 9,
          }}
        >
          <View style={styles.headerbox1}>
            <View
              style={{
                ...styles.logoParent,
                height: landscape ? 82 : 64,
                width: landscape ? 82 : 64,
              }}
            >
              <Image style={styles.logo} src={logo} />
            </View>

            {/* Center: Company Name */}
            <View style={{ marginTop: 5 }}>
              <Text
                style={{
                  ...styles.companyName,
                  fontSize: landscape ? '38px' : '30px',
                }}
              >
                {/*{company?.name ? company.name.split(' ').slice(0, -1).join(' ') : 'EASY GOLD'}*/}
                {company?.name}
              </Text>
              <Text
                style={{
                  // ...styles.letterSpacingText,
                  fontSize: landscape ? 15 : 12,
                  // fontSize: company?.name?.length > 17 ? '12px' : '14px',
                  color: '#fff',
                  marginLeft: 60,
                  marginTop: 2,
                }}
              >
                "LEASE YOUR GOLD WITH EASY"
                {/*{company?.name ? company.name.split(' ').pop() : 'FINCORP'}*/}
              </Text>
            </View>
          </View>
        </View>
        {typeof (branch) === 'object' &&
          <View
            style={{
              fontSize: '10px',
              flexDirection: 'row',
              textWrap: 'wrap',
              // paddingRight: 10,
              marginTop: landscape ? 14 : 13,
              marginLeft: 10,
            }}
          >
            <Image style={styles.icon} src={address} />
            <Text style={styles.separator}>|</Text>
            <Text style={{ fontSize: 9, fontWeight: 600 }}>{branchAddress.toUpperCase()}</Text>
          </View>
        }
      </View>
    </View>
  );
}
