import * as Yup from 'yup';
import React, { useMemo } from 'react';
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
import FormProvider, { RHFTextField } from 'src/components/hook-form';
import axios from 'axios';
import { useAuthContext } from '../../auth/hooks';
import RhfDatePicker from '../../components/hook-form/rhf-date-picker.jsx';

// ----------------------------------------------------------------------

export default function ReminderRecallingForm({
  currentReminderDetails,
  currentReminder,
  open,
  setOpen,
  mutate,
}) {
  const { enqueueSnackbar } = useSnackbar();
  const { user } = useAuthContext();

  const NewUserSchema = Yup.object().shape({
    nextRecallingDate: Yup.date()
      .required('Next Recalling Date is required')
      .nullable()
      .typeError('Date is required'),
  });

  const defaultValues = useMemo(
    () => ({
      nextRecallingDate: new Date(currentReminderDetails?.nextRecallingDate) || '',
      remark: currentReminderDetails?.remark || '',
    }),
    [currentReminderDetails]
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
    control,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    try {
      if (currentReminderDetails) {
        const payload2 = {
          nextRecallingDate: data.nextRecallingDate,
          remark: data.remark,
        };
        const res = await axios.put(
          `${import.meta.env.VITE_BASE_URL}/${user?.company}/reminder/${currentReminderDetails._id}`,
          payload2
        );
        mutate();
        onClose();
        enqueueSnackbar(res?.data.message);
      } else {
        const payload = {
          loan: currentReminder._id,
          nextRecallingDate: data.nextRecallingDate,
          remark: data.remark,
        };
        const res = await axios.post(
          `${import.meta.env.VITE_BASE_URL}/${user?.company}/reminder`,
          payload
        );
        mutate();
        onClose();
        reset();
        enqueueSnackbar(res?.data.message);
      }
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
        <DialogTitle>Loan Recalling Details</DialogTitle>
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
            <RhfDatePicker
              name="nextRecallingDate"
              control={control}
              label="Next Recalling Date"
              req={'red'}
            />
            <RHFTextField name="remark" label="Remark" />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button variant="outlined" onClick={onClose}>
            Cancel
          </Button>
          <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
            {currentReminderDetails ? 'Save' : 'Submit'}
          </LoadingButton>
        </DialogActions>
      </FormProvider>
    </Dialog>
  );
}

ReminderRecallingForm.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  currentUser: PropTypes.object,
};
