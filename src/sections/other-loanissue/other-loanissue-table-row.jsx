import PropTypes from 'prop-types';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import { useBoolean } from 'src/hooks/use-boolean';
import Iconify from 'src/components/iconify';
import { ConfirmDialog } from 'src/components/custom-dialog';
import CustomPopover, { usePopover } from 'src/components/custom-popover';
import { useAuthContext } from '../../auth/hooks';
import { useGetConfigs } from '../../api/config';
import { getResponsibilityValue } from '../../permission/permission';
import { fDate } from '../../utils/format-time.js';
import React from 'react';
import Label from '../../components/label/index.js';

// ----------------------------------------------------------------------

export default function OtherLoanissueTableRow({
  row,
  selected,
  onEditRow,
  onSelectRow,
  onDeleteRow,
  onViewRow,
}) {
  const { loan, cashAmount, bankAmount, srNo, otherNumber, amount, percentage, otherName, date } =
    row;
  const { loanNo, customer, scheme, loanAmount, createdAt } = loan;
  const confirm = useBoolean();
  const popover = usePopover();
  const { user } = useAuthContext();
  const { configs } = useGetConfigs();
  const statusColors = {
    Closed: (theme) => (theme.palette.mode === 'light' ? '#FFF1D6' : '#6f4f07'),
  };
  return (
    <>
      <TableRow hover selected={selected} sx={{ backgroundColor: statusColors[row.status] || '' }}>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{srNo}</TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{row?.code}</TableCell>
        <TableCell
          sx={{ whiteSpace: 'nowrap', cursor: 'pointer', fontWeight: 'bold' }}
          onClick={() => onViewRow && onViewRow(row)}
        >
          {loanNo}
        </TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>
          {customer?.firstName + ' ' + customer?.middleName + ' ' + customer?.lastName}
        </TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{otherName}</TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{otherNumber}</TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{fDate(date)}</TableCell>{' '}
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{fDate(createdAt)}</TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{customer?.contact}</TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{amount}</TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{percentage}</TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{cashAmount || 0}</TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{bankAmount || 0}</TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>
          <Label
            variant="soft"
            color={
              (row?.status === 'Issued' && 'info') ||
              (row?.status === 'Closed' && 'warning') ||
              (row?.status === 'Overdue' && 'error') ||
              (row?.status === 'Regular' && 'success') ||
              'default'
            }
          >
            {row?.status}
          </Label>
        </TableCell>
        <TableCell align="right" sx={{ px: 1, whiteSpace: 'nowrap' }}>
          {getResponsibilityValue('update_other_loan_issue', configs, user) ||
          getResponsibilityValue('delete_other_loan_issue', configs, user) ? (
            <IconButton color={popover.open ? 'inherit' : 'default'} onClick={popover.onOpen}>
              <Iconify icon="eva:more-vertical-fill" />
            </IconButton>
          ) : (
            ''
          )}
        </TableCell>
      </TableRow>
      <CustomPopover
        open={popover.open}
        onClose={popover.onClose}
        arrow="right-top"
        sx={{ width: 140 }}
      >
        {getResponsibilityValue('update_other_loan_issue', configs, user) && (
          <MenuItem
            onClick={() => {
              onEditRow();
              popover.onClose();
            }}
          >
            <Iconify icon="solar:pen-bold" />
            Edit
          </MenuItem>
        )}
        {getResponsibilityValue('delete_other_loan_issue', configs, user) && (
          <MenuItem
            onClick={() => {
              confirm.onTrue();
              popover.onClose();
            }}
            sx={{ color: 'error.main' }}
          >
            <Iconify icon="solar:trash-bin-trash-bold" />
            Delete
          </MenuItem>
        )}
      </CustomPopover>
      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title="Delete"
        content="Are you sure want to delete?"
        action={
          <Button variant="contained" color="error" onClick={onDeleteRow}>
            Delete
          </Button>
        }
      />
    </>
  );
}

OtherLoanissueTableRow.propTypes = {
  onDeleteRow: PropTypes.func,
  onEditRow: PropTypes.func,
  onSelectRow: PropTypes.func,
  row: PropTypes.object,
  selected: PropTypes.bool,
  onViewRow: PropTypes.func,
};
