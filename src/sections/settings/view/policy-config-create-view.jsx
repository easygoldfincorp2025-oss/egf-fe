import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Card,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  Paper,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { useGetConfigs } from 'src/api/config';
import axios from 'axios';
import { useAuthContext } from 'src/auth/hooks';
import { useSnackbar } from 'src/components/snackbar';
import Iconify from 'src/components/iconify';
import { Stack } from '@mui/system';
import { DragDropContext, Draggable, Droppable } from '@hello-pangea/dnd';

export default function PolicyConfigCreateView() {
  const { user } = useAuthContext();
  const { configs, mutate } = useGetConfigs();
  const [exportPolicyConfig, setExportPolicyConfig] = useState('');
  const [localPolicyConfig, setLocalPolicyConfig] = useState(configs?.exportPolicyConfig || []);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editingValue, setEditingValue] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, item: null });
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    if (configs?.exportPolicyConfig) {
      setLocalPolicyConfig(configs.exportPolicyConfig);
    }
  }, [configs]);

  const apiEndpoint = `${import.meta.env.VITE_BASE_URL}/${user?.company}/config/${configs?._id}`;

  const handleAddPolicy = () => {
    if (!exportPolicyConfig.trim()) {
      enqueueSnackbar('Terms and Conditions cannot be empty', { variant: 'warning' });
      return;
    }

    const updatedConfig = [...localPolicyConfig, exportPolicyConfig.trim()];
    setLocalPolicyConfig(updatedConfig);

    axios
      .put(apiEndpoint, { ...configs, exportPolicyConfig: updatedConfig })
      .then(() => {
        setExportPolicyConfig('');
        enqueueSnackbar('Terms and Conditions added successfully', { variant: 'success' });
        mutate();
      })
      .catch(() => {
        enqueueSnackbar('Failed to add Terms and Conditions', { variant: 'error' });
        setLocalPolicyConfig(localPolicyConfig);
      });
  };

  const handleDeletePolicy = (item) => {
    setDeleteConfirm({ open: true, item });
  };

  const confirmDelete = () => {
    const updatedConfig = localPolicyConfig.filter((r) => r !== deleteConfirm.item);
    setLocalPolicyConfig(updatedConfig);

    axios
      .put(apiEndpoint, { ...configs, exportPolicyConfig: updatedConfig })
      .then(() => {
        enqueueSnackbar('Terms and Conditions deleted successfully', { variant: 'success' });
        mutate();
      })
      .catch(() => {
        enqueueSnackbar('Failed to delete Terms and Conditions', { variant: 'error' });
        setLocalPolicyConfig(localPolicyConfig);
      });

    setDeleteConfirm({ open: false, item: null });
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const reorderedList = Array.from(localPolicyConfig);
    const [movedItem] = reorderedList.splice(result.source.index, 1);
    reorderedList.splice(result.destination.index, 0, movedItem);

    setLocalPolicyConfig(reorderedList);

    axios.put(apiEndpoint, { ...configs, exportPolicyConfig: reorderedList }).catch(() => {
      enqueueSnackbar('Failed to update order', { variant: 'error' });
      setLocalPolicyConfig(localPolicyConfig);
    });
  };

  const handleEditSave = () => {
    if (!editingValue.trim()) {
      enqueueSnackbar('Terms and Conditions cannot be empty', { variant: 'warning' });
      return;
    }

    const updatedConfig = [...localPolicyConfig];
    updatedConfig[editingIndex] = editingValue.trim();
    setLocalPolicyConfig(updatedConfig);

    axios
      .put(apiEndpoint, { ...configs, exportPolicyConfig: updatedConfig })
      .then(() => {
        enqueueSnackbar('Terms and Conditions updated successfully', { variant: 'success' });
        setEditingIndex(null);
        setEditingValue('');
        mutate();
      })
      .catch(() => {
        enqueueSnackbar('Failed to update Terms and Conditions', { variant: 'error' });
        setLocalPolicyConfig(localPolicyConfig);
      });
  };

  return (
    <Box sx={{ width: '100%', padding: 2 }}>
      <Grid container spacing={3}>
        {/* Header */}
        <Grid item xs={12}>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
            Terms & Conditions Configuration
          </Typography>
          <Divider sx={{ mb: 2 }} />
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ p: 2, boxShadow: 3 }}>
            <TextField
              fullWidth
              label="Add New Term"
              variant="outlined"
              value={exportPolicyConfig}
              onChange={(e) => setExportPolicyConfig(e.target.value)}
              multiline
              minRows={3}
            />
            <Button variant="contained" fullWidth sx={{ mt: 2 }} onClick={handleAddPolicy}>
              Add Term
            </Button>
          </Card>
        </Grid>
        <Grid item xs={12} md={8}>
          <Card sx={{ p: 2, boxShadow: 3, maxHeight: '600px', overflowY: 'auto' }}>
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="exportPolicyConfig">
                {(provided) => (
                  <Stack spacing={2} ref={provided.innerRef} {...provided.droppableProps}>
                    {localPolicyConfig.map((item, index) => (
                      <Draggable key={item} draggableId={item} index={index}>
                        {(provided, snapshot) => (
                          <Paper
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            sx={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              p: 2,
                              bgcolor: snapshot.isDragging ? 'primary.light' : 'background.paper',
                              boxShadow: snapshot.isDragging ? 4 : 1,
                              borderRadius: 2,
                              transition: 'all 0.2s',
                              wordBreak: 'break-word',
                            }}
                          >
                            <Box sx={{ width: '80%' }}>
                              {editingIndex === index ? (
                                <TextField
                                  fullWidth
                                  size="small"
                                  multiline
                                  minRows={2}
                                  value={editingValue}
                                  onChange={(e) => setEditingValue(e.target.value)}
                                />
                              ) : (
                                <Typography sx={{ fontSize: 14 }}>{item}</Typography>
                              )}
                            </Box>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                              {editingIndex === index ? (
                                <Button size="small" variant="contained" onClick={handleEditSave}>
                                  Save
                                </Button>
                              ) : (
                                <>
                                  <Tooltip title="Edit Term">
                                    <IconButton
                                      color="primary"
                                      onClick={() => {
                                        setEditingIndex(index);
                                        setEditingValue(item);
                                      }}
                                    >
                                      <Iconify icon="eva:edit-fill" />
                                    </IconButton>
                                  </Tooltip>
                                  <Tooltip title="Delete Term">
                                    <IconButton
                                      color="error"
                                      onClick={() => handleDeletePolicy(item)}
                                    >
                                      <Iconify icon="solar:trash-bin-trash-bold" />
                                    </IconButton>
                                  </Tooltip>
                                </>
                              )}
                            </Box>
                          </Paper>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </Stack>
                )}
              </Droppable>
            </DragDropContext>
          </Card>
        </Grid>
      </Grid>
      <Dialog
        open={deleteConfirm.open}
        onClose={() => setDeleteConfirm({ open: false, item: null })}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this term? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirm({ open: false, item: null })}>Cancel</Button>
          <Button color="error" onClick={confirmDelete}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
