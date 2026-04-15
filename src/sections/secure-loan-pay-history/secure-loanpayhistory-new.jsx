import PropTypes from 'prop-types';
import PayTabs from './view/pay-tabs';
import LoanpayhistoryNewEditForm from './secure-loanpayhistory-new-edit-form.jsx';

// ----------------------------------------------------------------------

export default function SecureLoanpayhistoryNew({ currentLoan, mutate }) {
  return (
    <>
      <LoanpayhistoryNewEditForm currentLoan={currentLoan} mutate={mutate} />
      <PayTabs currentLoan={currentLoan} mutate={mutate} />
    </>
  );
}

SecureLoanpayhistoryNew.propTypes = {
  currentLoan: PropTypes.object,
};
