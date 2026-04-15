import PropTypes from 'prop-types';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import { useBoolean } from 'src/hooks/use-boolean.js';
import Iconify from 'src/components/iconify/index.js';
import { ConfirmDialog } from 'src/components/custom-dialog/index.js';
import CustomPopover, { usePopover } from 'src/components/custom-popover/index.js';
import { fDate } from '../../../utils/format-time.js';
import { statusColorMap } from '../../../assets/data/index.js';
import { Box } from '@mui/system';
import React from 'react';
import Label from '../../../components/label/index.js';
import { getResponsibilityValue } from '../../../permission/permission.js';
import { useAuthContext } from '../../../auth/hooks/index.js';
import { useGetConfigs } from '../../../api/config.js';

// ----------------------------------------------------------------------

export default function ChargeInOutTableRow({
  row,
  selected,
  onEditRow,
  onSelectRow,
  onDeleteRow,
}) {
  const { user } = useAuthContext();
  const { configs } = useGetConfigs();
  const confirm = useBoolean();
  const popover = usePopover();

  return (
    <>
      <TableRow hover selected={selected}>
        <TableCell padding="checkbox">
          <TableCell sx={{ fontSize: '12px', textAlign: 'center' }}>
            <Box
              sx={{
                borderRadius: '50%',
                width: 8,
                height: 8,
                bgcolor: statusColorMap[row.status] || 'grey.400',
              }}
            />
          </TableCell>{' '}
        </TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.chargeType}</TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.category}</TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{fDate(row.date)}</TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>
          {row?.paymentDetail?.paymentMode || row?.paymentDetail?.mode}
        </TableCell>
        <TableCell
          sx={{
            whiteSpace: 'nowrap',
          }}
        >
          {row?.paymentDetail?.cashAmount || row?.paymentDetail?.chargeCashAmount || 0}
        </TableCell>
        <TableCell
          sx={{
            whiteSpace: 'nowrap',
          }}
        >
          {row?.paymentDetail?.bankAmount || row?.paymentDetail?.chargeBankAmount || 0}
        </TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>
          {(() => {
            const acc =
              row?.paymentDetail?.account || row?.paymentDetail?.bankDetails?.account;

            if (!acc) return '-';

            return `${acc.bankName || 'N/A'} (${acc.accountHolderName || acc.accountNumber || 'N/A'})`;
          })()}
        </TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{row?.description || '-'}</TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>
          <Label
            variant="soft"
            color={
              (row.status === 'Payment In' && 'success') ||
              (row.status === 'Payment Out' && 'error') ||
              'default'
            }
          >
            {row.status}
          </Label>
        </TableCell>
        <TableCell align="right" sx={{ px: 1, whiteSpace: 'nowrap' }}>
          {getResponsibilityValue('delete_charge', configs, user) ||
          getResponsibilityValue('update_charge', configs, user) ? (
            <IconButton color={popover.open ? 'inherit' : 'default'} onClick={popover.onOpen}>
              <Iconify icon='eva:more-vertical-fill' />
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
        {getResponsibilityValue('delete_charge', configs, user) && (
          <MenuItem
            onClick={() => {
              confirm.onTrue();
              popover.onClose();
            }}
            sx={{ color: 'error.main' }}
          >
            <Iconify icon='solar:trash-bin-trash-bold' />
            Delete
          </MenuItem>
        )}
        {getResponsibilityValue('update_charge', configs, user) && (
          <MenuItem
            onClick={() => {
              onEditRow();
              popover.onClose();
            }}
          >
            <Iconify icon='solar:pen-bold' />
            Edit
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

ChargeInOutTableRow.propTypes = {
  onDeleteRow: PropTypes.func,
  onEditRow: PropTypes.func,
  onSelectRow: PropTypes.func,
  row: PropTypes.object,
  selected: PropTypes.bool,
};
