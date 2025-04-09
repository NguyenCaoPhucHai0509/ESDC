import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import trainerService from './trainerService';

const initialState = {
  trainers: [],
  trainer: null,
  isError: false,
  isSuccess: false,
  isLoading: false,
  message: '',
};

// Get all trainers
export const getTrainers = createAsyncThunk(
  'trainers/getAll',
  async (_, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      return await trainerService.getTrainers(token);
    } catch (error) {
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Get trainer by ID
export const getTrainerById = createAsyncThunk(
  'trainers/getById',
  async (trainerId, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      return await trainerService.getTrainerById(trainerId, token);
    } catch (error) {
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Request a trainer
export const requestTrainer = createAsyncThunk(
  'trainers/request',
  async (requestData, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      return await trainerService.requestTrainer(requestData, token);
    } catch (error) {
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const trainerSlice = createSlice({
  name: 'trainer',
  initialState,
  reducers: {
    reset: (state) => {
      state.isLoading = false;
      state.isSuccess = false;
      state.isError = false;
      state.message = '';
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getTrainers.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getTrainers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.trainers = action.payload;
      })
      .addCase(getTrainers.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(getTrainerById.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getTrainerById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.trainer = action.payload;
      })
      .addCase(getTrainerById.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(requestTrainer.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(requestTrainer.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
      })
      .addCase(requestTrainer.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      });
  },
});

export const { reset } = trainerSlice.actions;
export default trainerSlice.reducer;