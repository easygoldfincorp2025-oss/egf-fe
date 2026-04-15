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
import Lightbox, { useLightBox } from '../../../components/lightbox/index.js';

// ----------------------------------------------------------------------

export default function PaymentInOutTableRow({
  row,
  selected,
  onEditRow,
  onSelectRow,
  onDeleteRow,
}) {
  const {
    name,
    ratePerGram,
    interestRate,
    valuation,
    interestPeriod,
    renewalTime,
    minLoanTime,
    schemeType,
    isActive,
  } = row;
  const confirm = useBoolean();
  const popover = usePopover();
  const { user } = useAuthContext();
  const { configs } = useGetConfigs();
  const lightbox = useLightBox(row.invoice);

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
        <TableCell sx={{ whiteSpace: 'nowrap',px:0 }}>{row?.party?.name}</TableCell>
        <TableCell>{row?.receiptNo.split('/')[2]}</TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap',px:1 }}>{fDate(row.date)}</TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap',px:1 }}>{row?.paymentDetail?.paymentMode}</TableCell>
        <TableCell
          sx={{
            whiteSpace: 'nowrap',px:1,
          }}
        >
          {row?.paymentDetail?.cashAmount || 0}
        </TableCell>
        <TableCell
          sx={{
            whiteSpace: 'nowrap',px:1,
          }}
        >
          {row?.paymentDetail?.bankAmount || 0}
        </TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap',px:1 }}>
          {row?.paymentDetail?.account?.bankName && row?.paymentDetail?.account?.accountHolderName
            ? `${row.paymentDetail.account.bankName} (${row.paymentDetail.account.accountHolderName})`
            : '-'}
        </TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap',px:1, maxWidth: '200px', textWrap: 'wrap' }}>
          {row?.description || '-'}
        </TableCell>
        {row.invoice ? (
          <TableCell sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton onClick={() => lightbox.onOpen(row.invoice)} sx={{ mr: 2 }}>
              <Iconify icon="tabler:file-invoice" width="24" height="24" />
            </IconButton>
            <Lightbox image={row.invoice} open={lightbox.open} close={lightbox.onClose} />
          </TableCell>
        ) : (
          <TableCell sx={{ whiteSpace: 'nowrap',px:1, textAlign: 'center' }}>-</TableCell>
        )}
        <TableCell sx={{ whiteSpace: 'nowrap',px:1 }}>
          <Label
            variant="soft"
            color={
              (row.status === 'Payment Out' && 'error') ||
              (row.status === 'Payment In' && 'success') ||
              'default'
            }
          >
            {row.status}
          </Label>
        </TableCell>
        <TableCell align="right" sx={{ px: 0, whiteSpace: 'nowrap' }}>
          {getResponsibilityValue('delete_payment_in_out', configs, user) ||
          getResponsibilityValue('update_payment_in_out', configs, user) ? (
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
        {getResponsibilityValue('delete_payment_in_out', configs, user) && (
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
        {getResponsibilityValue('update_payment_in_out', configs, user) && (
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

PaymentInOutTableRow.propTypes = {
  onDeleteRow: PropTypes.func,
  onEditRow: PropTypes.func,
  onSelectRow: PropTypes.func,
  row: PropTypes.object,
  selected: PropTypes.bool,
};
