import { configureStore } from '@reduxjs/toolkit';
import ConfigSlice from '../sections/settings/slices/configSlice';


export const store = configureStore({
  reducer: {
    configs : ConfigSlice
  }
})
