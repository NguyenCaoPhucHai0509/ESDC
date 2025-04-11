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

// Create new conversation
export const createConversation = createAsyncThunk(
  'conversations/create',
  async (userData, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      return await conversationService.createConversation(userData, token);
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

// Create group chat
export const createGroupChat = createAsyncThunk(
  'conversations/createGroup',
  async (groupData, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      return await conversationService.createGroupChat(groupData, token);
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

// Add user to group
export const addToGroup = createAsyncThunk(
  'conversations/addToGroup',
  async ({ groupId, userId }, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      return await conversationService.addToGroup(groupId, { userId }, token);
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

// Remove user from group
export const removeFromGroup = createAsyncThunk(
  'conversations/removeFromGroup',
  async ({ groupId, userId }, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      return await conversationService.removeFromGroup(groupId, { userId }, token);
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
      })
      .addCase(createConversation.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createConversation.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.conversations.push(action.payload);
        state.conversation = action.payload;
      })
      .addCase(createConversation.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(createGroupChat.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createGroupChat.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.conversations.push(action.payload);
        state.conversation = action.payload;
      })
      .addCase(createGroupChat.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(addToGroup.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(addToGroup.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.conversations = state.conversations.map(conv => 
          conv._id === action.payload._id ? action.payload : conv
        );
        state.conversation = action.payload;
      })
      .addCase(addToGroup.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(removeFromGroup.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(removeFromGroup.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.conversations = state.conversations.map(conv => 
          conv._id === action.payload._id ? action.payload : conv
        );
        state.conversation = action.payload;
      })
      .addCase(removeFromGroup.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      });
  },
});

export const { reset } = conversationSlice.actions;
export default conversationSlice.reducer;