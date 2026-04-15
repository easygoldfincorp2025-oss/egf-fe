import PropTypes from 'prop-types';
import { useCallback } from 'react';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Iconify from 'src/components/iconify/index.js';

// ----------------------------------------------------------------------

export default function BankAccountTableFiltersResult({
  filters,
  onFilters,
  onResetFilters,
  results,
  setAcc,
  ...other
}) {
  const handleRemoveKeyword = useCallback(() => {
    onFilters('name', '');
  }, [onFilters]);

  const handleRemoveCetagory = useCallback(() => {
    onFilters('category', '');
  }, [onFilters]);

  const handleRemoveType = useCallback(() => {
    onFilters('status', '');
  }, [onFilters]);

  const handleRemoveAcc = useCallback(() => {
    onFilters('account', {});
    setAcc({});
  }, [onFilters]);

  return (
    <Stack spacing={1.5} {...other}>
      <Box sx={{ typography: 'body2' }}>
        <strong>{results}</strong>
        <Box component="span" sx={{ color: 'text.secondary', ml: 0.25 }}>
          results found
        </Box>
      </Box>
      <Stack flexGrow={1} spacing={1} direction="row" flexWrap="wrap" alignItems="center">
        {filters.category && (
          <Block label="Category">
            <Chip size="small" label={filters.category} onDelete={handleRemoveCetagory} />
          </Block>
        )}{' '}
        {filters.status && (
          <Block label="Type">
            <Chip size="small" label={filters.status} onDelete={handleRemoveType} />
          </Block>
        )}
        {!!filters.name && (
          <Block label="Key Word:">
            <Chip label={filters.name} size="small" onDelete={handleRemoveKeyword} />
          </Block>
        )}{' '}
        {!!filters.account.bankName && (
          <Block label="Bank Account:">
            <Chip label={filters.account.bankName} size="small" onDelete={handleRemoveAcc} />
          </Block>
        )}
        <Button
          color="error"
          onClick={onResetFilters}
          startIcon={<Iconify icon="solar:trash-bin-trash-bold" />}
        >
          Clear
        </Button>
      </Stack>
    </Stack>
  );
}

BankAccountTableFiltersResult.propTypes = {
  filters: PropTypes.object,
  onFilters: PropTypes.func,
  onResetFilters: PropTypes.func,
  results: PropTypes.number,
};

// ----------------------------------------------------------------------

function Block({ label, children, sx, ...other }) {
  return (
    <Stack
      component={Paper}
      variant="outlined"
      spacing={1}
      direction="row"
      sx={{
        p: 1,
        borderRadius: 1,
        overflow: 'hidden',
        borderStyle: 'dashed',
        ...sx,
      }}
      {...other}
    >
      <Box component="span" sx={{ typography: 'subtitle2' }}>
        {label}
      </Box>
      <Stack spacing={1} direction="row" flexWrap="wrap">
        {children}
      </Stack>
    </Stack>
  );
}

Block.propTypes = {
  children: PropTypes.node,
  label: PropTypes.string,
  sx: PropTypes.object,
};
