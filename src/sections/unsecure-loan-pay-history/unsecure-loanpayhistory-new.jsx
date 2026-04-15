import PropTypes from 'prop-types';
import PayTabs from './view/pay-tabs';
import UnsecureLoanpayhistoryNewEditForm from './unsecure-loanpayhistory-new-edit-form.jsx';

// ----------------------------------------------------------------------

export default function UnsecureLoanpayhistoryNew({ currentLoan, mutate }) {
  return (
    <>
      <UnsecureLoanpayhistoryNewEditForm currentLoan={currentLoan} mutate={mutate} />
      <PayTabs currentLoan={currentLoan} mutate={mutate} />
    </>
  );
}

UnsecureLoanpayhistoryNew.propTypes = {
  currentLoan: PropTypes.object,
};
