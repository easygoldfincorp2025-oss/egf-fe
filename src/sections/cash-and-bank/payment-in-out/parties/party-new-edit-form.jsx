import * as Yup from 'yup';
import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import LoadingButton from '@mui/lab/LoadingButton';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import { useSnackbar } from 'src/components/snackbar';
import FormProvider, { RHFAutocomplete, RHFTextField } from 'src/components/hook-form';
import axios from 'axios';
import { useAuthContext } from '../../../../auth/hooks/index.js';
import { useGetBranch } from '../../../../api/branch.js';

// ----------------------------------------------------------------------

export default function PartyNewEditForm({ partyName, currentParty, open, setOpen, mutate }) {
  const { enqueueSnackbar } = useSnackbar();
  const { user } = useAuthContext();
  const { branch } = useGetBranch();
  const storedBranch = sessionStorage.getItem('selectedBranch');

  const PartySchema = Yup.object().shape({
    name: Yup.string().required('Name is required'),
    contact: Yup.string()
      .required('Contact is required')
      .matches(/^[0-9]{10}$/, 'Contact must be exactly 10 digits'),
    branch: Yup.object().when(['isBranchUser'], {
      is: (isBranchUser) => !isBranchUser && storedBranch === 'all',
      then: (schema) => schema.required('Branch is required'),
      otherwise: (schema) => schema.nullable(),
    })
  });

  const defaultValues = {
    name: currentParty?.name || '',
    contact: currentParty?.contact || '',
    branch: currentParty?.branch || null,
    isBranchUser: user?.role === 'Admin',
  };

  const onClose = () => {
    setOpen(false);
    reset();
  };

  const methods = useForm({
    resolver: yupResolver(PartySchema),
    defaultValues,
  });

  const {
    reset,
    handleSubmit,
    control,
    setValue,
    formState: { isSubmitting },
  } = methods;

  useEffect(() => {
    setValue('name', partyName);
  }, [partyName]);

  useEffect(() => {
    if (currentParty) {
      reset({
        name: currentParty?.name || '',
        contact: currentParty?.contact || '',
        branch: currentParty?.branch
          ? { label: currentParty.branch?.name, value: currentParty?.branch?._id }
          : null,
        isBranchUser: user?.role === 'Admin',
      });
    }
  }, [currentParty, reset, user?.role]);

  useEffect(() => {
    setValue('isBranchUser', user?.role === 'Admin');
    if (user?.role !== 'Admin') {
      setValue('branch', null);
    }
  }, [user?.role, setValue]);

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
        parsedBranch === 'all' ? data?.branch?.value || branch?.[0]?._id : parsedBranch;

      const payload = {
        name: data.name,
        contact: data.contact,
        branch: selectedBranchId,
      };

      if (currentParty) {
        const res = await axios.put(
          `${import.meta.env.VITE_BASE_URL}/${user?.company}/party/${currentParty._id}`,
          payload,
        );
        mutate();
        onClose();
        enqueueSnackbar(res?.data.message);
      } else {
        const res = await axios.post(
          `${import.meta.env.VITE_BASE_URL}/${user?.company}/party`,
          payload,
        );
        mutate();
        onClose();
        reset();
        enqueueSnackbar(res?.data.message);
      }
    } catch (error) {
      console.error(error);
      enqueueSnackbar(error?.response?.data?.message || 'Something went wrong', {
        variant: 'error',
      });
    }
  });

  return (
    <Dialog
      fullWidth
      maxWidth={false}
      open={open}
      onClose={(event, reason) => {
        if (reason === 'backdropClick') {
          return;
        }
        onClose();
      }}
      PaperProps={{
        sx: { maxWidth: 720 },
      }}
    >
      <FormProvider methods={methods} onSubmit={onSubmit}>
        <DialogTitle>{currentParty ? 'Edit Party' : 'Add New Party'}</DialogTitle>
        <DialogContent>
          <Box
            rowGap={3}
            columnGap={2}
            display="grid"
            gridTemplateColumns={{
              xs: 'repeat(1, 1fr)',
              sm: 'repeat(2, 1fr)',
            }}
            mt={2}
          >
            <RHFTextField name="name" label="Name" req={'red'} />
            <RHFTextField name="contact" label="Contact" req={'red'} />
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
          </Box>
        </DialogContent>
        <DialogActions>
          <Button variant="outlined" onClick={onClose}>
            Cancel
          </Button>
          <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
            {currentParty ? 'Save' : 'Submit'}
          </LoadingButton>
        </DialogActions>
      </FormProvider>
    </Dialog>
  );
}

PartyNewEditForm.propTypes = {
  open: PropTypes.bool,
  setOpen: PropTypes.func,
  currentParty: PropTypes.object,
  mutate: PropTypes.func,
};
