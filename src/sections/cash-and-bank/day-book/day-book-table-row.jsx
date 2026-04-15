import PropTypes from 'prop-types';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import Label from 'src/components/label/index.js';
import { fDate } from '../../../utils/format-time.js';
import { Box } from '@mui/system';
import { statusColorMap } from '../../../assets/data/index.js';
import React from 'react';

// ----------------------------------------------------------------------

export default function DayBookTableRow({ row, selected, onEditRow, onSelectRow, onDeleteRow }) {

  return (
    <>
      <TableRow hover selected={selected}>
        <TableCell padding="checkbox">
          <TableCell sx={{ fontSize: '12px', textAlign: 'center' }}>
            <Box
              sx={{
                borderRadius: '50%',
                width: 8,
                height: 8,
                bgcolor: statusColorMap[row.status] || 'grey.400',
              }}
            />
          </TableCell>{' '}
        </TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{`${row.status}`}</TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>
          {row.ref ? `${row.detail} (${row.ref})` : row.detail}
        </TableCell>{' '}
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.allCategory || '-'}</TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{fDate(row.date)}</TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.paymentDetail?.paymentMode || '-'}</TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.paymentDetail?.cashAmount || 0}</TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.paymentDetail?.bankAmount || 0}</TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>
          {(() => {
            const acc =
              row?.paymentDetail ||  row?.paymentDetail?.account || row?.paymentDetail?.bankDetails?.account;

            if (!acc) return '-';

            return `${acc.bankName || 'N/A'} (${acc.accountHolderName || acc.accountNumber || 'N/A'})`;
          })()}
        </TableCell>
        <TableCell
          sx={{ whiteSpace: 'nowrap', color: row.category === 'Payment Out' ? 'red' : 'green' }}
        >
          {row.amount}
        </TableCell> <TableCell sx={{ whiteSpace: 'nowrap' }}>
        <Label
          variant="soft"
          color={
            (row.category === 'Payment Out' && 'error') ||
            (row.category === 'Payment In' && 'success') ||
            'default'
          }
        >
          {row.category}
        </Label>
      </TableCell>
      </TableRow>
    </>
  );
}

DayBookTableRow.propTypes = {
  onDeleteRow: PropTypes.func,
  onEditRow: PropTypes.func,
  onSelectRow: PropTypes.func,
  row: PropTypes.object,
  selected: PropTypes.bool,
};
