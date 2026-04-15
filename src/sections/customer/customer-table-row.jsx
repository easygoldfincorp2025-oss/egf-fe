import PropTypes from 'prop-types';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import ListItemText from '@mui/material/ListItemText';
import { useBoolean } from 'src/hooks/use-boolean';
import Label from 'src/components/label';
import Iconify from 'src/components/iconify';
import { ConfirmDialog } from 'src/components/custom-dialog';
import CustomPopover, { usePopover } from 'src/components/custom-popover';
import { useGetConfigs } from '../../api/config';
import { useAuthContext } from '../../auth/hooks';
import { getResponsibilityValue } from '../../permission/permission';
import Lightbox, { useLightBox } from '../../components/lightbox';
import React from 'react';
import { fDate } from '../../utils/format-time.js';

// ----------------------------------------------------------------------

export default function CustomerTableRow({
  row,
  selected,
  onEditRow,
  onSelectRow,
  onDeleteRow,
  onViewRow,
}) {
  const {
    firstName,
    lastName,
    middleName,
    contact,
    customerCode,
    email,
    avatar_url,
    status,
    isAadharVerified,
    branch,
    joiningDate,
    isLoan,
  } = row;
  const confirm = useBoolean();
  const popover = usePopover();
  const { configs } = useGetConfigs();
  const { user } = useAuthContext();
  const lightbox = useLightBox(avatar_url);

  return (
    <>
      <TableRow hover selected={selected}>
        <TableCell padding="checkbox">
          <Checkbox checked={selected} onClick={onSelectRow} />
        </TableCell>
        <TableCell sx={{ display: 'flex', alignItems: 'center' }}>
          <Avatar
            alt={firstName}
            src={avatar_url}
            onClick={() => lightbox.onOpen(avatar_url)}
            sx={{ mr: 2, cursor: 'pointer' }}
          />
          <Lightbox image={avatar_url} open={lightbox.open} close={lightbox.onClose} />
          <ListItemText
            primary={firstName + ' ' + middleName + ' ' + lastName}
            secondary={email}
            primaryTypographyProps={{
              typography: 'body2',
              sx: { cursor: 'pointer', fontWeight: 'bold' },
              onClick: () => onViewRow && onViewRow(row),
            }}
            secondaryTypographyProps={{
              component: 'span',
              color: 'text.disabled',
            }}
          />
        </TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{branch.name}</TableCell>
        <TableCell>
          <Label
            variant="soft"
            color={
              (isAadharVerified === true && 'success') ||
              (isAadharVerified === false && 'error') ||
              'default'
            }
          >
            {isAadharVerified ? 'Verified' : 'Unverified'}
          </Label>
        </TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{contact}</TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{customerCode}</TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{fDate(joiningDate) || '-'}</TableCell>
        <TableCell>
          <Label
            variant="soft"
            color={
              (status === 'Active' && 'success') ||
              (status === 'In Active' && 'warning') ||
              (status === 'Blocked' && 'error') ||
              'default'
            }
          >
            {status}
          </Label>
        </TableCell>
        <TableCell>
          <Label
            variant="soft"
            color={(isLoan === true && 'success') || (isLoan === false && 'warning') || 'default'}
          >
            {isLoan ? 'Active' : 'Inactive'}
          </Label>
        </TableCell>
        <TableCell align="right" sx={{ px: 1, whiteSpace: 'nowrap' }}>
          {getResponsibilityValue('delete_customer', configs, user) ||
          getResponsibilityValue('update_customer', configs, user) ? (
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
        {getResponsibilityValue('delete_customer', configs, user) && (
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
        {getResponsibilityValue('update_customer', configs, user) && (
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

CustomerTableRow.propTypes = {
  onDeleteRow: PropTypes.func,
  onEditRow: PropTypes.func,
  onSelectRow: PropTypes.func,
  row: PropTypes.object,
  selected: PropTypes.bool,
};
