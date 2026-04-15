import PropTypes from 'prop-types';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import Label from '../../../components/label';
import { fDate } from '../../../utils/format-time';

// ----------------------------------------------------------------------

export default function OtherLoanCloseSummaryTableRow({
  row,
  index,
  selected,
  onEditRow,
  onDeleteRow,
}) {
  const {
    loan,
    day,
    pendingInterest,
    otherNumber,
    otherName,
    rate,
    renewalDate,
    status,
    totalInterestAmt,
    closingAmount,
    totalCharge,
  } = row;
  const { loanNo, customer, loanAmount, scheme, issueDate } = loan;

  return (
    <>
      <TableRow hover selected={selected}>
        <TableCell sx={{ fontSize: '12px', padding: '6px' }}>{index + 1}</TableCell>
        <TableCell sx={{ fontSize: '12px', padding: '6px' }}>{row.code || 0}</TableCell>
        <TableCell sx={{ fontSize: '12px', padding: '6px' }}>{loanNo}</TableCell>
        <TableCell sx={{ fontSize: '12px', padding: '6px' }}>
          {`${customer?.firstName || ''} ${customer?.middleName || ''} ${customer?.lastName || ''}`}
        </TableCell>
        <TableCell sx={{ fontSize: '12px', padding: '6px' }}>{otherName}</TableCell>
        <TableCell sx={{ fontSize: '12px', padding: '6px' }}>{otherNumber}</TableCell>
        <TableCell sx={{ fontSize: '12px', padding: '6px' }}>
          {Number(row.percentage).toFixed(2) || 0}
        </TableCell>
        <TableCell sx={{ fontSize: '12px', padding: '6px' }}>
          {Number(rate).toFixed(2) || 0}
        </TableCell>
        <TableCell sx={{ fontSize: '12px', padding: '6px' }}>{fDate(row.date)}</TableCell>
        <TableCell sx={{ fontSize: '12px', padding: '6px' }}>{row.otherLoanAmount}</TableCell>
        <TableCell sx={{ fontSize: '12px', padding: '6px' }}>
          {(totalInterestAmt - totalCharge).toFixed(2)}
        </TableCell>
        <TableCell sx={{ fontSize: '12px', padding: '6px' }}>{day > 0 ? day : 0}</TableCell>
        <TableCell sx={{ fontSize: '12px', padding: '6px' }}>
          {Number(closingAmount || 0).toFixed(2)}
        </TableCell>
        <TableCell sx={{ fontSize: '12px', padding: '6px' }}>
          {Number(pendingInterest || 0).toFixed(2)}
        </TableCell>
        <TableCell sx={{ fontSize: '12px', padding: '6px' }}>
          {fDate(row.closeDate) || '-'}
        </TableCell>
        <TableCell sx={{ fontSize: '12px', padding: '6px' }}>
          {(row.otherCharge || 0).toFixed(2)}
        </TableCell><TableCell sx={{ fontSize: '12px', padding: '6px' }}>
          {(row.totalCharge || 0).toFixed(2)}
        </TableCell>
        <TableCell sx={{ fontSize: '12px', padding: '6px' }}>
          {(row.closingCharge || 0).toFixed(2)}
        </TableCell>
        <TableCell sx={{ fontSize: '12px', padding: '6px' }}>
          {(totalInterestAmt + closingAmount + row.closingCharge || 0).toFixed(2)}
        </TableCell>
        <TableCell sx={{ fontSize: '12px', padding: '6px', textAlign: 'center' }}>
          <Label
            variant="soft"
            color={
              (status === 'Disbursed' && 'info') ||
              (status === 'Issued' && 'secondary') ||
              (status === 'Closed' && 'warning') ||
              (status === 'Overdue' && 'error') ||
              (status === 'Regular' && 'success') ||
              'default'
            }
          >
            {status}
          </Label>
        </TableCell>
      </TableRow>
    </>
  );
}

OtherLoanCloseSummaryTableRow.propTypes = {
  onDeleteRow: PropTypes.func,
  onEditRow: PropTypes.func,
  onSelectRow: PropTypes.func,
  row: PropTypes.object,
  selected: PropTypes.bool,
};
