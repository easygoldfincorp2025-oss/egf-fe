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
import { Button } from '@mui/material';
import { useGetBranch } from '../../api/branch.js';

// ----------------------------------------------------------------------

export default function CaratNewEditForm({ currentCarat }) {
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();
  const { user } = useAuthContext();
  const storedBranch = sessionStorage.getItem('selectedBranch');
  const { branch } = useGetBranch();

  const NewCarat = Yup.object().shape({
    branch: Yup.object().when([], {
      is: () => user?.role === 'Admin' && storedBranch === 'all',
      then: (schema) => schema.required('Branch is required'),
      otherwise: (schema) => schema.nullable(),
    }),
    name: Yup.string().required('Scheme Name is required'),
    caratPercentage: Yup.string().required('Carat Percentagee is required'),
  });

  const defaultValues = useMemo(
    () => ({
      branch: currentCarat
        ? {
            label: currentCarat?.branch?.name,
            value: currentCarat?.branch?._id,
          }
        : null,
      name: currentCarat?.name || '',
      caratPercentage: currentCarat?.caratPercentage || '',
      remark: currentCarat?.remark || '',
      isActive: currentCarat?.isActive || '',
    }),
    [currentCarat]
  );

  const methods = useForm({
    resolver: yupResolver(NewCarat),
    defaultValues,
  });

  const {
    reset,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

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

      const payload = { ...data, branch: selectedBranchId };
      if (currentCarat) {
        const res = await axios.put(
          `${import.meta.env.VITE_BASE_URL}/${user?.company}/carat/${currentCarat._id}`,
          payload
        );
        router.push(paths.dashboard.carat.list);
        enqueueSnackbar(res?.data.message);
        reset();
      } else {
        const res = await axios.post(
          `${import.meta.env.VITE_BASE_URL}/${user?.company}/carat`,
          payload
        );
        router.push(paths.dashboard.carat.list);
        enqueueSnackbar(res?.data.message);
        reset();
      }
    } catch (error) {
      enqueueSnackbar(currentCarat ? 'Failed To update Carat' : error.response.data.message, {
        variant: 'error',
      });
      console.error(error);
    }
  });

  return (
    <FormProvider methods={methods} onSubmit={onSubmit}>
      <Grid container spacing={3}>
        <Grid xs={12} md={4}>
          <Typography variant="subtitle1" sx={{ mb: 0.5, fontWeight: '600' }}>
            Carat Info
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
              <RHFTextField
                name="name"
                label="carat"
                req={'red'}
                onKeyPress={(e) => {
                  if (!/[0-9.]/.test(e.key) || (e.key === '.' && e.target.value.includes('.'))) {
                    e.preventDefault();
                  }
                }}
              />
              <RHFTextField
                name="caratPercentage"
                label="Carat%"
                req={'red'}
                onKeyPress={(e) => {
                  if (!/[0-9.]/.test(e.key) || (e.key === '.' && e.target.value.includes('.'))) {
                    e.preventDefault();
                  }
                }}
              />
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
              {currentCarat && <RHFSwitch name="isActive" label={'is Active'} sx={{ m: 0 }} />}
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
              {currentCarat ? 'Save' : 'Submit'}
            </LoadingButton>
          </Box>
        </Grid>
      </Grid>
    </FormProvider>
  );
}
CaratNewEditForm.propTypes = {
  currentScheme: PropTypes.object,
};
