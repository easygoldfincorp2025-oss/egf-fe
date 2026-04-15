import PropTypes from 'prop-types';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import { fDate } from '../../../../utils/format-time';

// ----------------------------------------------------------------------

export default function OtherGoldLoanIntrestDetailseTableRow({
  row,
  index,
  selected,
  onEditRow,
  onSelectRow,
  onDeleteRow,
  handleClick,
}) {
  const { from, to, penalty, days, otherLoan, amountPaid } = row;
  const {
    date,
    otherName,
    loan,
    otherNumber,
    percentage,
    cashAmount,
    bankAmount,
    amount,
    createdAt,
  } = otherLoan;
  const { loanNo, customer, loanAmount, scheme, issueDate, interestLoanAmount } = loan;

  return (
    <>
      <TableRow hover selected={selected}>
        <TableCell sx={{ padding: '6px' }}>{row?.otherLoan?.code || 0}</TableCell>
        <TableCell sx={{ padding: '6px' }}>{fDate(date)}</TableCell>
        <TableCell sx={{ padding: '6px' }}>{loanNo}</TableCell>
        <TableCell sx={{ padding: '6px' }}>
          {`${customer?.firstName || ''} ${customer?.middleName || ''} ${customer?.lastName || ''}`}
        </TableCell>
        <TableCell sx={{ padding: '6px' }}>{otherName}</TableCell>
        <TableCell sx={{ padding: '6px' }}>{otherNumber}</TableCell>
        <TableCell sx={{ padding: '6px' }}>{amount}</TableCell>
        <TableCell sx={{ padding: '6px' }}>{percentage}</TableCell>
        <TableCell sx={{ padding: '6px' }}>{fDate(from)}</TableCell>
        <TableCell sx={{ padding: '6px' }}>{fDate(to)}</TableCell>
        <TableCell sx={{ padding: '6px' }}>{days}</TableCell>
        <TableCell sx={{ padding: '6px' }}>{cashAmount}</TableCell>
        <TableCell sx={{ padding: '6px' }}>{bankAmount}</TableCell>
        <TableCell sx={{ padding: '6px' }}>{row.interestAmount}</TableCell>
        <TableCell sx={{ padding: '6px' }}>{row.charge}</TableCell>
        <TableCell sx={{ padding: '6px' }}>{fDate(createdAt)}</TableCell>
      </TableRow>
    </>
  );
}

OtherGoldLoanIntrestDetailseTableRow.propTypes = {
  onDeleteRow: PropTypes.func,
  onEditRow: PropTypes.func,
  onSelectRow: PropTypes.func,
  row: PropTypes.object,
  selected: PropTypes.bool,
};
