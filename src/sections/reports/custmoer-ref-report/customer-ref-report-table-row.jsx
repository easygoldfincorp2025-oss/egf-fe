import PropTypes from 'prop-types';
import { TableCell, TableRow } from '@mui/material';
import { fDate } from '../../../utils/format-time';

// ----------------------------------------------------------------------

const INQUIRY_REFERENCE_BY = [
  { value: 'Google', label: 'Google' },
  { value: 'Just Dial', label: 'Just Dial' },
  { value: 'Social Media', label: 'Social Media' },
  { value: 'Board Banner', label: 'Board Banner' },
  { value: 'Brochure', label: 'Brochure' },
  { value: 'Other', label: 'Other' },
];

export default function CustomerRefReportTableRow({ row }) {
  const matchedReference = INQUIRY_REFERENCE_BY.find(
    (item) => item.value === row.referenceBy,
  );

  const getReferenceLabel = () => matchedReference?.label || 'Other';
  const getOtherReferenceLabel = () =>
    row.referenceBy === 'Other' ? row.referenceBy || '-' : matchedReference ? '-' : row.referenceBy;

  return (
    <TableRow hover>
      <TableCell>{row.srNo}</TableCell>
      <TableCell sx={{ whiteSpace: 'nowrap' }}>
        {`${row.firstName} ${row.middleName} ${row.lastName}`}
      </TableCell>
      <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.contact}</TableCell>
      <TableCell sx={{ whiteSpace: 'nowrap' }}>{fDate(row.joiningDate) || '-'}</TableCell>
      <TableCell sx={{ whiteSpace: 'nowrap' }}>{getReferenceLabel()}</TableCell>
      <TableCell sx={{ whiteSpace: 'nowrap' }}>{getOtherReferenceLabel()}</TableCell>
      <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.permanentAddress?.area || '-'}</TableCell>
    </TableRow>
  );
}

CustomerRefReportTableRow.propTypes = {
  row: PropTypes.object.isRequired,
};
