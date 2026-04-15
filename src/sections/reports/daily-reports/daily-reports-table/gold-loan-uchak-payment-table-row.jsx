import PropTypes from 'prop-types';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import { fDate } from '../../../../utils/format-time';

// ----------------------------------------------------------------------

export default function GoldLoanUchakPaymentTableRow({
  row,
  index,
  selected,
  onEditRow,
  onSelectRow,
  onDeleteRow,
  handleClick,
}) {
  const { loan, amountPaid, createdAt } = row;
  const { loanNo, customer, loanAmount, scheme, issueDate, interestLoanAmount } = loan;
  const cutoffDate = new Date("2025-08-01");

  return (
    <>
      <TableRow hover selected={selected}>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{index + 1}</TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{loanNo}</TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>
          {`${customer?.firstName || ''} ${customer?.middleName || ''} ${customer?.lastName || ''}`}
        </TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{loanAmount}</TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>
          {new Date(issueDate) < cutoffDate ? Number(scheme?.interestRate > 1.5 ? 1.5 : scheme?.interestRate).toFixed(2) : 1}
        </TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{loan.consultingCharge}</TableCell>{' '}
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{fDate(issueDate)}</TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{interestLoanAmount}</TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{amountPaid}</TableCell>
        <TableCell sx={{ padding: '6px' }}>{row.paymentDetail.paymentMode}</TableCell>
        <TableCell sx={{ padding: '6px' }}>{row.paymentDetail.cashAmount || 0}</TableCell>
        <TableCell sx={{ padding: '6px' }}>{row.paymentDetail.bankAmount || 0}</TableCell>
        <TableCell sx={{ padding: '6px' }}>{row.paymentDetail.bankName || "-"}</TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{fDate(row?.date)}</TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{fDate(createdAt)}</TableCell>
      </TableRow>
    </>
  );
}

GoldLoanUchakPaymentTableRow.propTypes = {
  onDeleteRow: PropTypes.func,
  onEditRow: PropTypes.func,
  onSelectRow: PropTypes.func,
  row: PropTypes.object,
  selected: PropTypes.bool,
};
