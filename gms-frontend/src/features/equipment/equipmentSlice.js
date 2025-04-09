import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import equipmentService from './equipmentService';

const initialState = {
  equipment: [],
  singleEquipment: null,
  isError: false,
  isSuccess: false,
  isLoading: false,
  message: '',
};

// Get all equipment
export const getEquipment = createAsyncThunk(
  'equipment/getAll',
  async (_, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      return await equipmentService.getEquipment(token);
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

// Create new equipment
export const createEquipment = createAsyncThunk(
  'equipment/create',
  async (equipmentData, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      return await equipmentService.createEquipment(equipmentData, token);
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

// Update equipment
export const updateEquipment = createAsyncThunk(
  'equipment/update',
  async ({ id, equipmentData }, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      return await equipmentService.updateEquipment(id, equipmentData, token);
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

// Delete equipment
export const deleteEquipment = createAsyncThunk(
  'equipment/delete',
  async (id, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      return await equipmentService.deleteEquipment(id, token);
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

export const equipmentSlice = createSlice({
  name: 'equipment',
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
      .addCase(getEquipment.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getEquipment.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.equipment = action.payload;
      })
      .addCase(getEquipment.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(createEquipment.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createEquipment.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.equipment.push(action.payload);
      })
      .addCase(createEquipment.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(updateEquipment.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateEquipment.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.equipment = state.equipment.map((item) =>
          item._id === action.payload._id ? action.payload : item
        );
      })
      .addCase(updateEquipment.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(deleteEquipment.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(deleteEquipment.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.equipment = state.equipment.filter(
          (item) => item._id !== action.payload.id
        );
      })
      .addCase(deleteEquipment.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      });
  },
});

export const { reset } = equipmentSlice.actions;
export default equipmentSlice.reducer;