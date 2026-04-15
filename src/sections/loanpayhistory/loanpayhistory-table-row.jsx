import PropTypes from 'prop-types';
import { Box, Button, Dialog, DialogActions, IconButton, MenuItem, TableCell, TableRow } from '@mui/material';
import { pdf, PDFViewer } from '@react-pdf/renderer';
import { Link } from 'react-router-dom';
import axios from 'axios';
import React, { useState } from 'react';
import { useBoolean } from 'src/hooks/use-boolean';
import Iconify from 'src/components/iconify';
import Label from 'src/components/label';
import { ConfirmDialog } from 'src/components/custom-dialog';
import CustomPopover, { usePopover } from 'src/components/custom-popover';
import { useAuthContext } from '../../auth/hooks';
import { useGetConfigs } from '../../api/config';
import { getResponsibilityValue } from '../../permission/permission';
import { fDate } from '../../utils/format-time';
import Notice from './PDF/notice.jsx';
import Noc from './PDF/noc';
import LetterOfAuthority from './PDF/letter-of-authority.jsx';
import Sansaction11 from './PDF/sansaction-11.jsx';
import LoanIssueDetails from './PDF/loan-issue-details.jsx';
import UnsecureLoanIssueDetails from '../unsecure-loan-pay-history/PDF/loan-issue-details.jsx';
import Sansaction8 from './PDF/sansaction-8.jsx';
import { paths } from '../../routes/paths';
import InterestNotice from './PDF/interest-notice.jsx';

// ----------------------------------------------------------------------

export default function LoanpayhistoryTableRow({ row, selected, onDeleteRow, loanStatus }) {
  const {
    loanNo,
    customer,
    scheme,
    loanAmount,
    cashAmount,
    bankAmount,
    _id,
    status,
    srNo,
    issueDate,
    interestLoanAmount,
    consultingCharge,
    nextInstallmentDate,
    company,
  } = row;
  const confirm = useBoolean();
  const popover = usePopover();
  const view = useBoolean();
  const { user, initialize } = useAuthContext();
  const { configs } = useGetConfigs();
  const [dialogContent, setDialogContent] = useState('');
  const [file, setFile] = useState(null);

  const [pdfAccessData, setPdfAccessData] = useState({
    loanDetails: Array.isArray(user?.attemptToDownload?.loanDetails)
      ? [...user?.attemptToDownload?.loanDetails]
      : [],
    unsecureLoanDetails: Array.isArray(user?.attemptToDownload?.unsecureLoanDetails)
      ? [...user?.attemptToDownload?.unsecureLoanDetails]
      : [],
    'sanction-8': Array.isArray(user?.attemptToDownload?.sanction8)
      ? [...user?.attemptToDownload?.sanction8]
      : [],
    'sanction-11': Array.isArray(user?.attemptToDownload?.sanction11)
      ? [...user?.attemptToDownload?.sanction11]
      : [],
    authority: Array.isArray(user?.attemptToDownload?.authority)
      ? [...user?.attemptToDownload?.authority]
      : [],
    notice: Array.isArray(user?.attemptToDownload?.notice)
      ? [...user?.attemptToDownload?.notice]
      : [],
    'interest-notice': Array.isArray(user?.attemptToDownload?.interestNotice)
      ? [...user?.attemptToDownload?.interestNotice]
      : [],
    noc: Array.isArray(user?.attemptToDownload?.noc) ? [...user?.attemptToDownload?.noc] : [],
  });

  const handleInvoicePermission = (content, loanId) => {
    try {
      setPdfAccessData((prevState) => {
        const updatedData = { ...prevState };

        if (!updatedData[content].includes(loanId)) {
          updatedData[content] = [...updatedData[content], loanId];
        }

        return updatedData;
      });

      const payload = {
        ...pdfAccessData,
        [content]: pdfAccessData[content].includes(loanId)
          ? pdfAccessData[content]
          : [...pdfAccessData[content], loanId],
      };

      const URL = `${import.meta.env.VITE_BASE_URL}/${user?.company}/user/${user._id}`;
      axios.put(URL, { ...user, attemptToDownload: payload }).then((res) => initialize());
    } catch (error) {
      console.error(error);
    }
  };

  const isButtonDisabled = (content, loanId) => {
    return (
      user?.role === 'Employee' &&
      Array.isArray(pdfAccessData[content]) &&
      pdfAccessData[content]?.includes(loanId)
    );
  };

  const statusColors = {
    Closed: (theme) => (theme.palette.mode === 'light' ? '#FFF1D6' : '#6f4f07'),
    Overdue: (theme) => (theme.palette.mode === 'light' ? '#FFE4DE' : '#611706'),
    Regular: (theme) => (theme.palette.mode === 'light' ? '#e4ffde' : '#0e4403'),
  };

  const sendPdfToWhatsApp = async (content) => {
    try {
      let pdfContent;
      let type;
      let payload;
      let fileBlob;

      switch (content) {
        case 'loanDetails':
          pdfContent = <LoanIssueDetails selectedRow={row} configs={configs} />;
          type = 'loan_detail';
          payload = {
            firstName: customer.firstName,
            lastName: customer.lastName,
            middleName: customer.middleName,
            contact: customer.contact,
            loanNo,
            loanAmount,
            interestRate: scheme.interestRate,
            consultingCharge,
            issueDate,
            nextInstallmentDate,
            companyName: company.name,
            companyEmail: company.email,
            companyContact: company.contact,
            company: user.company,

            type,
          };
          break;
        case 'unsecureLoanDetails':
          pdfContent = <UnsecureLoanIssueDetails selectedRow={row} configs={configs} />;
          type = 'loan_detail';
          payload = {
            firstName: customer.firstName,
            lastName: customer.lastName,
            middleName: customer.middleName,
            contact: customer.contact,
            loanNo,
            loanAmount,
            interestRate: scheme.interestRate,
            consultingCharge,
            issueDate,
            nextInstallmentDate,
            companyName: company.name,
            companyEmail: company.email,
            companyContact: company.contact,
            company: user.company,
            type,
          };
          break;
        case 'sanction-8':
          pdfContent = <Sansaction8 sansaction={row} configs={configs} />;
          break;
        case 'sanction-11':
          pdfContent = <Sansaction11 sansaction={row} configs={configs} />;
          break;
        case 'authority':
          pdfContent = <LetterOfAuthority loan={row} />;
          break;
        case 'notice':
          pdfContent = <Notice noticeData={row} configs={configs} />;
          break;
        case 'noc':
          pdfContent = <Noc nocData={row} configs={configs} />;
          break;
        default:
          console.error('Unknown PDF content type:', content);
          return;
      }

      const blob = await pdf(pdfContent).toBlob();
      fileBlob = new File([blob], `${content}.pdf`, { type: 'application/pdf' });
      setFile(fileBlob);

      payload = { ...payload, file: fileBlob };

      const formData = new FormData();
      Object.entries(payload).forEach(([key, value]) => {
        formData.append(key, value);
      });

      const response = await axios.post(
        `${import.meta.env.VITE_HOST_API}/api/whatsapp-notification`,
        formData
      );

      console.log('WhatsApp notification response:', response.data);
    } catch (error) {
      console.error('Error generating or sending PDF:', error);
    }
  };

  const handleDialogOpen = async (content) => {
    setDialogContent(content);
    if (
      [
        'loanDetails',
        'unsecureLoanDetails',
        'sanction-8',
        'sanction-11',
        'authority',
        'notice',
        'interest-notice',
        'noc',
      ].includes(content)
    )
      view.onTrue();
  };

  const renderDialogContent = () => {
    const contentMap = {
      loanDetails: <LoanIssueDetails selectedRow={row} configs={configs} />,
      unsecureLoanDetails: <UnsecureLoanIssueDetails selectedRow={row} configs={configs} />,
      'sanction-8': <Sansaction8 sansaction={row} configs={configs} />,
      'sanction-11': <Sansaction11 sansaction={row} configs={configs} />,
      authority: <LetterOfAuthority loan={row} />,
      notice: <Notice noticeData={row} configs={configs} />,
      'interest-notice': <InterestNotice interestNoticeData={row} configs={configs} />,
      noc: <Noc nocData={row} configs={configs} />,
    };
    return contentMap[dialogContent] || null;
  };

  return (
    <>
      <TableRow hover selected={selected} sx={{ backgroundColor: statusColors[status] || '' }}>
        <TableCell>{srNo}</TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>
          {getResponsibilityValue('update_loan_pay_history', configs, user) ? (
            <Link
              to={paths.dashboard.loanPayHistory.edit(_id)}
              style={{ textDecoration: 'none', fontWeight: 'bold', color: 'inherit' }}
            >
              {loanNo}
            </Link>
          ) : (
            loanNo
          )}
        </TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{fDate(issueDate)}</TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>
          {`${customer.firstName} ${customer.middleName} ${customer.lastName}`}
        </TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{customer.contact}</TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{loanAmount}</TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{interestLoanAmount}</TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{loanAmount - interestLoanAmount}</TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{scheme.interestRate}</TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{cashAmount}</TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{bankAmount}</TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{row?.approvalCharge || 0}</TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{row?.closingCharge || 0}</TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>
          <Label
            variant="soft"
            color={
              (status === 'Disbursed' && 'info') ||
              (status === 'Closed' && 'warning') ||
              (status === 'Overdue' && 'error') ||
              (status === 'Regular' && 'success') ||
              'default'
            }
          >
            {status}
          </Label>
        </TableCell>
        <TableCell
          sx={{ whiteSpace: 'nowrap', cursor: 'pointer' }}>
          {getResponsibilityValue('print_loan_pay_history_detail', configs, user) ? (
          <IconButton color={popover.open ? 'inherit' : 'default'} onClick={popover.onOpen}>
            <Iconify icon='eva:more-vertical-fill' />
          </IconButton>) : ''}
        </TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap', cursor: 'pointer' }}>
          {getResponsibilityValue('delete_loan', configs, user) ? (
            <IconButton
              color="error"
              onClick={() => {
                confirm.onTrue();
                setDeleteId(row?._id);
              }}
            >
              <Iconify icon="eva:trash-2-outline" />
            </IconButton>
          ) : (
            '-'
          )}
        </TableCell>
      </TableRow>
      <CustomPopover
        open={popover.open}
        onClose={popover.onClose}
        arrow="right-top"
        sx={{ minWidth: 160 }}
      >
        {[
          { key: 'loanDetails', label: 'Loan Details', icon: 'clarity:details-line' },
          { key: 'unsecureLoanDetails', label: 'Unsecure Loan Details', icon: 'clarity:details-line' },
          { key: 'sanction-8', label: 'Sanction-8', icon: 'mdi:file-document-outline' },
          { key: 'sanction-11', label: 'Sanction-11', icon: 'mdi:file-document-outline' },
          { key: 'authority', label: 'Authority', icon: 'material-symbols:verified-user-outline' },
          ...(row.status === 'Closed'
            ? [{ key: 'noc', label: 'NOC', icon: 'mdi:certificate-outline' }]
            : [
                { key: 'notice', label: 'Final Notice', icon: 'gridicons:notice' },
                {
                  key: 'interest-notice',
                  label: 'Interest Notice',
                  icon: 'uis:exclamation-octagon',
                },
              ]),
        ].map((item) => {
          const isDisabled = isButtonDisabled(item?.key, row?._id);

          return (
            <MenuItem
              key={item?.key}
              disabled={isDisabled}
              onClick={() => {
                if (!isDisabled) {
                  handleInvoicePermission(item?.key, row?._id);
                  handleDialogOpen(item.key);
                  popover.onClose();
                }
              }}
            >
              <Iconify icon={item?.icon} />
              {item?.label}
            </MenuItem>
          );
        })}
      </CustomPopover>
      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title="Delete"
        content="Are you sure want to delete?"
        action={
          <Button variant="contained" color="error" onClick={onDeleteRow}>
            Delete
          </Button>
        }
      />
      <Dialog fullScreen open={view.value} onClose={view.onFalse}>
        <Box sx={{ height: 1, display: 'flex', flexDirection: 'column' }}>
          <DialogActions sx={{ p: 1.5 }}>
            <Button color="inherit" variant="contained" onClick={view.onFalse}>
              Close
            </Button>
            {dialogContent === 'loanDetails' && (
              <Button
                color="inherit"
                variant="contained"
                onClick={() => sendPdfToWhatsApp('loanDetails')}
              >
                Share
              </Button>
            )}
          </DialogActions>
          <Box sx={{ flexGrow: 1, height: 1, overflow: 'hidden' }}>
            <PDFViewer width="100%" height="100%" style={{ border: 'none' }}>
              {renderDialogContent()}
            </PDFViewer>
          </Box>
        </Box>
      </Dialog>
    </>
  );
}

LoanpayhistoryTableRow.propTypes = {
  onDeleteRow: PropTypes.func,
  row: PropTypes.object,
  selected: PropTypes.bool,
  loanStatus: PropTypes.string,
};
