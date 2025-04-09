import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import membershipService from './membershipService';

const initialState = {
  memberships: [],
  membership: null,
  isError: false,
  isSuccess: false,
  isLoading: false,
  message: '',
};

// Get all memberships
export const getMemberships = createAsyncThunk(
  'memberships/getAll',
  async (_, thunkAPI) => {
    try {
      return await membershipService.getMemberships();
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

// Create membership
export const createMembership = createAsyncThunk(
  'memberships/create',
  async (membershipData, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      return await membershipService.createMembership(membershipData, token);
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

// Update membership
export const updateMembership = createAsyncThunk(
  'memberships/update',
  async ({ id, membershipData }, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      return await membershipService.updateMembership(id, membershipData, token);
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

// Delete membership
export const deleteMembership = createAsyncThunk(
  'memberships/delete',
  async (id, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      return await membershipService.deleteMembership(id, token);
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

export const membershipSlice = createSlice({
  name: 'membership',
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
      .addCase(getMemberships.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getMemberships.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.memberships = action.payload;
      })
      .addCase(getMemberships.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(createMembership.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createMembership.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.memberships.push(action.payload);
      })
      .addCase(createMembership.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(updateMembership.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateMembership.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.memberships = state.memberships.map((membership) =>
          membership._id === action.payload._id ? action.payload : membership
        );
      })
      .addCase(updateMembership.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(deleteMembership.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(deleteMembership.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.memberships = state.memberships.filter(
          (membership) => membership._id !== action.payload.id
        );
      })
      .addCase(deleteMembership.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      });
  },
});

export const { reset } = membershipSlice.actions;
export default membershipSlice.reducer;