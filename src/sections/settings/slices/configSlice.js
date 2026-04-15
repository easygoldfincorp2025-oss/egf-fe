import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';

export const updateConfigs = createAsyncThunk('configs/updateConfigs', async (data) => {
  try {
    const { payload, companyId } = data;
    const response = await axios.put(`${import.meta.env.VITE_BASE_URL}/${companyId}/update-logo`, payload);
    return response?.data?.data;
  } catch (e) {
    console.log(e);
  }
});

export const ConfigSlice = createSlice({
  name: 'configs',
  initialState: {
    configs: {},
  },
  reducers: {
    setCompanyDetails: (state, action) => {
      state.company = action.payload;
    },
  },
  extraReducers: builder => {
    builder.addCase(updateConfigs.fulfilled, (state, action) => {
      state.configs = action.payload;
    });
  },
});

export const { setCompanyDetails } = ConfigSlice.actions;

export default ConfigSlice.reducer;
