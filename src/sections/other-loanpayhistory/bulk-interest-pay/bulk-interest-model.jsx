import React, { useMemo } from 'react';
import * as Yup from 'yup';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import Dialog from '@mui/material/Dialog';
import FormProvider, { RHFAutocomplete } from '../../../components/hook-form';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import Box from '@mui/material/Box';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import LoadingButton from '@mui/lab/LoadingButton';
import { useGetLoanissue } from '../../../api/loanissue';
import { useGetCustomer } from '../../../api/customer';
import { paths } from '../../../routes/paths';
import { useRouter } from '../../../routes/hooks';

function BulkInterestModel({ open, setOpen }) {
  const router = useRouter();
  const loanPayHistory = true;
  const { customer } = useGetCustomer();
  const { Loanissue } = useGetLoanissue(loanPayHistory);

  const NewUserSchema = Yup.object().shape({
    customer: Yup.object().required('Customer is required'),
    loans: Yup.array()
      .of(Yup.object().shape({}))
      .min(1, 'At least one loan is required')
      .required('Loan is required'),
  });

  const defaultValues = useMemo(
    () => ({
      customer: null,
      loans: [],
    }),
    [],
  );

  const onClose = () => {
    setOpen(false);
    reset();
  };

  const methods = useForm({
    resolver: yupResolver(NewUserSchema),
    defaultValues,
  });

  const {
    reset,
    handleSubmit,
    watch,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    try {
      const filteredLoanNo = data.loans.map((item) => item.loanNo);
      const dataStore = {
        customer: data.customer,
        filteredLoanNo: filteredLoanNo,
      };
      sessionStorage.setItem('data', JSON.stringify(dataStore));
      router.push(paths.dashboard.loanPayHistory.bulk);
    } catch (error) {
      console.error(error);
    }
  });

  return (
    <Dialog
      fullWidth
      maxWidth={false}
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: { maxWidth: 720 },
      }}
    >
      <FormProvider methods={methods} onSubmit={onSubmit}>
        <DialogTitle>Bulk Interest Pay</DialogTitle>
        <DialogContent>
          <Box
            rowGap={3}
            columnGap={2}
            display='grid'
            gridTemplateColumns={{
              xs: 'repeat(1, 1fr)',
              sm: 'repeat(2, 1fr)',
            }}
            mt={1}
          >
            {customer && <RHFAutocomplete
              name='customer'
              label='Customer'
              options={customer}
              getOptionLabel={(option) => option.firstName + ' ' + option.middleName + ' ' + option.lastName}
              isOptionEqualToValue={(option, value) => option._id === value._id}
              renderOption={(props, option) => (
                <li {...props} key={option._id}>
                  {option.firstName + ' ' + option.middleName + ' ' + option.lastName}
                </li>
              )}
            />}
            {Loanissue && <RHFAutocomplete
              name='loans'
              label='Loans'
              options={Loanissue.filter((item) => item.customer._id === watch('customer')?._id)}
              multiple
              getOptionLabel={(option) => option.loanNo}
              isOptionEqualToValue={(option, value) => option.loanNo === value.loanNo}
              renderOption={(props, option) => (
                <li {...props} key={option.loanNo}>
                  {option.loanNo}
                </li>
              )}
            />}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button variant='outlined' onClick={onClose}>
            Cancel
          </Button>
          <LoadingButton type='submit' variant='contained' loading={isSubmitting}>
            Submit
          </LoadingButton>
        </DialogActions>
      </FormProvider>
    </Dialog>
  );
}


export default BulkInterestModel;
