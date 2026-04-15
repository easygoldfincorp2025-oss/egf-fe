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
import ReminderRecallingForm from './reminder-recalling-form';
import { useState } from 'react';
import { fDate } from '../../utils/format-time';
import { useAuthContext } from '../../auth/hooks';
import { useGetConfigs } from '../../api/config';
import { getResponsibilityValue } from '../../permission/permission';

export default function ReminderTableRow({
  row,
  selected,
  onDeleteRow,
  handleClick,
  index,
  mutate,
  latestRecallingDate,
}) {
  const {
    loanNo,
    customer,
    loanAmount,
    nextInstallmentDate,
    issueDate,
    lastInstallmentDate,
    interestLoanAmount,
    status,
  } = row;
  const [open, setOpen] = useState(false);
  const confirm = useBoolean();
  const popover = usePopover();
  const recallingPopover = usePopover();
  const { user } = useAuthContext();
  const { configs } = useGetConfigs();

  const calculateDateDifference = (date1, date2) => {
    const diffTime = new Date(date1) - new Date(date2);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };
  const statusColors = {
    Overdue: (theme) => (theme.palette.mode === 'light' ? '#FFE4DE' : '#611706'),
  };

  return (
    <>
      <TableRow hover selected={selected} sx={{ backgroundColor: statusColors[status] || '' }}>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{index}</TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{loanNo}</TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>
          {customer.firstName + ' ' + customer.middleName + ' ' + customer.lastName}
        </TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{customer.contact}</TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{loanAmount}</TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{interestLoanAmount}</TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>
          {calculateDateDifference(new Date(), lastInstallmentDate || issueDate)}
        </TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{fDate(nextInstallmentDate)}</TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{fDate(issueDate)}</TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap', textAlign: 'center' }}>
          {fDate(lastInstallmentDate) || '-'}
        </TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap', textAlign: 'center' }}>
          {latestRecallingDate ? fDate(latestRecallingDate) : '-'}
        </TableCell>
        <TableCell align="right" sx={{ px: 1, whiteSpace: 'nowrap' }}>
          <IconButton color={popover.open ? 'inherit' : 'default'} onClick={popover.onOpen}>
            <Iconify icon="eva:more-vertical-fill" />
          </IconButton>
        </TableCell>
      </TableRow>
      <CustomPopover
        open={popover.open}
        onClose={popover.onClose}
        arrow="right-top"
        sx={{ width: 140 }}
      >
        {getResponsibilityValue('create_reminder', configs, user) && (
          <MenuItem
            onClick={() => {
              popover.onClose();
              recallingPopover.onOpen(ReminderRecallingForm);
              setOpen(true);
            }}
          >
            <Iconify icon="eva:clock-outline" />
            Recalling
          </MenuItem>
        )}
        <MenuItem onClick={handleClick}>
          <Iconify icon="carbon:view-filled" />
          Details
        </MenuItem>
      </CustomPopover>
      <CustomPopover
        open={recallingPopover.open}
        onClose={recallingPopover.onClose}
        arrow="right-top"
        sx={{ width: 400 }}
      >
        <ReminderRecallingForm onClose={recallingPopover.onClose} />
      </CustomPopover>
      <ReminderRecallingForm
        currentReminder={row}
        open={open}
        setOpen={() => setOpen(false)}
        mutate={mutate}
      />
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

ReminderTableRow.propTypes = {
  onDeleteRow: PropTypes.func,
  onEditRow: PropTypes.func,
  onSelectRow: PropTypes.func,
  row: PropTypes.object,
  selected: PropTypes.bool,
  latestRecallingDate: PropTypes.string,
};
