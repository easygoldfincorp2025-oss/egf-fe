import React from 'react';
import PropTypes from 'prop-types';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import { useForm } from 'react-hook-form';
import FormProvider, { RHFAutocomplete, RHFTextField } from 'src/components/hook-form';
import RHFDatePicker from 'src/components/hook-form/rhf-date-picker';
import * as Yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { useGetBranch } from '../../../../api/branch.js';
import axios from 'axios';
import { useAuthContext } from '../../../../auth/hooks/index.js';
import { useSnackbar } from '../../../../components/snackbar/index.js';
import { useGetTransfer } from '../../../../api/transfer.js';

export default function TransferDialog({
  open,
  onClose,
  transferType,
  bankTransactionsMutate,
  currentTransferId,
  setCurrentTransferId,
}) {
  const { branch } = useGetBranch();
  const { user } = useAuthContext();
  const { enqueueSnackbar } = useSnackbar();
  const { transfer, mutate } = useGetTransfer();
  const storedBranch = sessionStorage.getItem('selectedBranch');
  const currentTransfer = transfer.find((item) => item?._id === currentTransferId);

  const defaultValues = {
    branch: currentTransfer
      ? {
          label: currentTransfer?.branch?.name,
          value: currentTransfer?.branch?._id,
        }
      : null,
    from: currentTransfer?.paymentDetail?.from || null,
    to: currentTransfer?.paymentDetail?.to || null,
    amount: currentTransfer?.paymentDetail?.amount || 0,
    desc: currentTransfer?.desc || '',
    adjustmentType: currentTransfer?.paymentDetail?.adjustmentType || '',
    adjustmentDate: currentTransfer?.adjustmentDate || new Date(),
    transferType: currentTransfer?.transferType || transferType,
  };

  const validationSchema = Yup.object().shape({
    from: Yup.object()
      .nullable()
      .when('transferType', {
        is: (val) => ['Bank To Bank', 'Bank To Cash', 'Adjust Bank Balance'].includes(val),
        then: (schema) => schema.required('From account is required'),
        otherwise: (schema) => schema,
      }),
    to: Yup.object()
      .nullable()
      .when('transferType', {
        is: (val) => ['Bank To Bank', 'Cash To Bank'].includes(val),
        then: (schema) => schema.required('To account is required'),
        otherwise: (schema) => schema,
      }),
    amount: Yup.number()
      .typeError('Amount must be a number')
      .required('Amount is required')
      .positive('Amount must be greater than 0'),
    desc: Yup.string().nullable(), // Description is optional
    adjustmentType: Yup.string().when('transferType', {
      is: 'Adjust Bank Balance',
      then: (schema) => schema.required('Adjustment type is required'),
      otherwise: (schema) => schema,
    }),
    adjustmentDate: Yup.date().required('Adjustment date is required'),
    branch: Yup.object().when([], {
      is: () => user?.role === 'Admin' && storedBranch === 'all',
      then: (schema) => schema.required('Branch is required'),
      otherwise: (schema) => schema.nullable(),
    }),
  });

  const methods = useForm({
    defaultValues,
    mode: 'onTouched',
    resolver: yupResolver(
      validationSchema.concat(Yup.object().shape({ transferType: Yup.string() }))
    ),
  });

  const {
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = methods;

  const watchTransferType = watch('transferType', currentTransfer?.transferType || transferType);
  const selectedBranch = watch('branch')?.value;
  // For non-admin users, branch is always available from session storage
  // For admin users, branch selection is required only when storedBranch is 'all'
  const isBranchSelectionRequired = user?.role === 'Admin' && storedBranch === 'all';
  const isBranchSelected = user?.role !== 'Admin' ? Boolean(storedBranch) : Boolean(selectedBranch);

  // For non-admin users, use storedBranch; for admin users, use selectedBranch from form
  const branchIdForAccounts = user?.role !== 'Admin' ? storedBranch : selectedBranch;

  const branchwiseAcc =
    branch?.find((b) => b._id === branchIdForAccounts)?.company?.bankAccounts || [];
  const toBranchAcc =
    branch
      ?.find((b) => b._id === branchIdForAccounts)
      ?.company?.bankAccounts.filter((acc) => acc._id !== watch('from')?._id) || [];

  React.useEffect(() => {
    if (open) {
      reset({ ...defaultValues, transferType: currentTransfer?.transferType || transferType });
    } else {
      reset(defaultValues);
    }
  }, [open, transferType, reset, currentTransfer]);

  const onFormSubmit = async (values) => {
    let selectedBranchId;

    // For non-admin users, always use branch from session storage
    if (user?.role !== 'Admin') {
      selectedBranchId = storedBranch;
    } else {
      // For admin users, if storedBranch is 'all', use selected branch from form or first branch
      const parsedBranch = storedBranch;
      selectedBranchId =
        parsedBranch === 'all' ? values?.branch?.value || branch?.[0]?._id : parsedBranch;
    }

    let payload = {
      entryBy: user?._id,
      branch: selectedBranchId,
      company: user.company,
      transferType: watchTransferType,
      transferDate: values.adjustmentDate,
      desc: values.desc,
      paymentDetail: {},
    };
    if (watchTransferType === 'Bank To Bank') {
      payload.paymentDetail = {
        from: values.from,
        to: values.to,
        amount: Number(values.amount),
      };
    } else if (watchTransferType === 'Bank To Cash') {
      payload.paymentDetail = {
        from: values.from,
        to: 'Cash',
        amount: Number(values.amount),
      };
    } else if (watchTransferType === 'Cash To Bank') {
      payload.paymentDetail = {
        from: values.from,
        to: values.to,
        amount: Number(values.amount),
      };
    } else if (watchTransferType === 'Adjust Bank Balance') {
      payload.paymentDetail = {
        from: values.from,
        amount: Number(values.amount),
        adjustmentType: values.adjustmentType,
      };
    }

    try {
      const apiUrl = currentTransfer
        ? `${import.meta.env.VITE_BASE_URL}/${user.company}/transfer/${currentTransferId}`
        : `${import.meta.env.VITE_BASE_URL}/${user.company}/transfer`;

      let res;

      if (currentTransfer) {
        res = await axios.put(apiUrl, payload);
        setCurrentTransferId('');
      } else {
        res = await axios.post(apiUrl, payload);
      }
      bankTransactionsMutate();
      mutate();
      reset();
      enqueueSnackbar(res.data.message);
      onClose();
    } catch (error) {
      enqueueSnackbar(error?.response?.data?.message || error?.message, {
        variant: 'error',
      });
    }
  };


  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{watchTransferType} Transfer</DialogTitle>
      <FormProvider methods={methods} onSubmit={handleSubmit(onFormSubmit)}>
        <DialogContent>
          <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            {user?.role === 'Admin' && storedBranch === 'all' && (
              <RHFAutocomplete
                name="branch"
                req={'red'}
                label="Branch"
                placeholder="Choose a Branch"
                options={
                  branch?.map((branchItem) => ({
                    label: branchItem?.name,
                    value: branchItem?._id,
                  })) || []
                }
                isOptionEqualToValue={(option, value) => option?.value === value?.value}
              />
            )}
            {(watchTransferType === 'Bank To Bank' ||
              watchTransferType === 'Bank To Cash' ||
              watchTransferType === 'Adjust Bank Balance') && (
              <RHFAutocomplete
                name="from"
                label="From"
                req="red"
                fullWidth
                options={branchwiseAcc}
                disabled={isBranchSelectionRequired && !isBranchSelected}
                getOptionLabel={(option) =>
                  `${option.bankName} (${option.accountHolderName})` || ''
                }
                renderOption={(props, option) => (
                  <li {...props} key={option.id || option.bankName}>
                    {`${option.bankName} (${option.accountHolderName})`}
                  </li>
                )}
                isOptionEqualToValue={(option, value) => option.id === value.id}
              />
            )}
            {watchTransferType === 'Cash To Bank' && (
              <RHFTextField
                name="from"
                label="From"
                req={'red'}
                value={'Cash'}
                disabled={true}
                InputLabelProps={{ shrink: true }}
              />
            )}
            {(watchTransferType === 'Bank To Bank' || watchTransferType === 'Cash To Bank') && (
              <RHFAutocomplete
                name="to"
                label="To"
                req="red"
                fullWidth
                options={toBranchAcc}
                disabled={isBranchSelectionRequired && !isBranchSelected}
                getOptionLabel={(option) =>
                  `${option.bankName} (${option.accountHolderName})` || ''
                }
                renderOption={(props, option) => (
                  <li {...props} key={option._id}>
                    {`${option.bankName} (${option.accountHolderName})`}
                  </li>
                )}
                isOptionEqualToValue={(option, value) => option._id === value?._id}
              />
            )}
            {watchTransferType === 'Bank To Cash' && (
              <RHFTextField
                name="to"
                label="To"
                req={'red'}
                value={'Cash'}
                disabled={true}
                InputLabelProps={{ shrink: true }}
              />
            )}
            <RHFTextField name="amount" label="Amount" type="number" req={'red'} />
            <RHFDatePicker
              name="adjustmentDate"
              label="Adjustment Date"
              helperText={errors.adjustmentDate?.message}
              req={'red'}
            />
            <RHFTextField name="desc" label="Add Description" helperText={errors.desc?.message} />
            {watchTransferType === 'Adjust Bank Balance' && (
              <RHFAutocomplete
                name="adjustmentType"
                label="Type"
                options={['Increase balance', 'Decrease balance']}
                req={'red'}
              />
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} color="inherit" type="button">
            Cancel
          </Button>
          <Button type="submit" variant="contained">
            {currentTransfer ? 'Save' : 'Submit'}
          </Button>
        </DialogActions>
      </FormProvider>
    </Dialog>
  );
}

TransferDialog.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  transferType: PropTypes.string,
};
