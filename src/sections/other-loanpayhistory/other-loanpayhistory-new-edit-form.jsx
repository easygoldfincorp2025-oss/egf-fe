import React, { useEffect, useMemo, useState } from 'react';
import Grid from '@mui/material/Unstable_Grid2';
import FormProvider, { RHFTextField } from '../../components/hook-form';
import Card from '@mui/material/Card';
import Box from '@mui/material/Box';
import { useForm } from 'react-hook-form';
import { useAuthContext } from '../../auth/hooks';
import * as Yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import RhfDatePicker from '../../components/hook-form/rhf-date-picker.jsx';
import Typography from '@mui/material/Typography';
import Lightbox, { useLightBox } from 'src/components/lightbox';
import Image from '../../components/image';

// ----------------------------------------------------------------------

function OtherLoanpayhistoryNewEditForm({ currentOtherLoan, mutate }) {
  const { user } = useAuthContext();
  const [file, setFile] = useState(currentOtherLoan?.loan?.propertyImage);
  const lightbox = useLightBox(file);

  const cutoffDate = new Date("2025-08-01");

  const renewDate = () => {
    if (!currentOtherLoan?.loan?.issueDate) return null;

    const {
      issueDate,
      scheme: { renewalTime },
    } = currentOtherLoan?.loan;
    const monthsToAdd =
      renewalTime === 'Monthly'
        ? 1
        : renewalTime === 'yearly'
          ? 12
          : parseInt(renewalTime.split(' ')[0], 10) || 0;
    return new Date(new Date(issueDate).setMonth(new Date(issueDate).getMonth() + monthsToAdd));
  };

  const NewLoanPayHistorySchema = Yup.object().shape({
    loanNo: Yup.string().required('Loan No. is required'),
    customerName: Yup.string().required('Customer Name is required'),
    address: Yup.string().required('Address is required'),
    contact: Yup.string()
      .required('Mobile number is required')
      .matches(/^\d{10,16}$/, 'Mobile number must be between 10 and 16 digits'),
    issueDate: Yup.date()
      .required('Issue Date is required')
      .nullable()
      .typeError('Invalid Issue Date'),
    schemeName: Yup.string()
      .required('Scheme Name is required')
      .max(10, 'Scheme Name must be exactly 10 characters'),
    closedBy: Yup.string().required('Closed By is required'),
    interest: Yup.number()
      .required('Interest is required')
      .typeError('Interest must be a number')
      .max(100, 'Interest cannot exceed 100%'),
    consultingCharge: Yup.number().required('Consult Charge is required'),
    loanAmount: Yup.number().required('Loan Amount is required'),
    interestLoanAmount: Yup.number().required('Interest Loan Amount is required'),
    loanPeriod: Yup.number().required('Loan Period is required'),
    IntPeriodTime: Yup.number().required('Interest Period Time is required'),
    nextInterestPayDate: Yup.date()
      .nullable()
      .required('Next Interest Pay Date is required')
      .typeError('Invalid Next Interest Pay Date'),
    lastInterestPayDate: Yup.date()
      .nullable()
      .required('Last Interest Pay Date is required')
      .typeError('Invalid Last Interest Pay Date'),
  });

  const defaultValues = useMemo(
    () => ({
      loanNo: currentOtherLoan?.loan?.loanNo || '',
      customerName:
        currentOtherLoan?.loan?.customer.firstName +
          ' ' +
          currentOtherLoan?.loan?.customer.middleName +
          ' ' +
          currentOtherLoan?.loan?.customer.lastName || '',
      address:
        `${currentOtherLoan?.loan.customer.permanentAddress.street || ''} ${currentOtherLoan?.loan.customer.permanentAddress.landmark || ''}, ${currentOtherLoan?.loan.customer.permanentAddress.city || ''}, ${currentOtherLoan?.loan.customer.permanentAddress.state || ''}, ${currentOtherLoan?.loan.customer.permanentAddress.zipcode || ''}, ${currentOtherLoan?.loan.customer.permanentAddress.country || ''}` ||
        '',
      contact: currentOtherLoan?.loan?.customer.contact || '',
      issueDate: currentOtherLoan?.loan?.issueDate
        ? new Date(currentOtherLoan?.loan?.issueDate)
        : new Date(),
      schemeName: currentOtherLoan?.loan?.scheme.name || '',
      closedBy: currentOtherLoan?.loan.closedBy
        ? currentOtherLoan?.loan?.closedBy?.firstName +
          ' ' +
          currentOtherLoan?.loan?.closedBy?.lastName
        : null,
      interest:
        currentOtherLoan?.loan?.scheme.interestRate > 1.5
          ? 1.5
          : currentOtherLoan?.loan?.scheme.interestRate,
      consultingCharge: currentOtherLoan?.loan?.consultingCharge || 0,
      loanAmount: currentOtherLoan?.loan?.loanAmount || '',
      interestLoanAmount: currentOtherLoan?.loan?.interestLoanAmount || '',
      loanPeriod: currentOtherLoan?.loan?.scheme.renewalTime || '',
      IntPeriodTime: currentOtherLoan?.loan?.scheme.interestPeriod || '',
      createdBy: user?.firstName + ' ' + user?.lastName || null,
      renewDate: currentOtherLoan?.loan?.issueDate ? renewDate() : null,
      nextInterestPayDate: currentOtherLoan?.loan?.nextInstallmentDate
        ? new Date(currentOtherLoan?.loan?.nextInstallmentDate)
        : new Date(),
      approvalCharge: currentOtherLoan?.loan?.approvalCharge || 0,
      lastInterestPayDate: currentOtherLoan?.loan?.lastInstallmentDate
        ? new Date(currentOtherLoan?.loan?.lastInstallmentDate)
        : null,
      totalLoanAmount: currentOtherLoan?.loan?.loanAmount || '',
      partLoanAmount:
        currentOtherLoan?.loan?.loanAmount - currentOtherLoan?.loan?.interestLoanAmount || '',
      intLoanAmount: currentOtherLoan?.loan?.interestLoanAmount || 0,
      intRate:
       new Date(currentOtherLoan.loan.issueDate) < cutoffDate ? (currentOtherLoan?.loan?.scheme.interestRate >= 1.5
          ? 1.5
          : currentOtherLoan?.loan?.scheme.interestRate) : (currentOtherLoan?.loan?.scheme.interestRate >= 1
          ? 1
          : currentOtherLoan?.loan?.scheme.interestRate) || '',
      otherName: currentOtherLoan?.otherName || '',
      code: currentOtherLoan?.code || 0,
      otherNumber: currentOtherLoan?.otherNumber || '',
      amount: currentOtherLoan?.amount || '',
      percentage: currentOtherLoan?.percentage || '',
      date: new Date(currentOtherLoan?.date) || '',
      grossWt: currentOtherLoan?.grossWt || '',
      netWt: currentOtherLoan?.netWt || '',
      rate: currentOtherLoan?.rate || '',
      month: currentOtherLoan?.month || '',
      renewalDate: new Date(currentOtherLoan?.renewalDate) || '',
      closeDate: new Date(currentOtherLoan?.closeDate) || '',
      otherCharge: currentOtherLoan?.otherCharge || '',
      remark: currentOtherLoan?.remark || '',
      ornamentDetail: currentOtherLoan?.ornamentDetail || '',
      totalOrnament: currentOtherLoan?.totalOrnament || '',
    }),
    [currentOtherLoan?.loan]
  );

  const methods = useForm({
    resolver: yupResolver(NewLoanPayHistorySchema),
    defaultValues,
  });

  const {
    reset,
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  useEffect(() => {
    if (currentOtherLoan?.loan) {
      reset(defaultValues);
    }
  }, [currentOtherLoan?.loan, reset, defaultValues, mutate]);

  const onSubmit = handleSubmit(async (data) => {});

  return (
    <>
      <Box>
        <FormProvider methods={methods} onSubmit={onSubmit}>
          <Card sx={{ p: 0.5 }}>
            <Grid container spacing={3}>
              <Grid xs={12} md={12}>
                <Card sx={{ p: 2 }}>
                  <Box
                    rowGap={1.5}
                    columnGap={1.5}
                    display="grid"
                    gridTemplateColumns={{
                      xs: 'repeat(1, 1fr)',
                      sm: 'repeat(3, 1fr)',
                      md: 'repeat(6, 1fr)',
                    }}
                  >
                    <RHFTextField
                      name="loanNo"
                      label="Loan No."
                      InputProps={{ readOnly: true }}
                      disabled
                    />
                    <RhfDatePicker name="issueDate" control={control} label="Issue Date" disabled />
                    <RHFTextField
                      name="totalLoanAmount"
                      label="Total Loan Amount"
                      InputProps={{ readOnly: true }}
                      disabled
                    />
                    <RHFTextField
                      name="partLoanAmount"
                      label="Part Loan Amount"
                      InputProps={{ readOnly: true }}
                      disabled
                    />
                    <RHFTextField
                      name="intLoanAmount"
                      label="Int. Loan Amount"
                      InputProps={{ readOnly: true }}
                      disabled
                    />
                    <RHFTextField
                      name="intRate"
                      label="Int. Rate"
                      InputProps={{ readOnly: true }}
                      disabled
                    />
                    <RHFTextField
                      name="consultingCharge"
                      label="Consulting Charge"
                      InputProps={{ readOnly: true }}
                      disabled
                    />
                    <RHFTextField name="approvalCharge" label="Approval Charge" disabled />
                  </Box>
                </Card>
              </Grid>
            </Grid>
          </Card>
          <Card sx={{ p: 0.5, mt: 0.5 }}>
            <Grid container spacing={3}>
              <Grid xs={12} md={12}>
                <Card sx={{ p: 2 }}>
                  <Box
                    rowGap={1.5}
                    columnGap={1.5}
                    display="grid"
                    gridTemplateColumns={{
                      xs: 'repeat(1, 1fr)',
                      sm: 'repeat(3, 1fr)',
                      md: 'repeat(6, 1fr)',
                    }}
                  >
                    <RHFTextField
                      name="code"
                      label="Code"
                      InputProps={{ readOnly: true }}
                      disabled
                    />
                    <RHFTextField
                      name="otherName"
                      label="Other Name"
                      disabled
                      onKeyPress={(e) => {
                        if (
                          !/[0-9.]/.test(e.key) ||
                          (e.key === '.' && e.target.value.includes('.'))
                        ) {
                          e.preventDefault();
                        }
                      }}
                    />
                    <RHFTextField
                      name="otherNumber"
                      label="Other Number"
                      disabled
                      inputProps={{
                        maxLength: 10,
                        inputMode: 'numeric',
                        pattern: '[0-9]*',
                      }}
                      rules={{
                        required: 'Contact number is required',
                        pattern: {
                          value: /^[0-9]{10}$/,
                          message: 'Please enter a valid 10-digit contact number',
                        },
                      }}
                      onKeyPress={(e) => {
                        if (!/[0-9]/.test(e.key)) {
                          e.preventDefault();
                        }
                      }}
                    />
                    <RHFTextField
                      name="amount"
                      label="Amount"
                      disabled
                      onKeyPress={(e) => {
                        if (
                          !/[0-9.]/.test(e.key) ||
                          (e.key === '.' && e.target.value.includes('.'))
                        ) {
                          e.preventDefault();
                        }
                      }}
                    />
                    <RHFTextField
                      name="percentage"
                      label="Percentage"
                      disabled
                      onKeyPress={(e) => {
                        if (
                          !/[0-9.]/.test(e.key) ||
                          (e.key === '.' && e.target.value.includes('.'))
                        ) {
                          e.preventDefault();
                        }
                      }}
                    />
                    <RhfDatePicker name="date" control={control} label="Date" disabled />
                    <RHFTextField
                      name="grossWt"
                      label="Gross Wt"
                      disabled
                      onKeyPress={(e) => {
                        if (
                          !/[0-9.]/.test(e.key) ||
                          (e.key === '.' && e.target.value.includes('.'))
                        ) {
                          e.preventDefault();
                        }
                      }}
                    />
                    <RHFTextField name="netWt" label="Net Wt" disabled />
                    <RHFTextField name="rate" label="Rate" disabled />
                    <RHFTextField name="month" label="Month" disabled />
                    <RhfDatePicker
                      name="renewalDate"
                      control={control}
                      label="Renewal Date"
                      disabled
                    />
                    <RhfDatePicker name="closeDate" control={control} label="Close Date" disabled />
                    <RHFTextField name="otherCharge" label="Other Charge" disabled />
                    <RHFTextField
                      name="ornamentDetail"
                      label="Ornament Detail"
                      InputProps={{ readOnly: true }}
                      disabled
                    />
                    <RHFTextField
                      name="totalOrnament"
                      label="Total Ornament"
                      InputProps={{ readOnly: true }}
                      disabled
                    />
                    <RHFTextField name="remark" label="Remark" disabled />
                    <Box pb={0}>
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: 0,
                          pb: 0,
                        }}
                      >
                        <Box>
                          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                            Property Image
                          </Typography>
                        </Box>
                        <Box>
                          <Image
                            key={file}
                            src={file}
                            alt={file}
                            ratio="1/1"
                            onClick={() => lightbox.onOpen(file)}
                            sx={{
                              cursor: 'zoom-in',
                              height: '36px',
                              width: '36px',
                              borderRadius: '20%',
                            }}
                          />
                        </Box>
                      </Box>
                    </Box>
                  </Box>
                </Card>
              </Grid>
            </Grid>
          </Card>
        </FormProvider>
        <Lightbox image={file} open={lightbox.open} close={lightbox.onClose} />
      </Box>
    </>
  );
}

export default OtherLoanpayhistoryNewEditForm;
