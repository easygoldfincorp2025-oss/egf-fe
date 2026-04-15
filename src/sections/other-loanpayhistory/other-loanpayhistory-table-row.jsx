import PropTypes from 'prop-types';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import { useBoolean } from 'src/hooks/use-boolean';
import Iconify from 'src/components/iconify';
import { ConfirmDialog } from 'src/components/custom-dialog';
import CustomPopover, { usePopover } from 'src/components/custom-popover';
import { paths } from '../../routes/paths';
import { Link } from 'react-router-dom';
import Label from '../../components/label';
import { useAuthContext } from '../../auth/hooks';
import { useGetConfigs } from '../../api/config';
import { getResponsibilityValue } from '../../permission/permission';
import { Box, Dialog, DialogActions, IconButton } from '@mui/material';
import { PDFViewer } from '@react-pdf/renderer';
import Notice from '../loanpayhistory/PDF/notice.jsx';
import Noc from './PDF/noc';
import React, { useState } from 'react';
import LetterOfAuthority from '../loanpayhistory/PDF/letter-of-authority.jsx';
import Sansaction11 from '../loanpayhistory/PDF/sansaction-11.jsx';
import LoanIssueDetails from '../loanpayhistory/PDF/loan-issue-details.jsx';
import { fDate } from '../../utils/format-time';

// ----------------------------------------------------------------------

export default function OtherLoanpayhistoryTableRow({
  row,
  selected,
  onDeleteRow,
  loanStatus,
  index,
}) {
  const {
    loan,
    otherName,
    otherNumber,
    rate,
    amount,
    srNo,
    percentage,
    date,
    grossWt,
    netWt,
    month,
    closingCharge,
    renewalDate,
    _id,
    status,
  } = row;
  const { loanNo, customer } = loan;
  const confirm = useBoolean();
  const popover = usePopover();
  const { user } = useAuthContext();
  const { configs } = useGetConfigs();
  const view = useBoolean();
  const [dialogContent, setDialogContent] = useState(null);

  const handleDialogOpen = (content) => {
    setDialogContent(content);
    view.onTrue();
  };

  const statusColors = {
    Closed: (theme) => (theme.palette.mode === 'light' ? '#FFF1D6' : '#6f4f07'),
    Overdue: (theme) => (theme.palette.mode === 'light' ? '#FFE4DE' : '#611706'),
    Regular: (theme) => (theme.palette.mode === 'light' ? '#e4ffde' : '#0e4403'),
  };

  const renderDialogContent = () => {
    if (dialogContent === 'loanDetails') {
      return <LoanIssueDetails selectedRow={row} configs={configs} />;
    }
    if (dialogContent === 'sanction') {
      return <Sansaction11 sansaction={row} configs={configs} />;
    }
    if (dialogContent === 'authority') {
      return <LetterOfAuthority loan={row} />;
    }
    if (dialogContent === 'notice') {
      return <Notice noticeData={row} configs={configs} />;
    }
    if (dialogContent === 'noc') {
      return <Noc nocData={row} configs={configs} />;
    }
    return null;
  };

  return (
    <>
      <TableRow
        hover
        selected={selected}
        sx={{ backgroundColor: statusColors[status] || '', ' td': { padding: '6px' } }}
      >
        <TableCell>{srNo}</TableCell>
        <TableCell>{row.code || 0}</TableCell>
        {getResponsibilityValue('update_other_loan_pay_history', configs, user) ? (
          <TableCell>
            {
              <Link
                to={paths.dashboard.other_loanPayHistory.edit(_id)}
                style={{
                  textDecoration: 'none',
                  fontWeight: 'bold',
                  color: 'inherit',
                }}
              >
                {loanNo}
              </Link>
            }
          </TableCell>
        ) : (
          <TableCell>{loanNo}</TableCell>
        )}
        <TableCell>
          {customer?.firstName + ' ' + customer?.middleName + ' ' + customer?.lastName}
        </TableCell>
        <TableCell>{otherName}</TableCell>
        <TableCell>{otherNumber}</TableCell>
        <TableCell>{amount}</TableCell>
        <TableCell>{percentage}</TableCell>
        <TableCell>{fDate(date)}</TableCell>
        <TableCell>{rate}</TableCell>
        <TableCell>{grossWt}</TableCell>
        <TableCell>{netWt}</TableCell>
        <TableCell>{month}</TableCell>
        <TableCell>{row.cashAmount || 0}</TableCell>
        <TableCell>{row.bankAmount || 0}</TableCell>
        <TableCell>{closingCharge || 0}</TableCell>
        <TableCell>{fDate(renewalDate)}</TableCell>
        <TableCell>
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
        <TableCell sx={{ whiteSpace: 'nowrap', cursor: 'pointer' }}>
          {getResponsibilityValue('delete_other_loan', configs, user) ? (
            <IconButton
              color="error"
              onClick={() => {
                confirm.onTrue();
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
        sx={{ width: 140 }}
      >
        <MenuItem
          onClick={() => {
            handleDialogOpen('loanDetails');
            popover.onClose();
          }}
        >
          <Iconify icon="clarity:details-line" />
          Loan Details
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleDialogOpen('sanction');
            popover.onClose();
          }}
        >
          <Iconify icon="mdi:file-document-outline" />
          Sanction{' '}
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleDialogOpen('authority');
            popover.onClose();
          }}
        >
          <Iconify icon="material-symbols:verified-user-outline" />
          Authority{' '}
        </MenuItem>
        {row.status === 'Closed' ? (
          <MenuItem
            onClick={() => {
              handleDialogOpen('noc');
              popover.onClose();
            }}
          >
            <Iconify icon="mdi:certificate-outline" />
            NOC
          </MenuItem>
        ) : (
          <MenuItem
            onClick={() => {
              handleDialogOpen('notice');
              popover.onClose();
            }}
          >
            <Iconify icon="gridicons:notice" />
            Notice
          </MenuItem>
        )}
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

OtherLoanpayhistoryTableRow.propTypes = {
  onDeleteRow: PropTypes.func,
  onEditRow: PropTypes.func,
  onSelectRow: PropTypes.func,
  row: PropTypes.object,
  selected: PropTypes.bool,
};
