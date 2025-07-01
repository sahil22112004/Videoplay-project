// store/store.js
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './auth/authslice.js';

export const store = configureStore({
  reducer: {
    auth: authReducer,
  },
});