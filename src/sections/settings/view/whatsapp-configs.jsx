import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CircularProgress,
  Grid,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useGetConfigs } from 'src/api/config';
import axios from 'axios';
import { useAuthContext } from 'src/auth/hooks';
import { useSnackbar } from 'src/components/snackbar';
import Iconify from 'src/components/iconify';

export default function WhatsappConfigs() {
  const { user } = useAuthContext();
  const { configs, mutate } = useGetConfigs();
  const [whatsappConfig, setWhatsappConfig] = useState({ contact1: '', contact2: '' });
  const [loading, setLoading] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    if (configs?.whatsappConfig) {
      setWhatsappConfig(configs.whatsappConfig);
    }
  }, [configs]);

  const handleUpdate = async () => {
    if (!whatsappConfig.contact1 && !whatsappConfig.contact2) {
      enqueueSnackbar('Please enter at least one WhatsApp number.', { variant: 'warning' });
      return;
    }

    setLoading(true);
    const URL = `${import.meta.env.VITE_BASE_URL}/${user?.company}/config/${configs?._id}`;

    try {
      await axios.put(URL, { ...configs, whatsappConfig });
      enqueueSnackbar('WhatsApp numbers updated successfully', { variant: 'success' });
      mutate();
    } catch (error) {
      enqueueSnackbar('Failed to update WhatsApp numbers', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (number) => {
    navigator.clipboard.writeText(number);
    enqueueSnackbar(`Copied ${number} to clipboard`, { variant: 'info' });
  };

  return (
    <Box sx={{ width: '100%', p: 3 }}>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 3 }}>
        WhatsApp Configurations
      </Typography>
      <Grid container spacing={3}>
        {['contact1', 'contact2'].map((contact, index) => (
          <Grid item xs={12} md={6} key={index}>
            <Card sx={{ p: 3, borderRadius: 2, boxShadow: 3 }}>
              <Stack spacing={1}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  WhatsApp Contact {index + 1}
                </Typography>
                <TextField
                  value={whatsappConfig[contact]}
                  onChange={(e) =>
                    setWhatsappConfig({ ...whatsappConfig, [contact]: e.target.value })
                  }
                  size="small"
                  fullWidth
                  placeholder={`Enter WhatsApp Contact ${index + 1}`}
                  InputProps={{
                    endAdornment: whatsappConfig[contact] && (
                      <InputAdornment position="end">
                        <IconButton onClick={() => handleCopy(whatsappConfig[contact])} edge="end">
                          <Iconify icon="eva:copy-fill" width={20} height={20} />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Stack>
            </Card>
          </Grid>
        ))}
        <Grid item xs={12}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleUpdate}
            disabled={loading}
            startIcon={loading && <CircularProgress size={20} />}
            sx={{ fontWeight: 600, px: 4, py: 1.5 }}
          >
            {loading ? 'Updating...' : 'Update WhatsApp Numbers'}
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
}
