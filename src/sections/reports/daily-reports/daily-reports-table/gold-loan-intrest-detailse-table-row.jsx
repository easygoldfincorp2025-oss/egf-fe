import PropTypes from 'prop-types';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import { fDate } from '../../../../utils/format-time';

// ----------------------------------------------------------------------

export default function GoldLoanIntrestDetailseTableRow({
  row,
  index,
  selected,
  onEditRow,
  onSelectRow,
  onDeleteRow,
  handleClick,
}) {
  const { from, to, penalty, days, loan, amountPaid } = row;
  const { loanNo, customer, loanAmount, scheme, issueDate, interestLoanAmount } = loan;
  const cutoffDate = new Date("2025-08-01");
  return (
    <>
      <TableRow hover selected={selected}>
        <TableCell sx={{ padding: '6px' }}>{index + 1}</TableCell>
        <TableCell sx={{ padding: '6px' }}>{loanNo}</TableCell>
        <TableCell sx={{ padding: '6px' }}>
          {`${customer?.firstName || ''} ${customer?.middleName || ''} ${customer?.lastName || ''}`}
        </TableCell>
        <TableCell sx={{ padding: '6px' }}>{loanAmount}</TableCell>
        <TableCell sx={{ padding: '6px' }}>
          {new Date(issueDate) < cutoffDate ? Number(scheme?.interestRate > 1.5 ? 1.5 : scheme?.interestRate).toFixed(2) : 1}
        </TableCell>
        <TableCell sx={{ padding: '6px' }}>{loan.consultingCharge}</TableCell>{' '}
        <TableCell sx={{ padding: '6px' }}>{fDate(issueDate)}</TableCell>
        <TableCell sx={{ padding: '6px' }}>{interestLoanAmount.toFixed(2)}</TableCell>
        <TableCell sx={{ padding: '6px' }}>{fDate(from)}</TableCell>
        <TableCell sx={{ padding: '6px' }}>{fDate(to)}</TableCell>
        <TableCell sx={{ padding: '6px' }}>{days}</TableCell>
        <TableCell sx={{ padding: '6px' }}>{row?.paymentDetail?.paymentMode}</TableCell>
        <TableCell sx={{ padding: '6px' }}>{row?.paymentDetail?.cashAmount || 0}</TableCell>
        <TableCell sx={{ padding: '6px' }}>{row?.paymentDetail?.bankAmount || 0}</TableCell>
        <TableCell sx={{ padding: '6px' }}>{row?.paymentDetail?.account?.bankName || '-'}</TableCell>
        <TableCell sx={{ padding: '6px' }}>
          {(row.interestAmount + row.consultingCharge).toFixed(2)}
        </TableCell>
        <TableCell sx={{ padding: '6px' }}>{penalty}</TableCell>
        <TableCell sx={{ padding: '6px' }}>{amountPaid}</TableCell>
      </TableRow>
    </>
  );
}

GoldLoanIntrestDetailseTableRow.propTypes = {
  onDeleteRow: PropTypes.func,
  onEditRow: PropTypes.func,
  onSelectRow: PropTypes.func,
  row: PropTypes.object,
  selected: PropTypes.bool,
};
