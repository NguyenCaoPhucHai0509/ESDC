import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import conversationService from './conversationService';

const initialState = {
  conversations: [],
  conversation: null,
  isError: false,
  isSuccess: false,
  isLoading: false,
  message: '',
};

// Get all conversations
export const fetchConversations = createAsyncThunk(
  'conversations/getAll',
  async (_, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      return await conversationService.getConversations(token);
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

export const conversationSlice = createSlice({
  name: 'conversation',
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
      .addCase(fetchConversations.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchConversations.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.conversations = action.payload;
      })
      .addCase(fetchConversations.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      });
  },
});

export const { reset } = conversationSlice.actions;
export default conversationSlice.reducer;