import React, { useEffect, useMemo, useState } from 'react';
import {
  alpha,
  Box,
  Card,
  Container,
  Divider,
  Drawer,
  IconButton,
  InputAdornment,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  TextField,
  Tooltip,
  Typography,
  useMediaQuery,
  Collapse,
  Fade,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import Iconify from 'src/components/iconify';
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import { paths } from 'src/routes/paths';
import { useAuthContext } from 'src/auth/hooks';
import { useGetConfigs } from 'src/api/config';
import CompanyProfile from './company-profile-create-view';
import PermissionView from './permission-view';
import Rolescreatepage from './roles-crete-view';
import BusinessTypeCreteView from './business-type-crete-view';
import BranchCreateView from './branch-create-view';
import LoanTypeView from './loan-type-view';
import RemarkCreateView from './remark-create-view';
import PolicyConfigCreateView from './policy-config-create-view';
import MonthCreateView from './month-create-view.jsx';
import OtherNameCreateView from './other-name-create-view.jsx';
import WhatsappConfigs from './whatsapp-configs.jsx';
import ExpenseTypeCreteView from './expense-type-crete-view.jsx';
import ChargeTypeView from './charge-type-view.jsx';
import DeviceAccessView from './device-access-view.jsx';
import AreaCreteView from './area-crete-view.jsx';
import PercentageCreateView from './percentage-create-view.jsx';
import NomineeRelationView from './nominee-relation-view.jsx';
import OfficeHolidayNotice from './office-holiday-notice.jsx';

const getResponsibilityValue = (key, configs, user) => {
  if (!user || !configs) return false;
  const isAdmin = user.role?.toLowerCase() === 'admin';
  if (isAdmin) return true;
  const rolePermissions = configs.permissions?.[user.role];
  const userResponsibilities = rolePermissions?.responsibilities;
  return userResponsibilities?.[key] ?? false;
};

const TABS = [
  { value: 'Company Profile', label: 'Company Profile', icon: 'mdi:company', desc: 'Manage company details and profile info' },
  { value: 'Roles', label: 'Roles', icon: 'oui:app-users-roles', desc: 'Set up user roles for your organization' },
  { value: 'Permission', label: 'Permission', icon: 'mdi:eye-lock', desc: 'Configure access rights & responsibilities' },
  { value: 'Branch', label: 'Branch', icon: 'carbon:branch', desc: 'Create and manage branches' },
  { value: 'Business type', label: 'Business type', icon: 'material-symbols:add-business', desc: 'Define different business categories' },
  { value: 'Loan type', label: 'Loan type', icon: 'mdi:cash-sync', desc: 'Manage loan categories and schemes' },
  { value: 'Percentage', label: 'Percentage', icon: 'mynaui:percentage-octagon', desc: 'Set percentage-based configurations' },
  { value: 'Expense type', label: 'Expense type', icon: 'arcticons:expense-manager-2', desc: 'Define expense categories' },
  { value: 'Charge type', label: 'Charge type', icon: 'qlementine-icons:money-16', desc: 'Configure charge categories' },
  { value: 'Remark type', label: 'Remark type', icon: 'subway:mark-1', desc: 'Customize remark labels' },
  { value: 'Export Policy Config', label: 'Export Policy Config', icon: 'icon-park-outline:agreement', desc: 'Policy settings for export' },
  { value: 'Other Name', label: 'Other Name', icon: 'icon-park-solid:edit-name', desc: 'Define alternate names for entities' },
  { value: 'Month', label: 'Month', icon: 'tabler:calendar-month-filled', desc: 'Manage month-based settings' },
  { value: 'WhatsApp Configs', label: 'WhatsApp Configs', icon: 'ic:baseline-whatsapp', desc: 'WhatsApp API and templates configuration' },
  { value: 'Device Access', label: 'Device Access', icon: 'rivet-icons:device', desc: 'Control which devices can access' },
  { value: 'Area', label: 'Area', icon: 'majesticons:map-marker-area-line', desc: 'Geographic or location settings' },
  { value: 'Nominee Relation', label: 'Nominee Relation', icon: 'mdi:account-child', desc: 'Manage relation options for nominees' },
  { value: 'Office Holiday Notice', label: 'Office Holiday Notice', icon: 'mdi:account-child', desc: 'Manage relation options for nominees' },
];

export default function SettingsPage() {
  const { user } = useAuthContext();
  const { configs } = useGetConfigs();
  const settings = useSettingsContext();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [currentTab, setCurrentTab] = useState(localStorage.getItem('settingsTab') || 'Company Profile');
  const [pinnedTabs, setPinnedTabs] = useState(JSON.parse(localStorage.getItem('pinnedTabs') || '[]'));
  const [searchQuery, setSearchQuery] = useState('');
  const [openDrawer, setOpenDrawer] = useState(false);
  const [pinnedOpen, setPinnedOpen] = useState(true);

  const visibleTabs = useMemo(
    () => TABS.filter((tab) => getResponsibilityValue(tab.value, configs, user)),
    [configs, user]
  );

  const filteredTabs = useMemo(() => {
    if (!searchQuery) return visibleTabs;
    return visibleTabs.filter((tab) => tab.label.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [searchQuery, visibleTabs]);

  useEffect(() => {
    localStorage.setItem('settingsTab', currentTab);
  }, [currentTab]);
  useEffect(() => {
    localStorage.setItem('pinnedTabs', JSON.stringify(pinnedTabs));
  }, [pinnedTabs]);

  useEffect(() => {
    if (!visibleTabs.find((tab) => tab.value === currentTab) && visibleTabs.length > 0) {
      setCurrentTab(visibleTabs[0].value);
    }
  }, [currentTab, visibleTabs]);

  const handlePin = (tabValue) => {
    setPinnedTabs((prev) =>
      prev.includes(tabValue) ? prev.filter((v) => v !== tabValue) : [...prev, tabValue]
    );
  };

  const renderContent = () => {
    const tabMeta = TABS.find((t) => t.value === currentTab);

    const contentMap = {
      'Company Profile': <CompanyProfile />,
      Roles: <Rolescreatepage setTab={setCurrentTab} />,
      Permission: <PermissionView />,
      'Business type': <BusinessTypeCreteView />,
      'Loan type': <LoanTypeView />,
      Percentage: <PercentageCreateView />,
      'Expense type': <ExpenseTypeCreteView />,
      'Charge type': <ChargeTypeView />,
      Branch: <BranchCreateView />,
      'Remark type': <RemarkCreateView />,
      'Export Policy Config': <PolicyConfigCreateView />,
      'Other Name': <OtherNameCreateView />,
      Month: <MonthCreateView />,
      'WhatsApp Configs': <WhatsappConfigs />,
      'Device Access': <DeviceAccessView />,
      Area: <AreaCreteView />,
      'Nominee Relation': <NomineeRelationView />,
      'Office Holiday Notice': <OfficeHolidayNotice />,
    };

    return (
      <Fade in key={currentTab}>
        <Box>
          {tabMeta && (
            <Typography variant="subtitle2" sx={{ mb: 2, color: 'text.secondary' }}>
              {tabMeta.desc}
            </Typography>
          )}
          {contentMap[currentTab]}
        </Box>
      </Fade>
    );
  };

  const renderSidebar = (
    <Card sx={{ width: 280, flexShrink: 0, p: 2, height: '100%', borderRadius: 2 }}>
      <TextField
        fullWidth
        placeholder="Search settings..."
        size="small"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Iconify icon="mdi:magnify" width={20} />
            </InputAdornment>
          ),
          endAdornment: searchQuery && (
            <InputAdornment position="end">
              <IconButton size="small" onClick={() => setSearchQuery('')}>
                <Iconify icon="mdi:close-circle" width={18} />
              </IconButton>
            </InputAdornment>
          ),
        }}
        sx={{ mb: 2 }}
      />
      {pinnedTabs.length > 0 && (
        <>
          <ListItemButton onClick={() => setPinnedOpen(!pinnedOpen)} sx={{ borderRadius: 1 }}>
            <ListItemIcon>
              <Iconify icon="mdi:pin" width={20} />
            </ListItemIcon>
            <ListItemText primary="Pinned" />
            <Iconify
              icon={pinnedOpen ? 'mdi:chevron-down' : 'mdi:chevron-right'}
              width={20}
              style={{ opacity: 0.6 }}
            />
          </ListItemButton>
          <Collapse in={pinnedOpen}>
            <List dense>
              {pinnedTabs.map((tabValue) => {
                const tab = TABS.find((t) => t.value === tabValue);
                if (!tab) return null;
                return (
                  <ListItem key={tab.value} disablePadding>
                    <ListItemButton
                      selected={currentTab === tab.value}
                      onClick={() => {
                        setCurrentTab(tab.value);
                        if (isMobile) setOpenDrawer(false);
                      }}
                      sx={{
                        borderRadius: 1,
                        '&.Mui-selected': {
                          backgroundColor: alpha(theme.palette.primary.main, 0.12),
                        },
                      }}
                    >
                      <ListItemIcon>
                        <Iconify icon={tab.icon} width={22} />
                      </ListItemIcon>
                      <ListItemText primary={tab.label} />
                      <Tooltip title="Unpin">
                        <IconButton size="small" onClick={() => handlePin(tab.value)}>
                          <Iconify icon="mdi:pin" width={18} />
                        </IconButton>
                      </Tooltip>
                    </ListItemButton>
                  </ListItem>
                );
              })}
            </List>
          </Collapse>
          <Divider sx={{ my: 2 }} />
        </>
      )}
      <Typography variant="overline" sx={{ px: 1, color: 'text.secondary' }}>
        All Settings
      </Typography>
      <List dense>
        {filteredTabs.length === 0 && (
          <Typography variant="body2" sx={{ px: 2, py: 1.5, color: 'text.secondary' }}>
            No results found
          </Typography>
        )}
        {filteredTabs.map((tab) => (
          <ListItem key={tab.value} disablePadding>
            <ListItemButton
              selected={currentTab === tab.value}
              onClick={() => {
                setCurrentTab(tab.value);
                if (isMobile) setOpenDrawer(false);
              }}
              sx={{
                borderRadius: 1,
                '&.Mui-selected': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.12),
                },
              }}
            >
              <ListItemIcon>
                <Iconify icon={tab.icon} width={22} />
              </ListItemIcon>
              <ListItemText
                primary={
                  <span>
                    {tab.label.split(new RegExp(`(${searchQuery})`, 'gi')).map((part, i) =>
                      part.toLowerCase() === searchQuery.toLowerCase() ? (
                        <span
                          key={i}
                          style={{ fontWeight: 600, color: theme.palette.primary.main }}
                        >
                          {part}
                        </span>
                      ) : (
                        part
                      )
                    )}
                  </span>
                }
              />
              <Tooltip title={pinnedTabs.includes(tab.value) ? 'Unpin' : 'Pin'}>
                <IconButton size="small" onClick={() => handlePin(tab.value)}>
                  <Iconify
                    icon={pinnedTabs.includes(tab.value) ? 'mdi:pin' : 'mdi:pin-outline'}
                    width={18}
                  />
                </IconButton>
              </Tooltip>
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Card>
  );

  return (
    <Container maxWidth={settings.themeStretch ? false : 'xl'}>
      <CustomBreadcrumbs
        heading="Settings"
        links={[{ name: 'Dashboard', href: paths.dashboard.root }, { name: 'Settings' }]}
        action={
          isMobile && (
            <IconButton onClick={() => setOpenDrawer(true)}>
              <Iconify icon="mdi:menu" width={24} />
            </IconButton>
          )
        }
        sx={{ mb: { xs: 2, md: 4 } }}
      />
      <Box display="flex" gap={3}>
        {isMobile ? (
          <Drawer
            open={openDrawer}
            onClose={() => setOpenDrawer(false)}
            PaperProps={{ sx: { width: 280, p: 1.5 } }}
          >
            {renderSidebar}
          </Drawer>
        ) : (
          renderSidebar
        )}
        <Box flex={1}>
          <Card sx={{ p: 3, minHeight: 500, borderRadius: 2 }}>{renderContent()}</Card>
        </Box>
      </Box>
    </Container>
  );
}
