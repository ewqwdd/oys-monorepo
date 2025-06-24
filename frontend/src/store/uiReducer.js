import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  mobSidebar: false,
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    setMobSidebar: (state, action) => {
      state.mobSidebar = action.payload;
    },
  },
});

export const uiActions = uiSlice.actions;

export default uiSlice.reducer;
