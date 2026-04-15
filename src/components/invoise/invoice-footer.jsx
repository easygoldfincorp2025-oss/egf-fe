import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import contact from 'src/assets/icon/icons8-phone-50.png';
import mail from 'src/assets/icon/icons8-letter-50.png';
import website from 'src/assets/icon/icons8-website-50.png';
import branchHeader from 'src/assets/icon/icons8-company-30.png';
import branchCodeHeader from 'src/assets/icon/icons8-branch-50.png';
import address from 'src/assets/icon/icons8-location-50.png';
import { Page, View, Text, Image, Document, StyleSheet, Font, Link } from '@react-pdf/renderer';
import logo from 'src/assets/logo/Logo Png.png';
import { useGetConfigs } from '../../api/config';
import { useSelector } from 'react-redux';
import footer from 'src/assets/icon/footter.jpeg';
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
        // header: {
        //   width: '100%',
        //   height: '126px',
        //   fontFamily: 'Roboto',
        //   // position: 'relative',
        //   // overflow: 'hidden',
        // },
        // headerbox1: {
        //   width: '65%',
        //   height: '126px',
        //   backgroundColor: '#FF7F27',
        //   borderTopRightRadius: '50%',
        //   borderBottomRightRadius: '50%',
        // },
        headerbox2: {
          // position: 'absolute',
          // top: '-45px',
          // right: 0,
          width: '100%',
          height: '61.5px',
          borderTopRightRadius: '50%',
          zIndex: 1,
          // borderBottomRiRadius: '50%',
        },
        // logoParent: {
        //   height: 94,
        //   width: 94,
        //   margin: '0px 0px 0px 5px ',
        // },
        // logo: {
        //   height: '100%',
        //   width: '100%',
        //   borderRadius: '5px',
        //   objectFit: 'contain',
        //   marginTop: 10,
        // },
        // headerText: {
        //   color: '#fff',
        //   fontSize: '24px',
        //   // marginLeft: '10px',
        //   fontWeight: 'bold',
        // },
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
          // marginLeft: 10,
          justifyContent: 'center',
          alignItems: 'center',
        },
        headerSubText: {
          color: '#fff',
          fontSize: '10px',
          fontWeight: 'bold',
          marginLeft: 5, // Spacing between icon and text
          marginRight: 5, // Optional, for alignment
        },
        headerDetailsParent: {
          // margin: '60px 30px',
          // color: '#fff',
        },
        headerDetails: {
          fontSize: 11,
        },
        icon: {
          height: '12px',
          width: '12px',
        },
        rowContainer: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 2,
          marginBottom: 8,
        },
        flexContainer: {
          flexDirection: 'row',
          display: 'flex',
          justifyContent: 'space-between',
          width: '60%',
          marginTop: 10,
          marginLeft: 10,
        },
        separator: {
          marginHorizontal: 2,
          fontSize: '10px',
          fontWeight: '400',
        },
        header: {
          width: '100%',
          height: '125px',
          position: 'relative', // To position the background image
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
          // flex: 1,
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          paddingLeft: 10,
        },
        logoParent: {
          height: 70,
          width: 70,
          borderRadius: '10px',
          overflow: 'hidden',
          marginRight: 10,
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
          textAlign: 'center',
          // flex: 1,
        },
        letterSpacingText: {
          letterSpacing: 16,
        },
      }),
    []
  );

export default function InvoiceFooter({ configs ,branch }) {
  const styles = useStyles();
  const logo = configs?.company?.logo_url;
  const company = configs?.headersConfig?.companyDetail;
  const webUrl = configs?.headersConfig?.companyDetail?.webUrl;
  const branchAddress = branch
    ? `${branch.address.street}, ${branch.address.landmark}, ${branch.address.city}`
    : '';
  const branchName = branch?.name || '-';
  const branchCode = branch?.branchCode || '-';
  const branchEmail = branch?.email || '-';
  const branchContact = branch?.contact || '-';
  return (
    <View style={styles.headerbox2}>
      <Image style={styles.backgroundImage} src={footer} />
      <View style={styles.headerDetailsParent}>
        <View style={styles.flexContainer}>
          {/* Column 1 */}
          <View style={{ width: 'auto' }}>
            <View style={styles.rowContainer}>
              <Image style={styles.icon} src={branchHeader} />
              <Text style={styles.separator}>|</Text>
              <Text style={styles.headerDetails}>{branchName}</Text>
            </View>
            <View style={{ ...styles.rowContainer, marginTop: 10 }}>
              <Image style={styles.icon} src={branchCodeHeader} />
              <Text style={styles.separator}>|</Text>
              <Text style={styles.headerDetails}>{branchCode}</Text>
            </View>
          </View>
          {/* Column 2 */}
          <View style={{ width: 'auto' }}>
            <View style={styles.rowContainer}>
              <Image style={styles.icon} src={mail || 'default_mail_icon'} />
              <Text style={styles.separator}>|</Text>
              <Text style={{ ...styles.headerDetails, textTransform: 'lowercase' }}>
                {branchEmail}
              </Text>
            </View>
            <View style={{ ...styles.rowContainer, marginTop: 10 }}>
              <Image style={styles.icon} src={website || 'default_website_icon'} />
              <Text style={styles.separator}>|</Text>
              <Text style={{ ...styles.headerDetails, textTransform: 'lowercase' }}>
                <Link src={webUrl} style={{ textDecoration: 'none', color: '#000' }}>
                  {webUrl}
                </Link>
              </Text>
            </View>
          </View>
          {/* Column 3 */}
          <View style={{ width: 'auto' }}>
            <View style={styles.rowContainer}>
              <Image style={styles.icon} src={contact || 'default_contact_icon'} />
              <Text style={styles.separator}>|</Text>
              <Text style={styles.headerDetails}>{branchContact}</Text>
            </View>
            <View style={{ ...styles.rowContainer, marginTop: 10 }}>
              <Image style={styles.icon} src={contact || 'default_contact_icon'} />
              <Text style={styles.separator}>|</Text>
              <Text style={styles.headerDetails}>{company?.contact || '-'}</Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}
