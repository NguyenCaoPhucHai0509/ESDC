import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import trainerService from './trainerService';

const initialState = {
  trainers: [],
  trainer: null,
  trainerRequests: [],
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

// Get trainer requests
export const getTrainerRequests = createAsyncThunk(
  'trainers/getRequests',
  async (_, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      return await trainerService.getTrainerRequests(token);
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

// Respond to trainer request
export const respondToRequest = createAsyncThunk(
  'trainers/respond',
  async (responseData, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      return await trainerService.respondToRequest(responseData, token);
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
      })
      .addCase(getTrainerRequests.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getTrainerRequests.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.trainerRequests = action.payload;
      })
      .addCase(getTrainerRequests.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(respondToRequest.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(respondToRequest.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.trainerRequests = state.trainerRequests.map(req => 
          req._id === action.payload._id ? action.payload : req
        );
      })
      .addCase(respondToRequest.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      });
  },
});

export const { reset } = trainerSlice.actions;
export default trainerSlice.reducer;