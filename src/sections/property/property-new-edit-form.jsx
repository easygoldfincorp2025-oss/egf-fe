import * as Yup from 'yup';
import PropTypes from 'prop-types';
import React, { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Unstable_Grid2';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';
import { useSnackbar } from 'src/components/snackbar';
import FormProvider, { RHFAutocomplete, RHFSwitch, RHFTextField } from 'src/components/hook-form';
import axios from 'axios';
import { useAuthContext } from '../../auth/hooks';
import { useGetConfigs } from '../../api/config';
import { Button } from '@mui/material';

// ----------------------------------------------------------------------

export default function PropertyNewEditForm({ currentProperty }) {
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();
  const { user } = useAuthContext();
  const { configs } = useGetConfigs();

  const NewSchemaProperty = Yup.object().shape({
    propertyType: Yup.string().required('Property is required'),
    loanType: Yup.string().required('Loan Type is required'),
    quantity: Yup.string().required('Loan Type is quantity'),
    remark: Yup.string(),
  });

  const defaultValues = useMemo(
    () => (
      {
        propertyType: currentProperty?.propertyType || '',
        loanType: currentProperty?.loanType || null,
        quantity: currentProperty?.quantity || 1,
        remark: currentProperty?.remark || '',
        isActive: currentProperty?.isActive || null,
        isQtyEdit: currentProperty?.isQtyEdit || !currentProperty && true,
      }),
    [currentProperty],
  );

  const methods = useForm({
    resolver: yupResolver(NewSchemaProperty),
    defaultValues,
  });

  const {
    reset,
    watch,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const values = watch();
  const onSubmit = handleSubmit(async (data) => {
    try {
      if (currentProperty) {
        const res = await axios.put(`${import.meta.env.VITE_BASE_URL}/${user?.company}/property/${currentProperty._id}`, data);
        router.push(paths.dashboard.property.list);
        enqueueSnackbar(res?.data.message);
        reset();
      } else {
        const res = await axios.post(`${import.meta.env.VITE_BASE_URL}/${user?.company}/property`, data);
        router.push(paths.dashboard.property.list);
        enqueueSnackbar(res?.data.message);
        reset();
      }
    } catch (error) {
      enqueueSnackbar(currentProperty ? 'Failed To update Property' : error.response.data.message, { variant: 'error' });
      console.error(error);
    }
  });

  return (
    <FormProvider methods={methods} onSubmit={onSubmit}>
      <Grid container spacing={3}>
        <Grid xs={12} md={4}>
          <Typography variant='subtitle1' sx={{ mb: 0.5, fontWeight: '600' }}>
            Property Info
          </Typography>
        </Grid>
        <Grid xs={12} md={8}>
          <Card sx={{ p: 3 }}>
            <Box
              rowGap={3}
              columnGap={2}
              display='grid'
              gridTemplateColumns={{
                xs: 'repeat(1, 1fr)',
                sm: 'repeat(2, 1fr)',
              }}
            >
              <RHFTextField
                name='propertyType'
                label='Property'
                req={'red'}
                inputProps={{ style: { textTransform: 'uppercase' } }}
                onChange={(e) => {
                  e.target.value = e.target.value.toUpperCase();
                  methods.setValue('propertyType', e.target.value);
                }}
              />
              {configs.loanTypes &&
              <RHFAutocomplete
                name='loanType'
                label='Loan Type'
                req={'red'}
                fullWidth
                options={configs?.loanTypes?.length > 0 ? configs.loanTypes.map((loan) => loan.loanType) : []}
                getOptionLabel={(option) => option}
                renderOption={(props, option) => (
                  <li {...props} key={option}>
                    {option}
                  </li>
                )}
              />}
              <RHFTextField name='quantity' label='Quantity' req={'red'} disabled={!values.isQtyEdit}
                            onKeyPress={(e) => {
                              if (!/[0-9]/.test(e.key)) {
                                e.preventDefault();
                              }
                            }} />
              <RHFTextField
                name='remark'
                label='Remark'
                fullWidth
                onInput={(e) => {
                  e.target.value = e.target.value.toUpperCase();
                }}
              />
            </Box>
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
              {
                currentProperty &&
                <RHFSwitch name='isActive' label={'Is Active'} sx={{ m: 0 }} />
              }
            </Box>
            <RHFSwitch name='isQtyEdit' label={'Is Qty Edit'} sx={{ m: 0 }} />
          </Card>
          <Box xs={12} md={8} sx={{ display: 'flex', justifyContent: 'end', mt: 3 }}>
            <Button color='inherit' sx={{ margin: '0px 10px', height: '36px' }}
                    variant='outlined' onClick={() => reset()}>Reset</Button>
            <LoadingButton type='submit' variant='contained' loading={isSubmitting}>
              {currentProperty ? 'Save' : 'Submit'}
            </LoadingButton>
          </Box>
        </Grid>
      </Grid>
    </FormProvider>
  );
}

PropertyNewEditForm.propTypes = {
  currentProperty: PropTypes.object,
};
