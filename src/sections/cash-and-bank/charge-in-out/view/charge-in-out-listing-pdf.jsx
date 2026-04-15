import React, { useMemo } from 'react';
import { Document, Font, Page, StyleSheet, Text, View } from '@react-pdf/renderer';
import InvoiceHeader from '../../../../components/invoise/invoice-header.jsx';
import { fDate } from '../../../../utils/format-time.js';

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
          fontSize: 10,
        },
        title: {
          color: '#232C4B',
          borderBottom: '1px solid #232C4B',
          fontWeight: 'bold',
          textWrap: 'nowrap',
          fontSize: 14,
          textAlign: 'center',
          paddingVertical: 6,
          marginHorizontal: 12,
          marginTop: 10,
        },
        table: {
          // width: '100%',
          display: 'flex',
          flexDirection: 'column',
          borderWidth: 1,
          borderColor: '#b1b0b0',
          margin: 12,
        },
        row: {
          flexDirection: 'row',
          minHeight: 24,
          borderBottomWidth: 0.5,
          borderBottomColor: '#c7c6c6',
          pageBreakInside: 'avoid',
        },
        header: {
          backgroundColor: '#5B9BD4',
          fontWeight: 'bold',
          color: '#000',
          textAlign: 'center',
          minHeight: 26,
        },
        cell: {
          padding: 6,
          borderRightWidth: 0.5,
          borderRightColor: '#b1b0b0',
          textAlign: 'center',
          fontSize: 9,
          // flex: 1,
        },
        lastCell: { borderRightWidth: 0, textAlign: 'center' },
        alt: { backgroundColor: '#F2F2F2' },
        totalRow: { backgroundColor: '#E8F0FE' },
        green: { color: '#008000' },
        red: { color: '#FF0000' },
      }),
    []
  );

export default function ChargeInOutListingPdf({ configs, chargeTypeTotals }) {
  const styles = useStyles();

  const grandTotal = (chargeTypeTotals || []).reduce((sum, r) => sum + Number(r.amount || 0), 0);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <InvoiceHeader configs={configs} />
        <View style={{ position: 'absolute', top: 20, right: 0, width: 100 }}>
          <Text>{`Date : ${fDate(new Date)}`}</Text>
        </View>
        <View>
          <Text style={styles.title}>CHARGE LISTING</Text>
        </View>
        <View style={styles.table}>
          <View style={[styles.row, styles.header]}>
            <Text style={[styles.cell, { flex: 0.2 }]}>#</Text>
            <Text style={[styles.cell, { flex: 3 }]}>Charge Name</Text>
            <Text style={[styles.cell, styles.lastCell, { flex: 1.2 }]}>Amount</Text>
          </View>
          {(chargeTypeTotals || []).map((row, idx) => {
            const isPositive = Number(row.amount || 0) >= 0;
            return (
              <View key={idx} style={[styles.row, idx % 2 ? styles.alt : null]}>
                <Text style={[styles.cell, { flex: 0.2 }]}>{idx + 1}</Text>
                <Text style={[styles.cell, { flex: 3 }]}>{row.chargeType || '-'}</Text>
                <Text
                  style={[
                    styles.cell,
                    styles.lastCell,
                    { flex: 1.2 },
                    isPositive ? styles.green : styles.red,
                  ]}
                >
                  {Math.abs(Number(row.amount || 0)).toFixed(2)}
                </Text>
              </View>
            );
          })}
        </View>
      </Page>
    </Document>
  );
}
