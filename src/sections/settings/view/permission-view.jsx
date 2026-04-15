import React, { useEffect, useState, useMemo } from 'react';
import {
  Box,
  Button,
  Card,
  CardHeader,
  Checkbox,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControlLabel,
  Grid,
  IconButton,
  InputAdornment,
  Stack,
  Switch,
  TextField,
  Typography,
  LinearProgress,
  Tooltip,
} from '@mui/material';
import { Controller, FormProvider, useForm } from 'react-hook-form';
import { RHFAutocomplete } from '../../../components/hook-form';
import Iconify from 'src/components/iconify';
import { useGetConfigs } from 'src/api/config';
import axios from 'axios';
import { enqueueSnackbar } from 'notistack';
import { useAuthContext } from '../../../auth/hooks';

export const modules = [
  {
    label: 'Dashboard',
    value: 'Dashboard',
    permissions: [
      { action: 'Select Customer', key: 'select_customer' },
      { action: 'Select Loan No.', key: 'select_loan_no' },
      { action: 'Select Mobile No.', key: 'select_mobile_no' },
      { action: 'Select Calculator', key: 'select_calculator' },
      { action: 'Expense Box', key: 'expense_box' },
      { action: 'Payment In Box', key: 'payment_in_box' },
      { action: 'Payment Out Box', key: 'payment_out_box' },
      { action: 'Payment Diff Box', key: 'payment_diff_box' },
      { action: 'Cash/Bank Chart', key: 'cash_bank_chart' },
      { action: 'Portfolio Box', key: 'portfolio_box' },
      { action: 'Interest Summary Box', key: 'interest_summary_box' },
      { action: 'All In/Out Summary Box', key: 'all_in/out_summary_box' },
      { action: 'Charge Summary Box', key: 'charge_summary_box' },
      { action: 'Scheme Chart', key: 'scheme_chart' },
      { action: 'Loan Chart', key: 'loan_chart' },
      { action: 'Other Loan Chart', key: 'other_loan_chart' },
      { action: 'Inquiry Chart', key: 'inquiry_chart' },
      { action: 'Customer Chart', key: 'customer_chart' },
      { action: 'Customer References Chart', key: 'customer_references_chart' },
      { action: 'Customer Area Chart', key: 'customer_area_chart' },
    ],
  },
  {
    label: 'Inquiry',
    value: 'Inquiry',
    permissions: [
      { action: 'Create Inquiry', key: 'create_inquiry' },
      { action: 'Update Inquiry', key: 'update_inquiry' },
      { action: 'Delete Inquiry', key: 'delete_inquiry' },
      { action: 'Print Inquiry', key: 'print_inquiry_detail' },
      { action: 'Bulk Inquiry', key: 'bulk_inquiry_detail' },
      { action: 'Inquiry Follow-Up', key: 'inquiry_follow-up' },
    ],
  },
  {
    label: 'Customer',
    value: 'Customer',
    permissions: [
      { action: 'Create Customer', key: 'create_customer' },
      { action: 'Update Customer', key: 'update_customer' },
      { action: 'Delete Customer', key: 'delete_customer' },
      { action: 'Print Customer', key: 'print_customer' },
    ],
  },
  {
    label: 'Employee',
    value: 'Employee',
    permissions: [
      { action: 'Create Employee', key: 'create_employee' },
      { action: 'Update Employee', key: 'update_employee' },
      { action: 'Delete Employee', key: 'delete_employee' },
      { action: 'Print Employee', key: 'print_employee_detail' },
    ],
  },
  {
    label: 'Scheme',
    value: 'Scheme',
    permissions: [
      { action: 'Create Scheme', key: 'create_scheme' },
      { action: 'Update Scheme', key: 'update_scheme' },
      { action: 'Delete Scheme', key: 'delete_scheme' },
      { action: 'Print Scheme', key: 'print_scheme_detail' },
      { action: 'Gold Price Change', key: 'gold_price_change' },
      { action: 'Gold Price Change Print', key: 'gold_price_change_print' },
    ],
  },
  {
    label: 'Carat',
    value: 'Carat',
    permissions: [
      { action: 'Create Carat', key: 'create_carat' },
      { action: 'Update Carat', key: 'update_carat' },
      { action: 'Delete Carat', key: 'delete_carat' },
      { action: 'Print Carat', key: 'print_carat_detail' },
    ],
  },
  {
    label: 'Property',
    value: 'Property',
    permissions: [
      { action: 'Create Property', key: 'create_property' },
      { action: 'Update Property', key: 'update_property' },
      { action: 'Delete Property', key: 'delete_property' },
      { action: 'Print Property', key: 'print_property' },
    ],
  },
  {
    label: 'Penalty',
    value: 'Penalty',
    permissions: [
      { action: 'Create Penalty', key: 'create_penalty' },
      { action: 'Update Penalty', key: 'update_penalty' },
      { action: 'Delete Penalty', key: 'delete_penalty' },
      { action: 'Print Penalty', key: 'print_penalty_detail' },
    ],
  },
  {
    label: 'Loan Issue',
    value: 'Loan Issue',
    permissions: [
      { action: 'Create Loan Issue', key: 'create_loan_issue' },
      { action: 'Update Loan Issue', key: 'update_loan_issue' },
      { action: 'Delete Loan Issue', key: 'delete_loan_issue' },
      { action: 'Print Loan Issue', key: 'print_loan_issue_detail' },
    ],
  },
  {
    label: 'Disburse',
    value: 'Disburse',
    permissions: [
      { action: 'Create Disburse', key: 'create_disburse' },
      { action: 'Update Disburse', key: 'update_disburse' },
      { action: 'Delete Disburse', key: 'delete_disburse' },
    ],
  },
  {
    label: 'Loan Pay History',
    value: 'Loan Pay History',
    permissions: [
      { action: 'Bulk Interest Pay', key: 'bulk_interest_pay' },
      { action: 'Update Loan Pay History', key: 'update_loan_pay_history' },
      { action: 'Print Loan Pay History', key: 'print_loan_pay_history_detail' },
      { action: 'Delete Loan', key: 'delete_loan' },
      { action: 'Create Interest', key: 'create_interest' },
      { action: 'Delete Interest', key: 'delete_interest' },
      { action: 'Create Part Release', key: 'create_part_release' },
      { action: 'Delete Part Release', key: 'delete_part_release' },
      { action: 'Create Uchak Interest', key: 'create_uchak_interest' },
      { action: 'Delete Uchak Interest', key: 'delete_uchak_interest' },
      { action: 'Create Loan Part Payment', key: 'create_loan_part_payment' },
      { action: 'Delete Loan Part Payment', key: 'delete_loan_part_payment' },
      { action: 'Create Loan Close', key: 'create_loan_close' },
    ],
  },
  {
    label: 'Secure Loan Pay History',
    value: 'Secure Loan Pay History',
    permissions: [],
  },
  {
    label: 'Unsecure Loan Pay History',
    value: 'Unsecure Loan Pay History',
    permissions: [],
  },
  {
    label: 'Other Loan Issue',
    value: 'Other Loan Issue',
    permissions: [
      { action: 'Create Other Loan Issue', key: 'create_other_loan_issue' },
      { action: 'Update Other Loan Issue', key: 'update_other_loan_issue' },
      { action: 'Delete Other Loan Issue', key: 'delete_other_loan_issue' },
    ],
  },
  {
    label: 'Other Loan Pay History',
    value: 'Other Loan Pay History',
    permissions: [
      { action: 'Update Other Loan Pay History', key: 'update_other_loan_pay_history' },
      { action: 'Delete Other Loan', key: 'delete_other_loan' },
      { action: 'Create Other Interest', key: 'create_other_interest' },
      { action: 'Delete Other Interest', key: 'delete_other_interest' },
      { action: 'Create Loan Close', key: 'create_other_loan_close' },
    ],
  },
  {
    label: 'Reminder',
    value: 'Reminder',
    permissions: [
      { action: 'Create Reminder', key: 'create_reminder' },
      { action: 'Update Reminder', key: 'update_reminder' },
      { action: 'Delete Reminder', key: 'delete_reminder' },
      { action: 'Print Reminder', key: 'print_reminder_detail' },
    ],
  },
  {
    label: 'Gold Loan Calculator',
    value: 'Gold Loan Calculator',
    permissions: [],
  },
  {
    label: 'Reports',
    value: 'Reports',
    permissions: [
      { action: 'All Branch Loan Summary', key: 'loan report' },
      { action: 'Branch Vise Loan Closing Report', key: 'loan closing report' },
      { action: 'Daily Reports', key: 'daily reports' },
      { action: 'Loan Report', key: 'loan details' },
      { action: 'Interest Reports', key: 'interest reports' },
      { action: 'Interest Entry Reports', key: 'interest entry reports' },
      { action: 'Customer Statement', key: 'customer statement' },
      { action: 'Customer Refrance Statement', key: 'customer refrance report' },
      { action: 'Loan Print View', key: 'loan print view' },
    ],
  },
  {
    label: 'Reports Print',
    value: 'Reports Print',
    permissions: [
      { action: 'Loan report', key: 'print_loan_report' },
      { action: 'Print Closing Report', key: 'print_loan_closing_report' },
      { action: 'Daily Reports', key: 'print_daily_reports' },
      { action: 'Loan Details', key: 'print_loan_details' },
      { action: 'Interest Reports', key: 'print_interest_reports' },
      { action: 'Interest Entry Report', key: 'print_interest_entry_report' },
      { action: 'Customer Statement', key: 'print_customer_statement' },
      { action: 'Customer Refrance Statement', key: 'print_customer_refrance_statement' },
      { action: 'Loan View Print', key: 'print_loan_view_print' },
    ],
  },
  {
    label: 'Other Reports',
    value: 'Other Reports',
    permissions: [
      { action: 'Other Loan Report', key: 'other loan reports' },
      { action: 'Other Loan Closing Report', key: 'other loan closing report' },
      { action: 'Other Loan Interest', key: 'other loan interest' },
      { action: 'Other Interest Entry Report', key: 'other interest entry reports' },
      { action: 'Other Loan Daily Reports', key: 'other loan daily reports' },
      { action: 'Total All In Out Loan Reports', key: 'total all in out loan reports' },
    ],
  },
  {
    label: 'Other Reports Print',
    value: 'Other Reports Print',
    permissions: [
      { action: 'Other Loan All Branch Reports', key: 'print_other_loan_all_branch_reports' },
      { action: 'Other Loan Close Reports', key: 'print_other_loan_close_reports' },
      { action: 'Other Loan Interest', key: 'print_other_loan_interest' },
      { action: 'Other Interest Entry Report', key: 'print_other_interest_entry_report' },
      { action: 'Other Loan Daily Reports', key: 'print_other_loan_daily_reports' },
      { action: 'Total All In Out Loan Reports', key: 'print_total_all_in_out_loan_reports' },
    ],
  },
  {
    label: 'Accounting',
    value: 'Accounting',
    permissions: [
      { action: 'Cash In', key: 'cash in' },
      { action: 'Bank Account', key: 'bank account' },
      { action: 'Expense', key: 'expence' },
      { action: 'Payment In Out', key: 'payment in/out' },
      { action: 'Charge In Out', key: 'charge in/out' },
      { action: 'Day Book', key: 'day book' },
      { action: 'All Transaction', key: 'all transaction' },
    ],
  },
  {
    label: 'Accounting Print',
    value: 'Accounting Print',
    permissions: [
      { action: 'Print Cash In', key: 'print_cash_in' },
      { action: 'Print Bank Account In', key: 'print_bank_account_in' },
      { action: 'Create Transfer', key: 'create_transfer' },
      { action: 'Delete Transfer', key: 'delete_transfer' },
      { action: 'Update Transfer', key: 'update_transfer' },
      { action: 'Create Expenses', key: 'create_expenses' },
      { action: 'Delete Expenses', key: 'delete_expenses' },
      { action: 'Update Expenses', key: 'update_expenses' },
      { action: 'Print Expenses', key: 'print_expenses' },
      { action: 'Create Party', key: 'create_party' },
      { action: 'Delete Party', key: 'delete_party' },
      { action: 'Update Party', key: 'update_party' },
      { action: 'Create Payment In/Out', key: 'create_payment_in_out' },
      { action: 'Delete Payment In/Out', key: 'delete_payment_in_out' },
      { action: 'Update Payment In/Out', key: 'update_payment_in_out' },
      { action: 'Print Payment In/Out', key: 'print_payment_in_out' },
      { action: 'Create Charge', key: 'create_charge' },
      { action: 'Delete Charge', key: 'delete_charge' },
      { action: 'Update Charge', key: 'update_charge' },
      { action: 'Print Charge', key: 'print_charge' },
      { action: 'Print Day Book', key: 'print_day_book' },
      { action: 'Print All Transaction', key: 'print_all_transaction' },
    ],
  },
  {
    label: 'Setting',
    value: 'Setting',
    permissions: [
      { action: 'Company Profile', key: 'Company Profile' },
      { action: 'Roles', key: 'Roles' },
      { action: 'Permission', key: 'Permission' },
      { action: 'Branch', key: 'Branch' },
      { action: 'Business Type', key: 'Business type' },
      { action: 'Loan Type', key: 'Loan type' },
      { action: 'Percentage', key: 'Percentage' },
      { action: 'Expense Type', key: 'Expense type' },
      { action: 'Charge Type', key: 'Charge type' },
      { action: 'Remark Type', key: 'Remark type' },
      { action: 'Export Policy Config', key: 'Export Policy Config' },
      { action: 'Other Name', key: 'Other Name' },
      { action: 'Month Tab', key: 'Month' },
      { action: 'WhatsApp Configs', key: 'WhatsApp Configs' },
      { action: 'Device Access', key: 'Device Access' },
      { action: 'Area', key: 'Area' },
    ],
  },
];

export default function PermissionView() {
  const methods = useForm();
  const { configs, mutate } = useGetConfigs();
  const { user } = useAuthContext();

  const [selectedRole, setSelectedRole] = useState(null);
  const [moduleSwitchState, setModuleSwitchState] = useState({});
  const [permissionsState, setPermissionsState] = useState({});
  const [openPopup, setOpenPopup] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [unsavedChanges, setUnsavedChanges] = useState(false);

  useEffect(() => {
    if (configs?.roles && selectedRole === null) {
      const rolesWithoutPermissions = configs.roles.filter(
        (role) =>
          role !== 'Admin' &&
          (!configs.permissions?.[role] || !configs.permissions[role]?.sections?.length)
      );
      setOpenPopup(rolesWithoutPermissions.length > 0);
    }
  }, [configs, selectedRole]);

  useEffect(() => {
    if (selectedRole) {
      const rolePermissions = configs.permissions?.[selectedRole] || {};
      const moduleStates = {};
      const permissionsStates = {};

      modules.forEach((module) => {
        const hasPermissions = rolePermissions.sections?.includes(module.value) || false;
        moduleStates[module.value] = module.value === 'Dashboard' ? true : hasPermissions;

        if (hasPermissions || module.value === 'Dashboard') {
          module.permissions.forEach((permission) => {
            permissionsStates[`${module.value}.${permission.key}`] =
              rolePermissions.responsibilities?.[permission.key] || false;
          });
        }
      });

      setModuleSwitchState(moduleStates);
      setPermissionsState(permissionsStates);
      setUnsavedChanges(false);
    }
  }, [selectedRole, configs]);

  const filteredModules = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return modules
      .map((module) => ({
        ...module,
        permissions: module.permissions.filter((p) =>
          p.action.toLowerCase().includes(query)
        ),
      }))
      .filter(
        (module) => module.label.toLowerCase().includes(query) || module.permissions.length > 0
      );
  }, [searchQuery]);

  const handleSwitchChange = (moduleValue, checked) => {
    if (moduleValue === 'Dashboard') return; // Dashboard always active

    setModuleSwitchState((prev) => ({ ...prev, [moduleValue]: checked }));
    setUnsavedChanges(true);

    if (!checked) {
      const updatedPermissions = { ...permissionsState };
      modules
        .find((m) => m.value === moduleValue)
        ?.permissions.forEach((permission) => {
        updatedPermissions[`${moduleValue}.${permission.key}`] = false;
      });
      setPermissionsState(updatedPermissions);
    }
  };

  const handleCheckboxChange = (moduleValue, actionKey, checked) => {
    setPermissionsState((prev) => ({
      ...prev,
      [`${moduleValue}.${actionKey}`]: checked,
    }));
    setUnsavedChanges(true);
  };

  const handleSelectAll = (moduleValue, selectAll) => {
    const updatedPermissions = { ...permissionsState };
    modules
      .find((m) => m.value === moduleValue)
      ?.permissions.forEach((permission) => {
      updatedPermissions[`${moduleValue}.${permission.key}`] = selectAll;
    });
    setPermissionsState(updatedPermissions);
    setUnsavedChanges(true);
  };

  const handleSave = () => {
    if (!selectedRole) return enqueueSnackbar('Please select a role', { variant: 'warning' });

    const updatedPermissions = {
      ...configs.permissions,
      [selectedRole]: {
        sections: modules
          .filter((module) => moduleSwitchState[module.value])
          .map((module) => module.value),
        responsibilities: modules.reduce((acc, module) => {
          module.permissions.forEach((permission) => {
            acc[permission.key] = !!permissionsState[`${module.value}.${permission.key}`];
          });
          return acc;
        }, {}),
      },
    };

    const URL = `${import.meta.env.VITE_BASE_URL}/${user?.company}/config/${configs?._id}`;
    axios
      .put(URL, { ...configs, permissions: updatedPermissions })
      .then(() => {
        enqueueSnackbar('Permissions updated successfully!', { variant: 'success' });
        mutate();
        setUnsavedChanges(false);
      })
      .catch(() => enqueueSnackbar('Failed to update permissions.', { variant: 'error' }));
  };

  return (
    <FormProvider {...methods}>
      <Box sx={{ p: 2 }}>
        <Card sx={{ p: 2, mb: 2, borderRadius: 2, boxShadow: 3, position: 'sticky', top: 0, zIndex: 10 }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center" justifyContent="space-between">
            <Stack direction="row" spacing={1} alignItems="center">
              <Iconify icon="mdi:shield-account" width={28} color="primary.main" />
              <Typography variant="h6" fontWeight={600}>
                Permission Management
              </Typography>
            </Stack>
            <Stack direction="row" spacing={1} alignItems="center">
              <Box sx={{ width: 250 }}>
                <RHFAutocomplete
                  name="role"
                  label="Select Role"
                  placeholder="Choose a Role"
                  options={configs?.roles?.filter((role) => role !== 'Admin') || []}
                  isOptionEqualToValue={(option, value) => option === value}
                  onChange={(_, value) => setSelectedRole(value)}
                />
              </Box>
              <TextField
                size="small"
                placeholder="Search modules or permissions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Iconify icon="eva:search-outline" width={20} />
                    </InputAdornment>
                  ),
                  endAdornment: searchQuery && (
                    <IconButton onClick={() => setSearchQuery('')}>
                      <Iconify icon="eva:close-circle-fill" width={20} />
                    </IconButton>
                  ),
                }}
              />
            </Stack>
          </Stack>
        </Card>
        {filteredModules.map((module, idx) => {
          const isActive = moduleSwitchState[module.value] || false;
          const activeCount = module.permissions.filter(
            (p) => permissionsState[`${module.value}.${p.key}`]
          ).length;

          return (
            <Card key={idx} sx={{ mb: 2, p: 2, borderRadius: 2, boxShadow: 2 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Stack spacing={0.5}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Typography variant="subtitle1" fontWeight={600}>{module.label}</Typography>
                    {activeCount > 0 && (
                      <Tooltip title={`${activeCount} of ${module.permissions.length} selected`}>
                        <Chip label={`${activeCount}/${module.permissions.length}`} size="small" color="success" />
                      </Tooltip>
                    )}
                  </Stack>
                  {module.permissions.length > 0 && (
                    <LinearProgress
                      variant="determinate"
                      value={(activeCount / module.permissions.length) * 100}
                      sx={{ height: 6, borderRadius: 3 }}
                    />
                  )}
                </Stack>
                <Switch checked={isActive} onChange={(e) => handleSwitchChange(module.value, e.target.checked)} />
              </Stack>
              {module.permissions.length > 0 && isActive && (
                <Box sx={{ mt: 2 }}>
                  <Stack direction="row" justifyContent="flex-end" spacing={1} mb={1}>
                    <Button size="small" variant="outlined" onClick={() => handleSelectAll(module.value, true)}>
                      <Iconify icon="mdi:check-all" /> Select All
                    </Button>
                    <Button size="small" variant="outlined" onClick={() => handleSelectAll(module.value, false)}>
                      <Iconify icon="mdi:close-circle-outline" /> Deselect All
                    </Button>
                  </Stack>
                  <Grid container spacing={1}>
                    {module.permissions.map((permission, idx) => (
                      <Grid item xs={12} sm={6} md={4} key={idx}>
                        <FormControlLabel
                          control={
                            <Controller
                              name={`${module.value}.${permission.key}`}
                              control={methods.control}
                              render={({ field }) => (
                                <Checkbox
                                  {...field}
                                  checked={permissionsState[`${module.value}.${permission.key}`] || false}
                                  onChange={(e) => {
                                    field.onChange(e.target.checked);
                                    handleCheckboxChange(module.value, permission.key, e.target.checked);
                                  }}
                                />
                              )}
                            />
                          }
                          label={permission.action}
                        />
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              )}
            </Card>
          );
        })}
        <Box sx={{ position: 'sticky', bottom: 0, py: 2, bgcolor: 'background.paper', borderTop: 1, borderColor: 'divider', mt: 3 }}>
          <Stack direction="row" spacing={2} justifyContent="flex-end">
            <Button variant="outlined" color="inherit" startIcon={<Iconify icon="mdi:restore" />} onClick={() => window.location.reload()}>
              Reset
            </Button>
            <Button variant="contained" startIcon={<Iconify icon="mdi:content-save" />} onClick={methods.handleSubmit(handleSave)} disabled={!unsavedChanges}>
              Save Changes
            </Button>
          </Stack>
        </Box>
        <Dialog open={openPopup} onClose={() => setOpenPopup(false)}>
          <DialogTitle>
            <Iconify icon="mdi:alert-circle-outline" color="warning.main" sx={{ mr: 1 }} />
            Missing Permissions
          </DialogTitle>
          <DialogContent>
            <Typography>Some roles do not have permissions assigned:</Typography>
            {configs?.roles
              ?.filter(
                (role) =>
                  role !== 'Admin' &&
                  (!configs.permissions?.[role] || !configs.permissions[role]?.sections?.length)
              )
              .map((role, idx) => (
                <Typography key={idx} sx={{ ml: 2, mt: 1 }}>• {role}</Typography>
              ))}
          </DialogContent>
          <DialogActions>
            <Button variant="contained" startIcon={<Iconify icon="mdi:close" />} onClick={() => setOpenPopup(false)}>
              Close
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </FormProvider>
  );
}
