import React, { useMemo } from 'react';
import { Document, Font, Page, StyleSheet, Text, View } from '@react-pdf/renderer';
import InvoiceHeader from '../../../../../components/invoise/invoice-header.jsx';
import { fDate } from 'src/utils/format-time.js';

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
          position: 'relative',
          paddingBottom: 12,
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
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          borderWidth: 1,
          borderColor: '#b1b0b0',
        },
        tableRow: {
          flexDirection: 'row',
          minHeight: 22,
          borderBottomWidth: 0.5,
          borderBottomColor: '#c7c6c6',
          pageBreakInside: 'avoid',
        },
        lastTableRow: {
          borderBottomWidth: 0,
        },
        tableHeader: {
          backgroundColor: '#5B9BD4',
          fontWeight: 'bold',
          color: '#000',
          textAlign: 'center',
        },
        tableCell: {
          padding: 5,
          borderRightWidth: 0.5,
          borderRightColor: '#b1b0b0',
          textAlign: 'center',
        },
        tableCellLast: {
          borderRightWidth: 0,
        },
        alternateRow: {
          backgroundColor: '#F2F2F2',
        },
        headerBar: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: 6,
          marginHorizontal: 12,
        },
        meta: {
          fontSize: 9,
        },
        totalsBar: {
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 16,
          marginTop: 8,
        },
      }),
    []
  );

export default function PartiesPdf({ configs, party, filters }) {
  const styles = useStyles();

  const headers = [
    { label: '#', flex: 0.2 },
    { label: 'Party', flex: 2 },
    { label: 'Balance', flex: 0.8 },
  ];

  const rowsPerPageFirst = 22;
  const rowsPerPageOther = 26;

  const remainingRows = (party?.length || 0) - rowsPerPageFirst;
  const additionalPages = Math.ceil(Math.max(0, remainingRows) / rowsPerPageOther);

  const receivableAmt = party?.reduce(
    (prev, next) => prev + (Number(next.amount <= 0 && next?.amount) || 0),
    0
  );
  const payableAmt = party?.reduce(
    (prev, next) => prev + (Number(next.amount >= 0 && next?.amount) || 0),
    0
  );

  const renderTableHeader = () => (
    <View style={[styles.tableRow, styles.tableHeader]}>
      {headers.map((header, i) => (
        <Text
          key={i}
          style={[styles.tableCell, { flex: header.flex }, i === headers.length - 1 ? styles.tableCellLast : {}]}
        >
          {header.label}
        </Text>
      ))}
    </View>
  );

  const renderRow = (row, index, isLastRow) => {
    const isAlternateRow = index % 2 !== 0;
    const amountNum = Number(row?.amount ?? 0);
    const amountColor = amountNum >= 0 ? 'red' : 'green';
    return (
      <View
        key={index}
        style={[
          styles.tableRow,
          isAlternateRow ? styles.alternateRow : {},
          isLastRow ? styles.lastTableRow : {},
        ]}
        wrap={false}
      >
        <Text style={[styles.tableCell, { flex: 0.2 }]}>{index + 1}</Text>
        <Text style={[styles.tableCell, { flex: 2 }]}>{row?.name || '-'}</Text>
        <Text style={[styles.tableCell, { flex: 0.8, color: amountColor }]}>
          {Math.abs(amountNum).toFixed(2)}
        </Text>
      </View>
    );
  };

  const pages = [];

  // First page
  const firstPageRows = (party || [])
    .slice(0, rowsPerPageFirst)
    .map((row, index) =>
      renderRow(row, index, index === rowsPerPageFirst - 1 && (party?.length || 0) === rowsPerPageFirst)
    );

  pages.push(
    <Page key={0} size="A4" style={styles.page} orientation="portrait">
      <InvoiceHeader configs={configs} />
      <View style={{ position: 'absolute', top: 20, right: 0, width: 100 }}>
        <Text>{`Date : ${fDate(new Date)}`}</Text>
      </View>
      <View>
        <Text style={styles.title}>PARTY LISTING</Text>
      </View>
      <View style={styles.totalsBar}>
        <Text style={{ fontSize: 11, fontWeight: 'bold' }}>
          Receivable: <Text style={{ color: 'green' }}>{Math.abs(receivableAmt || 0).toFixed(2)}</Text>
        </Text>
        <Text style={{ fontSize: 11, fontWeight: 'bold' }}>
          Payable: <Text style={{ color: 'red' }}>{Math.abs(payableAmt || 0).toFixed(2)}</Text>
        </Text>
      </View>
      <View style={{ flexGrow: 1, padding: 12 }}>
        <View style={styles.table}>
          {renderTableHeader()}
          {firstPageRows}
        </View>
      </View>
    </Page>
  );

  if ((party?.length || 0) > rowsPerPageFirst) {
    for (let pageIndex = 0; pageIndex < additionalPages; pageIndex++) {
      const startIndex = rowsPerPageFirst + pageIndex * rowsPerPageOther;
      const endIndex = Math.min(startIndex + rowsPerPageOther, party.length);

      const pageRows = party.slice(startIndex, endIndex).map((row, index) => {
        const actualIndex = startIndex + index;
        return renderRow(row, actualIndex, actualIndex === party.length - 1);
      });

      pages.push(
        <Page key={pageIndex + 1} size="A4" style={styles.page} orientation="portrait">
          <View style={{ flexGrow: 1, padding: 12 }}>
            <View style={styles.table}>
              {renderTableHeader()}
              {pageRows}
            </View>
          </View>
        </Page>
      );
    }
  }

  return <Document>{pages}</Document>;
}


