import PropTypes from 'prop-types';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import { useBoolean } from 'src/hooks/use-boolean.js';
import Label from 'src/components/label/index.js';
import Iconify from 'src/components/iconify/index.js';
import { ConfirmDialog } from 'src/components/custom-dialog/index.js';
import CustomPopover, { usePopover } from 'src/components/custom-popover/index.js';
import { useAuthContext } from '../../../auth/hooks/index.js';
import { useGetConfigs } from '../../../api/config.js';
import { getResponsibilityValue } from '../../../permission/permission.js';
import { fDate } from '../../../utils/format-time.js';
import { statusColorMap } from '../../../assets/data/index.js';
import { Box } from '@mui/system';
import React from 'react';

// ----------------------------------------------------------------------

export default function BankAccountTableRow({
  row,
  onEditRow,
  onDeleteRow,
}) {
  const confirm = useBoolean();
  const popover = usePopover();
  const { user } = useAuthContext();
  const { configs } = useGetConfigs();

  return (
    <>
      <TableRow hover >
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
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.status}</TableCell>
        <TableCell
          sx={{ whiteSpace: 'nowrap' }}
        >{`${row.bankName}(${row?.bankHolderName})`}</TableCell>
        <TableCell sx={{width:1500}}>
          {row.ref ? `${row.detail} (${row.ref})` : row.detail}
        </TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>
          <Label
            variant="soft"
            color={
              (row.category === 'Payment Out' && 'error') ||
              (row.category === 'Payment In' && 'success') ||
              'default'
            }
          >
            {row.category}
          </Label>
        </TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{fDate(row.date)}</TableCell>
        <TableCell
          sx={{ whiteSpace: 'nowrap', color: row.category === 'Payment Out' ? 'red' : 'green' }}
        >
          {row.amount.toFixed(2)}
        </TableCell>
        {['Bank To Bank', 'Bank To Cash', 'Cash To Bank', 'Adjust Bank Balance'].includes(
          row.status
        ) ? (
          <TableCell align="right" sx={{ px: 1, whiteSpace: 'nowrap' }}>
            {getResponsibilityValue('delete_transfer', configs, user) ||
            getResponsibilityValue('update_transfer', configs, user) ? (
              <IconButton color={popover.open ? 'inherit' : 'default'} onClick={popover.onOpen}>
                <Iconify icon="eva:more-vertical-fill" />
              </IconButton>
            ) : null}
          </TableCell>
        ) : (
          <TableCell></TableCell>
        )}
      </TableRow>
      <CustomPopover
        open={popover.open}
        onClose={popover.onClose}
        arrow="right-top"
        sx={{ width: 140 }}
      >
        {getResponsibilityValue('delete_transfer', configs, user) && (
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
        {getResponsibilityValue('update_transfer', configs, user) && (
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

BankAccountTableRow.propTypes = {
  onDeleteRow: PropTypes.func,
  onEditRow: PropTypes.func,
  row: PropTypes.object,
};
