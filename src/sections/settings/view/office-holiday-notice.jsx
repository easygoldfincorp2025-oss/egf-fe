import React, { useState } from "react";
import {
  Box,
  Button,
  Card,
  Grid,
  Stack,
  TextField,
  Typography,
  Paper,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Divider,
  CircularProgress,
  Fade,
} from "@mui/material";
import { Icon } from "@iconify/react";
import axios from "axios";
import { useAuthContext } from "src/auth/hooks";
import { useSnackbar } from "src/components/snackbar";
import { fDate } from '../../../utils/format-time.js';

export default function OfficeHolidayNotice() {
  const { user } = useAuthContext();
  const { enqueueSnackbar } = useSnackbar();

  const [loading, setLoading] = useState(false);
  const [values, setValues] = useState({
    occasion: "",
    startDate: "",
    endDate: "",
    reopenDate: "",
    message: "",
    isLoan: "all",
  });

  const handleChange = (field, val) => setValues({ ...values, [field]: val });

  const validateDates = () => {
    if (values.startDate && values.endDate && values.endDate < values.startDate)
      return "End date cannot be before start date.";
    if (values.endDate && values.reopenDate && values.reopenDate < values.endDate)
      return "Reopen date cannot be before end date.";
    return null;
  };

  const handleSubmit = async () => {
    const { occasion, startDate, endDate, reopenDate, message, isLoan } = values;

    const dateError = validateDates();
    if (dateError) {
      enqueueSnackbar(dateError, { variant: "warning" });
      return;
    }

    if (!occasion || !startDate || !endDate || !reopenDate || !message) {
      enqueueSnackbar("⚠️ Please fill in all required fields.", { variant: "warning" });
      return;
    }

    const formData = new FormData();
    formData.append("occasion", occasion);
    formData.append("startDate", new Date(startDate).toISOString());
    formData.append("endDate", new Date(endDate).toISOString());
    formData.append("reopenDate", new Date(reopenDate).toISOString());
    formData.append("message", message);
    formData.append("company", user?.company);
    formData.append("type", "holiday_notice");
    formData.append("isLoan", isLoan);

    try {
      setLoading(true);
      await axios.post(`${import.meta.env.VITE_HOST_API}/api/whatsapp-notification`, formData);
      enqueueSnackbar("✅ WhatsApp notification sent successfully!", { variant: "success" });
      setValues({
        occasion: "",
        startDate: "",
        endDate: "",
        reopenDate: "",
        message: "",
        isLoan: "all",
      });
    } catch (error) {
      enqueueSnackbar("Failed to send notification", { variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  const previewMessage = `
- ${values?.occasion || "⟪Your Occasion⟫"}
તા. *${fDate(values?.startDate) || "⟪Start Date⟫"}* થી તા. *${fDate(values?.endDate) || "⟪End Date⟫"}* સુધી ${values?.occasion || "⟪Occasion⟫"} હોવાથી ઓફીસ બંધ રહેશે.
તા. *${fDate(values?.reopenDate) || "⟪Reopen Date⟫"}* થી રાબેતા મુજબ ઓફીસ શરૂ થશે.
જેની તમામ માનનીય કસ્ટમરોએ નોંધ લેવી.
${values.message || "⟪Custom Message⟫"}
🙏 Thank You.
`;

  return (
    <Box
      sx={{
        p: { xs: 2, md: 5 },
        bgcolor: "#f9fafc",
        minHeight: "100vh",
      }}
    >
      <Typography
        variant="h4"
        fontWeight={700}
        sx={{
          mb: 4,
          display: "flex",
          alignItems: "center",
          gap: 1,
          color: "#333",
        }}
      >
        <Icon icon="mdi:office-building-outline" width={34} />
        Office Holiday WhatsApp Notification
      </Typography>

      <Grid container spacing={4}>
        {/* LEFT: FORM */}
        <Grid item xs={12} md={5}>
          <Paper
            elevation={6}
            sx={{
              p: 4,
              borderRadius: 4,
              background: "linear-gradient(145deg, #ffffff, #f2f4f7)",
            }}
          >
            <Stack spacing={3}>
              <Typography variant="h6" fontWeight={600} color="text.primary">
                ✏️ Enter Holiday Details
              </Typography>

              <TextField
                label="Occasion"
                placeholder="e.g. Diwali, Christmas, etc."
                value={values.occasion}
                onChange={(e) => handleChange("occasion", e.target.value)}
                fullWidth
              />

              <Stack direction="row" spacing={2}>
                <TextField
                  label="Start Date"
                  type="date"
                  InputLabelProps={{ shrink: true }}
                  value={values.startDate}
                  onChange={(e) => handleChange("startDate", e.target.value)}
                  fullWidth
                />
                <TextField
                  label="End Date"
                  type="date"
                  InputLabelProps={{ shrink: true }}
                  value={values.endDate}
                  onChange={(e) => handleChange("endDate", e.target.value)}
                  fullWidth
                />
              </Stack>

              <TextField
                label="Reopen Date"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={values.reopenDate}
                onChange={(e) => handleChange("reopenDate", e.target.value)}
                fullWidth
              />

              <TextField
                label="Additional Message"
                multiline
                minRows={3}
                placeholder="Write any custom message here..."
                value={values.message}
                onChange={(e) => handleChange("message", e.target.value)}
                fullWidth
              />

              <FormControl fullWidth>
                <InputLabel>Customer Type</InputLabel>
                <Select
                  value={values.isLoan}
                  label="Customer Type"
                  onChange={(e) => handleChange("isLoan", e.target.value)}
                >
                  <MenuItem value="all">All</MenuItem>
                  <MenuItem value='true'>Loan Active</MenuItem>
                  <MenuItem value='false'>Loan Inactive</MenuItem>
                </Select>
              </FormControl>

              <Divider sx={{ my: 2 }} />

              <Button
                variant="contained"
                disabled={loading}
                onClick={handleSubmit}
                startIcon={
                  loading ? (
                    <CircularProgress size={20} color="inherit" />
                  ) : (
                    <Icon icon="mdi:whatsapp" width={24} />
                  )
                }
                sx={{
                  bgcolor: "#25D366",
                  "&:hover": { bgcolor: "#1ebd5a" },
                  py: 1.4,
                  fontWeight: 600,
                  transition: "all 0.3s ease",
                }}
                fullWidth
              >
                {loading ? "Sending..." : "Send WhatsApp Notification"}
              </Button>
            </Stack>
          </Paper>
        </Grid>

        {/* RIGHT: PREVIEW */}
        <Grid item xs={12} md={7}>
          <Fade in timeout={400}>
            <Card
              sx={{
                p: 4,
                borderRadius: 4,
                background: "#e5ddd5",
                boxShadow: 5,
                minHeight: 450,
                position: "relative",
                overflow: "hidden",
              }}
            >
              <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
                💬 Live WhatsApp Message Preview
              </Typography>

              <Box
                sx={{
                  background: "#ffffff",
                  borderRadius: "16px",
                  px: 2.5,
                  py: 2,
                  maxWidth: "80%",
                  fontSize: 15,
                  lineHeight: 1.8,
                  boxShadow: 2,
                  whiteSpace: "pre-wrap",
                  fontFamily: "Noto Sans Gujarati, sans-serif",
                  border: "1px solid #e0e0e0",
                }}
              >
                {previewMessage}
              </Box>

              <Box
                sx={{
                  position: "absolute",
                  bottom: 12,
                  right: 24,
                  color: "gray",
                  fontSize: 13,
                  display: "flex",
                  alignItems: "center",
                  gap: 0.5,
                }}
              >
                <Icon icon="mdi:clock-outline" width={16} />
                Auto preview updates instantly
              </Box>
            </Card>
          </Fade>
        </Grid>
      </Grid>
    </Box>
  );
}
