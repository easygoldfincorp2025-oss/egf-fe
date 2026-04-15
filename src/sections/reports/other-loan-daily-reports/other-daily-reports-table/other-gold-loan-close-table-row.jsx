import PropTypes from 'prop-types';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import { fDate } from '../../../../utils/format-time';

// ----------------------------------------------------------------------

export default function OtherGoldLoanCloseTableRow({
  row,
  index,
  selected,
  onEditRow,
  onSelectRow,
  onDeleteRow,
  handleClick,
}) {
  const { otherLoan } = row;
  const {
    date,
    otherName,
    loan,
    otherNumber,
    percentage,
    otherCharge,
    cashAmount,
    bankAmount,
    amount,
    createdAt,
    closeDate,
    closingAmount,
  } = otherLoan;
  const { loanNo, customer } = loan;

  return (
    <>
      <TableRow hover selected={selected}>
        <TableCell sx={{ padding: '6px' }}>{row.otherLoan.code || 0}</TableCell>
        <TableCell sx={{ padding: '6px' }}>{fDate(date)}</TableCell>
        <TableCell sx={{ padding: '6px' }}>{loanNo}</TableCell>
        <TableCell sx={{ padding: '6px' }}>
          {`${customer?.firstName || ''} ${customer?.middleName || ''} ${customer?.lastName || ''}`}
        </TableCell>
        <TableCell sx={{ padding: '6px' }}>{otherName}</TableCell>
        <TableCell sx={{ padding: '6px' }}>{otherNumber}</TableCell>
        <TableCell sx={{ padding: '6px' }}>{amount}</TableCell>
        <TableCell sx={{ padding: '6px' }}>{percentage}</TableCell>
        <TableCell sx={{ padding: '6px' }}>{otherCharge}</TableCell>
        <TableCell sx={{ padding: '6px' }}>{cashAmount}</TableCell>
        <TableCell sx={{ padding: '6px' }}>{bankAmount}</TableCell>
        <TableCell sx={{ padding: '6px' }}>{closingAmount}</TableCell>
        <TableCell sx={{ padding: '6px' }}>{fDate(closeDate)}</TableCell>
        <TableCell sx={{ padding: '6px' }}>{fDate(createdAt)}</TableCell>
      </TableRow>
    </>
  );
}

OtherGoldLoanCloseTableRow.propTypes = {
  onDeleteRow: PropTypes.func,
  onEditRow: PropTypes.func,
  onSelectRow: PropTypes.func,
  row: PropTypes.object,
  selected: PropTypes.bool,
};
