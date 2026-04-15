import PropTypes from 'prop-types';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import { useBoolean } from 'src/hooks/use-boolean';
import Iconify from 'src/components/iconify';
import { ConfirmDialog } from 'src/components/custom-dialog';
import CustomPopover, { usePopover } from 'src/components/custom-popover';
import ReminderRecallingForm from './reminder-recalling-form';
import { useState } from 'react';
import { fDate } from '../../utils/format-time';
import { getResponsibilityValue } from '../../permission/permission';
import { useAuthContext } from '../../auth/hooks';
import { useGetConfigs } from '../../api/config';

export default function ReminderDetailsTableRow({
                                                  row,
                                                  selected,
                                                  onSelectRow,
                                                  onDeleteRow,
                                                  loanInterest,
                                                  mutate,
                                                }) {
  const { user } = useAuthContext();
  const { configs } = useGetConfigs();
  const { loan, createdAt, nextRecallingDate, remark } = row;
  const [open, setOpen] = useState(false);
  const confirm = useBoolean();
  const popover = usePopover();
  const recallingPopover = usePopover();

  return (
    <>
      <TableRow hover selected={selected}
                sx={{
                  backgroundColor:
                    loanInterest?.[0] && fDate(new Date(loanInterest[0].createdAt)) <= fDate(new Date())
                      ? '#F6F7F8'
                      : 'inherit',
                }}
      >
        <TableCell padding='checkbox'>
          <Checkbox checked={selected} onClick={onSelectRow} />
        </TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{loan.loanNo}</TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{fDate(createdAt)}</TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{fDate(nextRecallingDate)}</TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{remark}</TableCell>
        <TableCell
          sx={{ whiteSpace: 'nowrap' }}>{loan.customer.firstName + ' ' + loan.customer.middleName + ' ' + loan.customer.lastName}</TableCell>
        <TableCell align='right' sx={{ px: 1, whiteSpace: 'nowrap' }}>
          {getResponsibilityValue('update_reminder', configs, user) || getResponsibilityValue('delete_reminder', configs, user) ?
            <IconButton color={popover.open ? 'inherit' : 'default'} onClick={popover.onOpen}>
              <Iconify icon='eva:more-vertical-fill' />
            </IconButton> : ''}
        </TableCell>
      </TableRow>
      <CustomPopover
        open={popover.open}
        onClose={popover.onClose}
        arrow='right-top'
        sx={{ width: 140 }}
      >
        {getResponsibilityValue('update_reminder', configs, user) && <MenuItem
          onClick={() => {
            popover.onClose();
            recallingPopover.onOpen(ReminderRecallingForm);
            setOpen(true);
          }}
        >
          <Iconify icon='solar:pen-bold' />
          Edit
        </MenuItem>}
        {getResponsibilityValue('delete_reminder', configs, user) && <MenuItem
          onClick={() => {
            confirm.onTrue();
            popover.onClose();
          }}
          sx={{ color: 'error.main' }}
        >
          <Iconify icon='solar:trash-bin-trash-bold' />
          Delete
        </MenuItem>}
      </CustomPopover>
      <CustomPopover
        open={recallingPopover.open}
        onClose={recallingPopover.onClose}
        arrow='right-top'
        sx={{ width: 400 }}
      >
        <ReminderRecallingForm onClose={recallingPopover.onClose} />
      </CustomPopover>
      <ReminderRecallingForm currentReminderDetails={row} open={open} setOpen={() => setOpen(false)} mutate={mutate} />
      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title='Delete'
        content='Are you sure want to delete?'
        action={
          <Button variant='contained' color='error' onClick={onDeleteRow}>
            Delete
          </Button>
        }
      />
    </>
  );
};

ReminderDetailsTableRow.propTypes = {
  onDeleteRow: PropTypes.func,
  onEditRow: PropTypes.func,
  onSelectRow: PropTypes.func,
  row: PropTypes.object,
  selected: PropTypes.bool,
};
