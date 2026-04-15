import PropTypes from 'prop-types';
import Button from '@mui/material/Button';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import { useBoolean } from 'src/hooks/use-boolean.js';
import { ConfirmDialog } from 'src/components/custom-dialog/index.js';
import { grey } from '../../../../theme/palette.js';

// ----------------------------------------------------------------------

export default function ChargeTableRow({
  row,
  selected,
  onEditRow,
  onSelectRow,
  onDeleteRow,
  setChargeDetails,
  chargeDetails,
}) {
  const confirm = useBoolean();

  return (
    <>
      <TableRow
        hover
        selected={selected}
        sx={{
          cursor: 'pointer',
          backgroundColor: row.chargeType === chargeDetails.chargeType ? grey[400] : '',
        }}
        onClick={() => {
          setChargeDetails(row);
        }}
      ></TableRow>
      <TableRow
        hover
        selected={selected}
        sx={{
          cursor: 'pointer',
          backgroundColor: row.chargeType === chargeDetails.chargeType ? grey[400] : '',
        }}
        onClick={() => setChargeDetails(row)}
      >
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.chargeType}</TableCell>
        <TableCell
          sx={{ whiteSpace: 'nowrap', color: row.amount >= 0 ? 'success.main' : 'error.main' }}
        >
          {Math.abs(row.amount).toFixed(2)}
        </TableCell>
      </TableRow>
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

ChargeTableRow.propTypes = {
  onDeleteRow: PropTypes.func,
  onEditRow: PropTypes.func,
  onSelectRow: PropTypes.func,
  row: PropTypes.object,
  selected: PropTypes.bool,
};
