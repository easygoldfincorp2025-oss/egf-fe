import PropTypes from 'prop-types';

import Box from '@mui/material/Box';
import Switch from '@mui/material/Switch';
import TablePagination from '@mui/material/TablePagination';
import FormControlLabel from '@mui/material/FormControlLabel';

// ----------------------------------------------------------------------

export default function TablePaginationCustom({
                                                dense,
                                                onChangeDense,
                                                count,
                                                rowsPerPageOptions = [{ label: 'All', value: count }, 10, 30, 50],
                                                rowsPerPage = count,
                                                onChangePage,
                                                onChangeRowsPerPage,
                                                sx,
                                                ...other
                                              }) {
  const handleChangeRowsPerPage = (event) => {
    const value = parseInt(event.target.value, 10);
    onChangeRowsPerPage(event, value === -1 ? count : value);
  };
  return (
    <Box sx={{ position: 'relative', ...sx }}>
      <TablePagination
        rowsPerPageOptions={rowsPerPageOptions}
        component='div'
        count={count}
        rowsPerPage={rowsPerPage}
        onPageChange={onChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        sx={{
          borderTopColor: 'transparent',
        }}
        {...other}
      />

      {onChangeDense && (
        <FormControlLabel
          label='Dense'
          control={<Switch checked={dense} onChange={onChangeDense} />}
          sx={{
            pl: 2,
            py: 1.5,
            top: 0,
            position: {
              sm: 'absolute',
            },
          }}
        />
      )}
    </Box>
  );
}

TablePaginationCustom.propTypes = {
  dense: PropTypes.bool,
  onChangeDense: PropTypes.func,
  rowsPerPageOptions: PropTypes.arrayOf(
    PropTypes.oneOfType([PropTypes.number, PropTypes.shape({ label: PropTypes.string, value: PropTypes.number })]),
  ),
  count: PropTypes.number.isRequired,
  rowsPerPage: PropTypes.number.isRequired,
  onChangePage: PropTypes.func.isRequired,
  onChangeRowsPerPage: PropTypes.func.isRequired,
  sx: PropTypes.object,
};
