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
import { useAuthContext } from '../../../../auth/hooks/index.js';
import { useGetConfigs } from '../../../../api/config.js';
import { grey } from '../../../../theme/palette.js';
import PartyNewEditForm from './party-new-edit-form.jsx';
import { useState } from 'react';
import { getResponsibilityValue } from '../../../../permission/permission.js';

// ----------------------------------------------------------------------

export default function PartiesTableRow({
  row,
  selected,
  onEditRow,
  onSelectRow,
  onDeleteRow,
  setPartyDetails,
  partyDetails,
  mutate,
}) {
  const confirm = useBoolean();
  const popover = usePopover();
  const { user } = useAuthContext();
  const { configs } = useGetConfigs();
  const [openEditForm, setOpenEditForm] = useState(false);

  const handleEdit = () => {
    popover.onClose();
    setOpenEditForm(true);
  };

  return (
    <>
      <TableRow
        hover
        selected={selected}
        sx={{
          cursor: 'pointer',
          backgroundColor: row?._id === partyDetails?._id ? grey[400] : '',
        }}
        onClick={() => setPartyDetails(row)}
      >
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.name}</TableCell>
        <TableCell
          sx={{ whiteSpace: 'nowrap', color: row.amount >= 0 ? 'error.main' : 'success.main' }}
        >
          {Math.abs(row.amount).toFixed(2)}
        </TableCell>
        <TableCell align="right" sx={{ px: 1, whiteSpace: 'nowrap' }}>
          {getResponsibilityValue('delete_party', configs, user) ||
          getResponsibilityValue('update_party', configs, user) ? (
          <IconButton color={popover.open ? 'inherit' : 'default'} onClick={popover.onOpen}>
            <Iconify icon="eva:more-vertical-fill" />
          </IconButton>
          ) : (''
          )}
        </TableCell>
      </TableRow>
      <CustomPopover
        open={popover.open}
        onClose={popover.onClose}
        arrow="right-top"
        sx={{ width: 140 }}
      >
        {getResponsibilityValue('delete_party', configs, user) && (
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
        {getResponsibilityValue('update_party', configs, user) && (
        <MenuItem onClick={handleEdit}>
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
      {partyDetails && (
        <PartyNewEditForm
          open={openEditForm}
          setOpen={setOpenEditForm}
          currentParty={row}
          mutate={mutate}
        />
      )}
    </>
  );
}

PartiesTableRow.propTypes = {
  onDeleteRow: PropTypes.func,
  onEditRow: PropTypes.func,
  onSelectRow: PropTypes.func,
  row: PropTypes.object,
  selected: PropTypes.bool,
  setPartyDetails: PropTypes.func,
  partyDetails: PropTypes.object,
};
