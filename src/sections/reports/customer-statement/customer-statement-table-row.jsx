import PropTypes from 'prop-types';
import { TableCell, TableRow } from '@mui/material';
import { fDate } from '../../../utils/format-time';

// ----------------------------------------------------------------------

export default function CustomerStatementTableRow({ row }) {
  const {
    loanNo,
  } = row;

  const totals = row.statements?.reduce(
    (acc, item) => {
      acc.credit += Number(item.credit) || 0;
      acc.debit += Number(item.debit) || 0;
      acc.balance += Number(item.balance) || 0;
      return acc;
    },
    { credit: 0, debit: 0, balance: 0 }
  );

  const statusColors = {
    'Loan Close': (theme) => (theme.palette.mode === 'light' ? '#FFE4DE' : '#611706'),
  };

  return (
    <>
      <TableRow hover>
        <TableCell>{row.srNo}</TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap', fontWeight: 'bold' }}>{loanNo}</TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}></TableCell>
        <TableCell colSpan={4} />
      </TableRow>
      {row.statements?.length > 0 && (
        <>
          {row.statements.map((item, index) => (
            <TableRow key={index} sx={{ backgroundColor: statusColors[item.detail] || '' }}>
              <TableCell />
              <TableCell sx={{ whiteSpace: 'nowrap' }}>{item.detail}</TableCell>
              <TableCell sx={{ whiteSpace: 'nowrap' }}>{fDate(item.date)}</TableCell>
              <TableCell sx={{ whiteSpace: 'nowrap' }}>{item.credit || 0}</TableCell>
              <TableCell sx={{ whiteSpace: 'nowrap' }}>{item.debit || 0}</TableCell>
            </TableRow>
          ))}
          <TableRow
            sx={{
              background: (theme) => (theme.palette.mode === 'light' ? '#E3E7EA' : ''),
            }}
          >
            <TableCell />
            <TableCell colSpan={2} sx={{ fontWeight: 'bold' }}>
              Total
            </TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>{totals.credit.toFixed(2)}</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>{totals.debit.toFixed(2)}</TableCell>
          </TableRow>
        </>
      )}
    </>
  );
}

CustomerStatementTableRow.propTypes = {
  onDeleteRow: PropTypes.func,
  row: PropTypes.object,
  selected: PropTypes.bool,
  loanStatus: PropTypes.string,
};
