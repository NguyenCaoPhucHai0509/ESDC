import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import userReducer from '../features/users/userSlice';
import membershipReducer from '../features/memberships/membershipSlice';
import conversationReducer from '../features/conservations/conversationSlice';
import messageReducer from '../features/messages/messageSlice';
import equipmentReducer from '../features/equipment/equipmentSlice';
import eventReducer from '../features/events/eventSlice';
import ratingReducer from '../features/rating/ratingSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    users: userReducer,
    memberships: membershipReducer,
    conversations: conversationReducer,
    messages: messageReducer,
    equipment: equipmentReducer,
    events: eventReducer,
    ratings: ratingReducer
  },
});