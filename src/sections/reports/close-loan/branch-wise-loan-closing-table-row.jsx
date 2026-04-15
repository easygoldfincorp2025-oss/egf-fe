import PropTypes from 'prop-types';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import Label from '../../../components/label';
import { fDate } from '../../../utils/format-time';

// ----------------------------------------------------------------------

export default function BranchWiseLoanClosingTableRow({
  row,
  index,
  selected,
  onEditRow,
  onSelectRow,
  onDeleteRow,
  handleClick,
}) {
  const {
    loanNo,
    customer,
    loanAmount,
    scheme,
    status,
    issueDate,
    lastInstallmentDate,
    nextInstallmentDate,
    interestLoanAmount,
    consultingCharge,
    totalPaidInterest,
    day,
    pendingInterest,
    closedBy,
    closeAmt,
    closedDate,
  } = row;

  const cutoffDate = new Date("2025-08-01");

  return (
    <>
      <TableRow hover selected={selected}>
        <TableCell sx={{ fontSize: '12px', padding: '6px' }}>{index + 1}</TableCell>
        <TableCell sx={{ fontSize: '12px', padding: '6px' }}>{loanNo}</TableCell>
        <TableCell sx={{ fontSize: '12px', padding: '6px' }}>
          {`${customer?.firstName || ''} ${customer?.middleName || ''} ${customer?.lastName || ''}`}
        </TableCell>
        <TableCell sx={{ fontSize: '12px', padding: '6px' }}>{customer?.contact}</TableCell>
        <TableCell sx={{ fontSize: '12px', padding: '6px' }}>
          {new Date(issueDate) < cutoffDate ? Number(scheme?.interestRate > 1.5 ? 1.5 : scheme?.interestRate).toFixed(2) : 1}
        </TableCell>
        <TableCell sx={{ fontSize: '12px', padding: '6px' }}>
          {consultingCharge.toFixed(2)}
        </TableCell>
        <TableCell sx={{ fontSize: '12px', padding: '6px' }}>{fDate(issueDate)}</TableCell>
        <TableCell sx={{ fontSize: '12px', padding: '6px' }}>{loanAmount}</TableCell>{' '}
        <TableCell sx={{ fontSize: '12px', padding: '6px' }}>
          {fDate(lastInstallmentDate) || '-'}
        </TableCell>
        <TableCell sx={{ fontSize: '12px', padding: '6px' }}>
          {Number(totalPaidInterest).toFixed(2)}
        </TableCell>
        <TableCell sx={{ fontSize: '12px', padding: '6px' }}>{day > 0 ? day : 0}</TableCell>
        <TableCell sx={{ fontSize: '12px', padding: '6px' }}>{fDate(closedDate)}</TableCell>
        <TableCell sx={{ fontSize: '12px', padding: '6px' }}>{row.approvalCharge || 0}</TableCell>
        <TableCell sx={{ fontSize: '12px', padding: '6px' }}>{row.closeCharge || 0}</TableCell>
        <TableCell sx={{ fontSize: '12px', padding: '6px' }}>
          {loanAmount.toFixed(2) || 0}
        </TableCell>
        <TableCell sx={{ fontSize: '12px', padding: '6px' }}>{row.paymentMode}</TableCell>

        <TableCell sx={{ fontSize: '12px', padding: '6px' }}>{row.cashAmount || 0}</TableCell>
        <TableCell sx={{ fontSize: '12px', padding: '6px' }}>{row.bankAmount || 0}</TableCell>
        <TableCell sx={{ fontSize: '12px', padding: '6px' }}>{row?.companyBankDetail?.account?.bankName || "-"}</TableCell>
        <TableCell
          sx={{ fontSize: '12px', padding: '6px' }}
        >{`${closedBy.firstName} ${closedBy.middleName} ${closedBy.lastName} `}</TableCell>
        <TableCell sx={{ fontSize: '12px', width: '0%', padding: '6px' }}>
          <Label variant="soft" color={(status === 'Closed' && 'warning') || 'default'}>
            {status}
          </Label>
        </TableCell>
      </TableRow>
    </>
  );
}

BranchWiseLoanClosingTableRow.propTypes = {
  onDeleteRow: PropTypes.func,
  onEditRow: PropTypes.func,
  onSelectRow: PropTypes.func,
  row: PropTypes.object,
  selected: PropTypes.bool,
};
