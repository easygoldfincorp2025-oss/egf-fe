import PropTypes from 'prop-types';
import PayTabs from './view/pay-tabs';
import LoanpayhistoryNewEditForm from './loanpayhistory-new-edit-form';

// ----------------------------------------------------------------------

export default function LoanpayhistoryNew({ currentLoan, mutate }) {
  return (
    <>
      <LoanpayhistoryNewEditForm currentLoan={currentLoan} mutate={mutate} />
      <PayTabs currentLoan={currentLoan} mutate={mutate} />
    </>
  );
}

LoanpayhistoryNew.propTypes = {
  currentLoan: PropTypes.object,
};
