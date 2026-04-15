import PropTypes from 'prop-types';
import { forwardRef, useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import { useGetConfigs } from 'src/api/config';
import { useSelector } from 'react-redux';
// import { useGetCompanyDetails } from '../../api/company_details';
// ----------------------------------------------------------------------


const Logo = forwardRef(({ disabledLink = false, navWidth, sx, ...other }, ref) => {

  const companyDetails = useSelector((state) => state.configs)
  const { configs } = useGetConfigs();
  // const [company, setCompany] = useState({});
  // useEffect(() => {
  //   setCompany(companyDetail);
  // }, [companyDetail]);
  const logo1 =  companyDetails?.configs?.logo_url ?? configs?.company?.logo_url  ;
  const logo = (
    <Box
      ref={ref}
      component='div'
      sx={{
        display: 'inline-flex',
        justifyContent: 'center',
        alignItems: 'center',
        ...sx,
        margin: '30px 0 30px 0',
      }}
      {...other}
    >
      <img
        src={logo1}
        alt={logo1}
        style={{
          borderRadius: '5%',
          width: navWidth ? '75px' : '124px',
          padding: ' 0 10px',
        }}
      />
    </Box>
  );
  if (disabledLink) {
    return logo;
  }
  return <Link sx={{ display: 'contents' }}>{logo}</Link>;
});
Logo.propTypes = {
  disabledLink: PropTypes.bool,
  sx: PropTypes.object,
};
export default Logo;
