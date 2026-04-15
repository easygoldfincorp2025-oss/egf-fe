import PropTypes from 'prop-types';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import { fDate } from '../../../../utils/format-time';

// ----------------------------------------------------------------------

export default function NewGoldLoanTableRow({
  row,
  index,
  selected,
  onEditRow,
  onSelectRow,
  onDeleteRow,
  handleClick,
}) {
  const { loanNo, customer, loanAmount, scheme, issueDate, issuedBy } = row;
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
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{row?.paymentMode || "-"}</TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.cashAmount || 0}</TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.bankAmount || 0}</TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{row?.companyBankDetail?.account?.bankName || "-"}</TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>
          {new Date(issueDate) < cutoffDate ? Number(scheme?.interestRate > 1.5 ? 1.5 : scheme?.interestRate).toFixed(2) : 1}
        </TableCell>{' '}
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.consultingCharge}</TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.approvalCharge}</TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{row?.chargePaymentDetail?.paymentMode || "-"}</TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>
          {row.chargePaymentDetail.cashAmount || '0'}
        </TableCell>{' '}
        <TableCell sx={{ whiteSpace: 'nowrap' }}>
          {row.chargePaymentDetail.bankAmount || 0}
        </TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{row?.chargePaymentDetail?.account?.bankName || "-"}</TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{fDate(issueDate)}</TableCell>
        <TableCell
          sx={{ whiteSpace: 'nowrap' }}
        >{`${issuedBy.firstName} ${issuedBy.middleName} ${issuedBy.lastName}`}</TableCell>
      </TableRow>
    </>
  );
}

NewGoldLoanTableRow.propTypes = {
  onDeleteRow: PropTypes.func,
  onEditRow: PropTypes.func,
  onSelectRow: PropTypes.func,
  row: PropTypes.object,
  selected: PropTypes.bool,
};
