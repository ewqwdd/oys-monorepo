import { configureStore } from "@reduxjs/toolkit";
import commonReducer from "./commonReducer";
import uiReducer from "./uiReducer";

const store = configureStore({
  reducer: {
    common: commonReducer,
    ui: uiReducer,
  },
});

export default store;
