import * as Yup from 'yup';
import PropTypes from 'prop-types';
import React, { useEffect, useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Unstable_Grid2';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import { paths } from 'src/routes/paths.js';
import { useRouter } from 'src/routes/hooks/index.js';
import { useSnackbar } from 'src/components/snackbar/index.js';
import FormProvider, { RHFAutocomplete, RHFTextField } from 'src/components/hook-form/index.js';
import axios from 'axios';
import { useAuthContext } from '../../../auth/hooks/index.js';
import { Button } from '@mui/material';
import RhfDatePicker from '../../../components/hook-form/rhf-date-picker.jsx';
import { useGetConfigs } from '../../../api/config.js';
import { useGetBranch } from '../../../api/branch.js';

export default function ChargeInOutNewEditForm({ currentCharge }) {
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();
  const { user } = useAuthContext();
  const { configs } = useGetConfigs();
  const { branch } = useGetBranch();
  const [paymentMode, setPaymentMode] = useState('');
  const storedBranch = sessionStorage.getItem('selectedBranch');

  const paymentSchema =
    paymentMode === 'Bank'
      ? {
          account: Yup.object().required('Account is required').typeError('Account is required'),
          bankAmount: Yup.string()
            .required('Bank Amount is required')
            .test(
              'is-positive',
              'Bank Amount must be a positive number',
              (value) => parseFloat(value) >= 0
            ),
        }
      : paymentMode === 'Cash'
        ? {
            cashAmount: Yup.number()
              .typeError('Cash Amount must be a valid number')
              .required('Cash Amount is required')
              .min(0, 'Cash Amount must be a positive number'),
          }
        : {
            cashAmount: Yup.number()
              .typeError('Cash Amount must be a valid number')
              .required('Cash Amount is required')
              .min(0, 'Cash Amount must be a positive number'),
            bankAmount: Yup.string()
              .required('Bank Amount is required')
              .test(
                'is-positive',
                'Bank Amount must be a positive number',
                (value) => parseFloat(value) >= 0
              ),
            account: Yup.object().required('Account is required'),
          };

  const NewSchema = Yup.object().shape({
    chargeType: Yup.string().required('Charge Type is required'),
    category: Yup.string().required('Category is required'),
    paymentMode: Yup.string().required('Payment Mode is required'),
    paymentType: Yup.string().required('Payment Type is required'),
    date: Yup.date().typeError('Please enter a valid date').required('Date is required'),
    branchId: Yup.object().when([], {
      is: () => user?.role === 'Admin' && storedBranch === 'all',
      then: (schema) => schema.required('Branch is required'),
      otherwise: (schema) => schema.nullable(),
    }),
    ...paymentSchema,
  });

  const defaultValues = useMemo(
    () => ({
      chargeType: currentCharge?.chargeType || '',
      category: currentCharge?.category || '',
      date: currentCharge?.date ? new Date(currentCharge?.date) : new Date(),
      description: currentCharge?.description || '',
      paymentMode: currentCharge?.paymentDetail?.paymentMode || '',
      account:
        currentCharge?.paymentDetail?.account ||
        currentCharge?.paymentDetail?.bankDetails?.account ||
        null,
      cashAmount: currentCharge?.paymentDetail?.cashAmount || '',
      bankAmount: currentCharge?.paymentDetail?.bankAmount || '',
      branchId: currentCharge
        ? {
            label: currentCharge?.branch?.name,
            value: currentCharge?.branch?._id,
          }
        : null,
      paymentType: currentCharge?.status || '',
    }),
    [currentCharge]
  );

  const methods = useForm({
    resolver: yupResolver(NewSchema),
    defaultValues,
  });

  const {
    reset,
    watch,
    handleSubmit,
    control,
    setValue,
    getValues,
    formState: { isSubmitting },
  } = methods;

  useEffect(() => {
    setPaymentMode(watch('paymentMode'));
  }, [watch('paymentMode')]);

  const onSubmit = handleSubmit(async (data) => {
    try {
      let parsedBranch = storedBranch;
      if (storedBranch !== 'all') {
        try {
          parsedBranch = storedBranch;
        } catch (error) {
          console.error('Error parsing storedBranch:', error);
        }
      }

      const selectedBranchId =
        parsedBranch === 'all' ? data?.branchId?.value || branch?.[0]?._id : parsedBranch;

      const paymentDetail = {
        paymentMode: data.paymentMode,
        ...(data.paymentMode === 'Cash' && { cashAmount: data.cashAmount }),
        ...(data.paymentMode === 'Bank' && {
          bankAmount: data.bankAmount,
          account: data.account,
        }),
        ...(data.paymentMode === 'Both' && {
          cashAmount: data.cashAmount,
          bankAmount: data.bankAmount,
          account: data.account,
        }),
      };

      const payload = {
        chargeType: data.chargeType,
        description: data.description,
        category: data.category,
        date: data.date,
        branch: selectedBranchId,
        status: data.paymentType,
        paymentDetail: paymentDetail,
      };

      const baseUrl = `${import.meta.env.VITE_BASE_URL}/${user?.company}/charge`;

      const res = currentCharge
        ? await axios.put(
            `${import.meta.env.VITE_BASE_URL}/${user?.company}/charge/${currentCharge._id}`,
            payload,
            { headers: { 'Content-Type': 'application/json' } }
          )
        : await axios.post(baseUrl, payload, {
            headers: { 'Content-Type': 'application/json' },
          });

      router.push(paths.dashboard.cashAndBank.chargeInOut.list);
      enqueueSnackbar(res?.data.message);
      reset();
    } catch (error) {
      alert(error.message);
      enqueueSnackbar(
        currentCharge ? 'Failed to update charge In/Out' : error.response?.data?.message,
        { variant: 'error' }
      );
      console.error(error);
    }
  });

  return (
    <FormProvider methods={methods} onSubmit={onSubmit}>
      <Grid container spacing={3}>
        <Grid xs={12} md={4}>
          <Typography variant="subtitle1" sx={{ mb: 0.5, fontWeight: '600' }}>
            Charge in/out Info
          </Typography>
        </Grid>
        <Grid xs={12} md={8}>
          <Card sx={{ p: 3 }}>
            <Box
              rowGap={3}
              columnGap={2}
              display="grid"
              gridTemplateColumns={{
                xs: 'repeat(1, 1fr)',
                sm: 'repeat(2, 1fr)',
              }}
            >
              {user?.role === 'Admin' && storedBranch === 'all' && (
                <RHFAutocomplete
                  name="branchId"
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
              <RHFAutocomplete
                name="chargeType"
                label="Charge Type"
                req="red"
                fullWidth
                options={configs?.chargeType || []}
                getOptionLabel={(option) => option || ''}
                renderOption={(props, option, { index }) => (
                  <li {...props} key={index}>
                    {option}
                  </li>
                )}
              />
              <RHFAutocomplete
                name="paymentType"
                label="Payment Type"
                req="red"
                fullWidth
                options={['Payment In', 'Payment Out']}
                getOptionLabel={(option) => option || ''}
                renderOption={(props, option, { index }) => (
                  <li {...props} key={index}>
                    {option}
                  </li>
                )}
              />
              <RHFTextField
                name="category"
                label="Category"
                req="red"
                inputProps={{ style: { textTransform: 'uppercase' } }}
              />
              <RhfDatePicker name="date" control={control} label="Date" req="red" />
              <RHFTextField name="description" label="Description" multiline />
            </Box>
            <Typography variant="subtitle1" sx={{ my: 2, fontWeight: 600 }}>
              Payment Details
            </Typography>
            <Box>
              <Box
                rowGap={3}
                columnGap={2}
                display="grid"
                gridTemplateColumns={{
                  xs: 'repeat(1, 1fr)',
                  sm: 'repeat(3, 1fr)',
                }}
                sx={{ mt: 1 }}
              >
                <RHFAutocomplete
                  name="paymentMode"
                  label="Payment Mode"
                  options={['Cash', 'Bank', 'Both']}
                  onChange={(event, value) => {
                    setValue('paymentMode', value);
                    const totalAmountPaid = parseFloat(watch('amountPaid')) || 0;
                    if (value === 'Cash') {
                      setValue('cashAmount', totalAmountPaid);
                      setValue('bankAmount', 0);
                    } else if (value === 'Bank') {
                      setValue('bankAmount', totalAmountPaid);
                      setValue('cashAmount', 0);
                    } else if (value === 'Both') {
                      const splitCash = totalAmountPaid * 0.5;
                      setValue('cashAmount', splitCash.toFixed(2));
                      setValue('bankAmount', (totalAmountPaid - splitCash).toFixed(2));
                    }
                  }}
                />
                {(watch('paymentMode') === 'Cash' || watch('paymentMode') === 'Both') && (
                  <Controller
                    name="cashAmount"
                    control={control}
                    render={({ field }) => (
                      <RHFTextField
                        {...field}
                        label="Cash Amount"
                        req="red"
                        inputProps={{ min: 0 }}
                      />
                    )}
                  />
                )}
                {(watch('paymentMode') === 'Bank' || watch('paymentMode') === 'Both') && (
                  <>
                    <RHFAutocomplete
                      name="account"
                      label="Account"
                      req="red"
                      fullWidth
                      options={Array.from(
                        new Map(
                          branch
                            .flatMap((item) => item.company.bankAccounts)
                            .map((item) => [item.bankName + item._id, item])
                        ).values()
                      )}
                      getOptionLabel={(option) =>
                        `${option.bankName} (${option.accountHolderName})` || ''
                      }
                      renderOption={(props, option) => (
                        <li {...props} key={option._id || option.bankName}>
                          {`${option.bankName} (${option.accountHolderName})`}
                        </li>
                      )}
                      isOptionEqualToValue={(option, value) => option._id === value._id}
                    />
                    <Controller
                      name="bankAmount"
                      control={control}
                      render={({ field }) => (
                        <RHFTextField
                          {...field}
                          label="Bank Amount"
                          req="red"
                          inputProps={{ min: 0 }}
                        />
                      )}
                    />
                  </>
                )}
              </Box>
            </Box>
          </Card>
          <Box xs={12} md={8} sx={{ display: 'flex', justifyContent: 'end', mt: 3 }}>
            <Button
              color="inherit"
              sx={{ margin: '0px 10px', height: '36px' }}
              variant="outlined"
              onClick={() => reset()}
            >
              Reset
            </Button>
            <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
              {currentCharge ? 'Save' : 'Submit'}
            </LoadingButton>
          </Box>
        </Grid>
      </Grid>
    </FormProvider>
  );
}

ChargeInOutNewEditForm.propTypes = {
  currentCharge: PropTypes.object,
};
