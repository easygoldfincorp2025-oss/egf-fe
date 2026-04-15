import PropTypes from 'prop-types';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import { fDate } from '../../../../utils/format-time';

// ----------------------------------------------------------------------

export default function LoanInterestDetailsTableRow({
  row,
  index,
  selected,
  onEditRow,
  onSelectRow,
  onDeleteRow,
  handleClick,
}) {
  const {
    from,
    to,
    penalty,
    days,
    loan,
    amountPaid,
    cr_dr,
    adjustedPay,
    createdAt,
    uchakInterestAmount,
  } = row;
  const { consultingCharge } = loan;
  const { loanNo, customer, loanAmount, scheme, issueDate, interestLoanAmount } = loan;
  const cutoffDate = new Date("2025-08-01");

  return (
    <>
      <TableRow hover selected={selected}>
        <TableCell sx={{ padding: '6px' }}>{index + 1}</TableCell>
        <TableCell sx={{ padding: '6px' }}>{fDate(from)}</TableCell>
        <TableCell sx={{ padding: '6px' }}>{fDate(to)}</TableCell>
        <TableCell sx={{ padding: '6px' }}>{loanAmount}</TableCell>
        <TableCell sx={{ padding: '6px' }}>
          {new Date(issueDate) < cutoffDate ? Number(scheme?.interestRate > 1.5 ? 1.5 : scheme?.interestRate).toFixed(2) : 1}
        </TableCell>
        <TableCell sx={{ padding: '6px' }}>{consultingCharge}</TableCell>
        <TableCell sx={{ padding: '6px' }}>
          {Number(row.interestAmount + row.consultingCharge).toFixed(2)}
        </TableCell>
        <TableCell sx={{ padding: '6px' }}>{penalty}</TableCell>
        <TableCell sx={{ padding: '6px' }}>{row.old_cr_dr.toFixed(2)}</TableCell>
        <TableCell sx={{ padding: '6px' }}>{uchakInterestAmount || 0}</TableCell>
        <TableCell sx={{ padding: '6px' }}>{fDate(createdAt)}</TableCell>
        <TableCell sx={{ padding: '6px' }}>{days}</TableCell>
        <TableCell sx={{ padding: '6px' }}>
          {' '}
          {Number(row.interestAmount + row.consultingCharge + row.old_cr_dr).toFixed(2)}
        </TableCell>
        <TableCell sx={{ padding: '6px' }}>{amountPaid}</TableCell>
      </TableRow>
    </>
  );
}

LoanInterestDetailsTableRow.propTypes = {
  onDeleteRow: PropTypes.func,
  onEditRow: PropTypes.func,
  onSelectRow: PropTypes.func,
  row: PropTypes.object,
  selected: PropTypes.bool,
};
