import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import ratingService from './ratingService';

const initialState = {
  ratings: [],
  isError: false,
  isSuccess: false,
  isLoading: false,
  message: '',
};

// Get ratings for a user
export const getRatings = createAsyncThunk(
  'ratings/getAll',
  async (userId, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      return await ratingService.getRatings(userId, token);
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

// Create rating
export const createRating = createAsyncThunk(
  'ratings/create',
  async (ratingData, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      return await ratingService.createRating(ratingData, token);
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

// Update rating
export const updateRating = createAsyncThunk(
  'ratings/update',
  async ({ id, ratingData }, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      return await ratingService.updateRating(id, ratingData, token);
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

// Delete rating
export const deleteRating = createAsyncThunk(
  'ratings/delete',
  async (id, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      return await ratingService.deleteRating(id, token);
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

export const ratingSlice = createSlice({
  name: 'rating',
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
      .addCase(getRatings.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getRatings.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.ratings = action.payload;
      })
      .addCase(getRatings.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(createRating.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createRating.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.ratings.push(action.payload);
      })
      .addCase(createRating.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(updateRating.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateRating.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.ratings = state.ratings.map((rating) =>
          rating._id === action.payload._id ? action.payload : rating
        );
      })
      .addCase(updateRating.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(deleteRating.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(deleteRating.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.ratings = state.ratings.filter(
          (rating) => rating._id !== action.payload.id
        );
      })
      .addCase(deleteRating.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      });
  },
});

export const { reset } = ratingSlice.actions;
export default ratingSlice.reducer;