import PropTypes from 'prop-types';
import PayTabs from './view/pay-tabs';
import OtherLoanpayhistoryNewEditForm from './other-loanpayhistory-new-edit-form';

// ----------------------------------------------------------------------

export default function OtherLoanpayhistoryNew({ currentOtherLoan, mutate }) {
  return (
    <>
      <OtherLoanpayhistoryNewEditForm currentOtherLoan={currentOtherLoan} mutate={mutate} />
      <PayTabs currentOtherLoan={currentOtherLoan} mutate={mutate} />
    </>
  );
}

OtherLoanpayhistoryNew.propTypes = {
  currentLoan: PropTypes.object,
};
