import PropTypes from 'prop-types';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import { fDate } from '../../../../utils/format-time';


// ----------------------------------------------------------------------

export default function LoanUchakpayDetailsTableRow({ row,index, selected, onEditRow, onSelectRow, onDeleteRow, handleClick }) {
  const { amountPaid, date, remark } = row;
  return (
    <>
      <TableRow hover selected={selected}>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{index + 1}</TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{fDate(date)}</TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{amountPaid}</TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{remark || '-'}</TableCell>
      </TableRow>
    </>
  );
}

LoanUchakpayDetailsTableRow.propTypes = {
  onDeleteRow: PropTypes.func,
  onEditRow: PropTypes.func,
  onSelectRow: PropTypes.func,
  row: PropTypes.object,
  selected: PropTypes.bool,
};
