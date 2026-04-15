import PropTypes from 'prop-types';
import { TableCell, TableRow } from '@mui/material';
import { fDate } from '../../../utils/format-time';

// ----------------------------------------------------------------------

export default function OtherInterestEntryReportsTableRow({ row }) {
  return (
    <>
      <TableRow hover>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.otherLoan.code || 0}</TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.otherLoan.loan.loanNo}</TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.otherLoan.otherNumber}</TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{fDate(row.from)}</TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{fDate(row.to)}</TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.days > 0 ? row.days : 0}</TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.otherLoan.otherLoanAmount}</TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>
          {' '}
          {(Number(row.payAfterAdjust) - Number(row.charge || 0)).toFixed(2)}
        </TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.charge || 0}</TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>
          {((Number(row.payAfterAdjust) || 0)).toFixed(2)}
        </TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.paymentDetail.paymentMode || '-'}</TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.paymentDetail.cashAmount || 0}</TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.paymentDetail.bankAmount || 0}</TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.paymentDetail.bankName || '-'}</TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{fDate(row.createdAt)}</TableCell>
      </TableRow>
    </>
  );
}

OtherInterestEntryReportsTableRow.propTypes = {
  onDeleteRow: PropTypes.func,
  row: PropTypes.object,
  selected: PropTypes.bool,
  loanStatus: PropTypes.string,
};
