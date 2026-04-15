import PropTypes from 'prop-types';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import { fDate } from '../../../../utils/format-time';

// ----------------------------------------------------------------------

export default function LoanCloseDetailsTableRow({
  row,
  index,
  selected,
  onEditRow,
  onSelectRow,
  onDeleteRow,
  handleClick,
}) {
  const { totalLoanAmount, closingCharge, netAmount } =
    row;

  return (
    <>
      <TableRow hover selected={selected}>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{index + 1}</TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.loan.loanNo}</TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{totalLoanAmount}</TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.loan.interestLoanAmount}</TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{netAmount - closingCharge}</TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{fDate(row.date)}</TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{totalLoanAmount - netAmount}</TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{closingCharge}</TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{netAmount}</TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{fDate(row.createdAt)}</TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.entryBy}</TableCell>
      </TableRow>
    </>
  );
}

LoanCloseDetailsTableRow.propTypes = {
  onDeleteRow: PropTypes.func,
  onEditRow: PropTypes.func,
  onSelectRow: PropTypes.func,
  row: PropTypes.object,
  selected: PropTypes.bool,
};
