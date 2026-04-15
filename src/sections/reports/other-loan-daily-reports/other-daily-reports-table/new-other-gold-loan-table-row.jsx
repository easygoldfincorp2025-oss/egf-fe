import PropTypes from 'prop-types';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import { fDate } from '../../../../utils/format-time';

// ----------------------------------------------------------------------

export default function OtherNewGoldLoanTableRow({
                                              row,
                                              index,
                                              selected,
                                              onEditRow,
                                              onSelectRow,
                                              onDeleteRow,
                                              handleClick,
                                            }) {

  const {
    date,
    otherName,
    loan,
    otherNumber,
    percentage,
    grossWt,
    netWt,
    otherCharge,
    cashAmount,
    bankAmount,
    amount,
    createdAt,
  } = row;
  const {
    loanNo,
    customer,
  } = loan;

  return (
    <>
      <TableRow hover selected={selected}>
      <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.code || 0}</TableCell>
      <TableCell sx={{ whiteSpace: 'nowrap' }}>{fDate(date)}</TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{loanNo}</TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>
          {`${customer?.firstName || ''} ${customer?.middleName || ''} ${customer?.lastName || ''}`}
        </TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{otherName}</TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{otherNumber}</TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{percentage}</TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{grossWt}</TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{netWt}</TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{otherCharge}</TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{cashAmount}</TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{bankAmount}</TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{amount}</TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{fDate(createdAt)}</TableCell>
      </TableRow>
    </>
  );
};

OtherNewGoldLoanTableRow.propTypes = {
  onDeleteRow: PropTypes.func,
  onEditRow: PropTypes.func,
  onSelectRow: PropTypes.func,
  row: PropTypes.object,
  selected: PropTypes.bool,
};
