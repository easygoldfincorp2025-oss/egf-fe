import React, { useCallback, useMemo, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardHeader,
  Chip,
  Container,
  Dialog,
  DialogActions,
  Divider,
  Grid,
  IconButton,
  MenuItem,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { enqueueSnackbar } from 'notistack';
import { useRouter } from 'src/routes/hooks';
import { useGetScheme } from 'src/api/scheme';
import { useGetBranch } from 'src/api/branch';
import { useAuthContext } from 'src/auth/hooks';
import { useGetConfigs } from 'src/api/config';
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import Iconify from 'src/components/iconify';
import FormProvider, { RHFAutocomplete } from 'src/components/hook-form';
import CustomPopover, { usePopover } from 'src/components/custom-popover';
import ConfirmDialog from 'src/components/custom-dialog/confirm-dialog';
import TablePaginationCustom from 'src/components/table/table-pagination-custom';
import { useTable } from 'src/components/table';
import { getResponsibilityValue } from '../../../permission/permission.js';
import { paths } from '../../../routes/paths.js';
import { useBoolean } from 'src/hooks/use-boolean';
import GoldpricePdf from './goldprice-pdf.jsx';
import { PDFViewer } from '@react-pdf/renderer';
import { NumberFormatBase } from 'react-number-format';

export default function GoldPriceList() {
  const { branch } = useGetBranch();
  const { configs } = useGetConfigs();
  const { user } = useAuthContext();
  const settings = useSettingsContext();
  const storedBranch = sessionStorage.getItem('selectedBranch');
  const { scheme = [], mutate } = useGetScheme();

  const [filters, setFilters] = useState({ goldRate: '', branchId: '' });
  const [loading, setLoading] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [schemeData, setSchemeData] = useState([]);
  const [goldRate, setGoldRate] = useState('');

  const router = useRouter();
  const popover = usePopover();
  const confirm = usePopover();
  const table = useTable();
  const view = useBoolean(false);

  const methods = useForm({ defaultValues: { branchId: '' } });
  const { setValue } = methods;

  const getBranchGoldRate = (branchId) => {
    if (!configs?.goldRate) return '';
    const found = configs.goldRate.find((g) => g.branch === branchId);
    return found ? found.rate : '';
  };

  const handleChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
    setValue(field, value);
  };

  const handleSave = async () => {
    if (!filters.goldRate || !filters.branchId) {
      enqueueSnackbar('Please enter Gold Rate and Branch', { variant: 'warning' });
      return;
    }

    const payload = scheme.map((item) => {
      if (item.branch?._id === filters.branchId) {
        return {
          ...item,
          goldRate: filters.goldRate,
          ratePerGram: ((parseFloat(item.valuation) * parseFloat(filters.goldRate)) / 100).toFixed(
            2
          ),
        };
      }
      return item;
    });

    try {
      setLoading(true);

      const updatedGoldRate = [
        ...(configs.goldRate || []).filter((g) => g.branch !== filters.branchId),
        { branch: filters.branchId, rate: filters.goldRate },
      ];

      await axios.put(`${import.meta.env.VITE_BASE_URL}/${user?.company}/config/${configs?._id}`, {
        goldRate: updatedGoldRate,
      });

      const resScheme = await axios.put(
        `${import.meta.env.VITE_BASE_URL}/${user?.company}/update-schemes`,
        { schemes: payload }
      );

      enqueueSnackbar(resScheme?.data.message, { variant: 'success' });
      mutate();
      router.push(paths.dashboard.scheme.list);
    } catch (error) {
      console.error(error);
      enqueueSnackbar('Failed to update schemes', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFilters({ goldRate: '', branchId: '' });
    setValue('branchId', '');
  };

  const handleEditRow = useCallback((id) => router.push(paths.dashboard.scheme.edit(id)), [router]);

  const handleOpenConfirm = (id, event) => {
    setDeleteId(id);
    confirm.onOpen(event);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      const res = await axios.delete(`${import.meta.env.VITE_BASE_URL}/${user?.company}/scheme`, {
        data: { ids: [deleteId] },
      });
      mutate();
      enqueueSnackbar(res.data.message, { variant: 'success' });
    } catch (error) {
      console.error(error);
      enqueueSnackbar('Failed to delete scheme', { variant: 'error' });
    } finally {
      confirm.onClose();
      setDeleteId(null);
    }
  };

  const handlePrint = () => {
    setSchemeData(scheme);
    setGoldRate(filters.goldRate || getBranchGoldRate(filters.branchId) || 0);
    view.onTrue();
  };

  const dataFiltered = useMemo(() => {
    if (!filters.branchId) return [];
    return scheme.filter((s) => s?.branch?._id === filters.branchId);
  }, [scheme, filters.branchId]);

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="Change Gold Price"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Scheme', href: paths.dashboard.scheme.root },
          { name: 'List' },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />
      <Card sx={{ mb: 3, p: 3, borderRadius: 3, boxShadow: 3 }}>
        <CardHeader
          title="Gold Price Settings"
          subheader={
            <Typography variant="body2" color="text.secondary">
              Last Updated Rate:{' '}
              <Chip
                label={
                  filters.branchId
                    ? getBranchGoldRate(filters.branchId)
                      ? `₹${getBranchGoldRate(filters.branchId)}/gm`
                      : 'Not set'
                    : 'Select branch'
                }
                color="primary"
                size="small"
                sx={{ ml: 1 }}
              />
            </Typography>
          }
        />
        <Divider sx={{ my: 2 }} />
        <FormProvider methods={methods}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={4}>
              <NumberFormatBase
                customInput={TextField}
                fullWidth
                label="Gold Rate"
                thousandSeparator
                prefix="₹"
                suffix="/gm"
                value={filters.goldRate}
                onValueChange={({ value }) => handleChange('goldRate', value)}
                autoFocus
                helperText="Enter current gold rate in ₹ per gram"
              />
            </Grid>
            {user?.role === 'Admin' && branch && storedBranch === 'all' && (
              <Grid item xs={12} sm={4}>
                <RHFAutocomplete
                  name="branchId"
                  label="Branch"
                  placeholder="Choose a Branch"
                  value={
                    filters.branchId
                      ? {
                          label: branch.find((b) => b._id === filters.branchId)?.name || '',
                          value: filters.branchId,
                        }
                      : null
                  }
                  options={branch.map((b) => ({ label: b.name, value: b._id }))}
                  onChange={(_, newValue) => handleChange('branchId', newValue?.value || '')}
                  isOptionEqualToValue={(option, value) => option?.value === value?.value}
                  fullWidth
                  helperText="Select branch to apply gold rate"
                />
              </Grid>
            )}
            <Grid item xs={12} sm={4}>
              <Stack direction="row" spacing={1}>
                <LoadingButton
                  variant="contained"
                  loading={loading}
                  onClick={handleSave}
                  startIcon={<Iconify icon="eva:save-fill" />}
                  disabled={!filters.goldRate || !filters.branchId}
                >
                  Save All
                </LoadingButton>
                <LoadingButton
                  variant="outlined"
                  onClick={handlePrint}
                  startIcon={<Iconify icon="eva:printer-fill" />}
                >
                  Preview PDF
                </LoadingButton>
                <Tooltip title="Reset form">
                  <IconButton color="inherit" onClick={handleReset}>
                    <Iconify icon="eva:refresh-fill" />
                  </IconButton>
                </Tooltip>
              </Stack>
            </Grid>
          </Grid>
        </FormProvider>
      </Card>
      <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
        <CardHeader title="Scheme Rates Preview" />
        <Divider />
        <TableContainer sx={{ maxHeight: 450 }}>
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>#</TableCell>
                <TableCell>Scheme Name</TableCell>
                <TableCell>Interest Rate (%)</TableCell>
                <TableCell>Valuation (%)</TableCell>
                <TableCell>Rate per Gram (₹)</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {dataFiltered
                .slice(
                  table.page * table.rowsPerPage,
                  table.page * table.rowsPerPage + table.rowsPerPage
                )
                .map((row, index) => (
                  <TableRow
                    key={row._id}
                    hover
                    sx={{ '&:nth-of-type(odd)': { backgroundColor: 'action.hover' } }}
                  >
                    <TableCell>{table.page * table.rowsPerPage + index + 1}</TableCell>
                    <TableCell>{row.name}</TableCell>
                    <TableCell>{row.interestRate}%</TableCell>
                    <TableCell>{row.valuation}%</TableCell>
                    <TableCell>
                      {(
                        (parseFloat(row.valuation) *
                          parseFloat(
                            filters.goldRate || getBranchGoldRate(filters.branchId) || 0
                          )) /
                        100
                      ).toFixed(2)}
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="Actions">
                        <IconButton onClick={popover.onOpen}>
                          <Iconify icon="eva:more-vertical-fill" />
                        </IconButton>
                      </Tooltip>
                      <CustomPopover
                        open={popover.open}
                        onClose={popover.onClose}
                        arrow="right-top"
                        sx={{ width: 160 }}
                      >
                        {getResponsibilityValue('update_scheme', configs, user) && (
                          <MenuItem
                            onClick={() => {
                              handleEditRow(row._id);
                              popover.onClose();
                            }}
                          >
                            <Iconify icon="solar:pen-bold" /> Edit
                          </MenuItem>
                        )}
                        {getResponsibilityValue('delete_scheme', configs, user) && (
                          <MenuItem
                            onClick={(event) => {
                              handleOpenConfirm(row._id, event);
                              popover.onClose();
                            }}
                            sx={{ color: 'error.main' }}
                          >
                            <Iconify icon="solar:trash-bin-trash-bold" /> Delete
                          </MenuItem>
                        )}
                      </CustomPopover>
                    </TableCell>
                  </TableRow>
                ))}
              {!dataFiltered.length && (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <Typography variant="body2" color="text.secondary">
                      No schemes found.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePaginationCustom
          count={dataFiltered.length}
          page={table.page}
          rowsPerPage={table.rowsPerPage}
          onPageChange={table.onChangePage}
          onRowsPerPageChange={table.onChangeRowsPerPage}
          dense={table.dense}
          onChangeDense={table.onChangeDense}
        />
      </Card>
      <ConfirmDialog
        open={confirm.open}
        onClose={confirm.onClose}
        title="Delete Scheme"
        content="Are you sure you want to delete this scheme?"
        action={
          <LoadingButton variant="contained" color="error" onClick={handleDelete}>
            Delete
          </LoadingButton>
        }
      />
      <Dialog fullScreen open={view.value} onClose={view.onFalse}>
        <Box sx={{ height: 1, display: 'flex', flexDirection: 'column' }}>
          <DialogActions sx={{ p: 1.5 }}>
            <Button color="inherit" variant="contained" onClick={view.onFalse}>
              Close
            </Button>
          </DialogActions>
          <Box sx={{ flexGrow: 1, height: 1, overflow: 'hidden' }}>
            <PDFViewer width="100%" height="100%" style={{ border: 'none' }}>
              <GoldpricePdf scheme={schemeData} configs={configs} goldRate={goldRate} />
            </PDFViewer>
          </Box>
        </Box>
      </Dialog>
    </Container>
  );
}
