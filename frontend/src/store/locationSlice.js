// src/store/locationSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { fetchLocations } from "../api/locationApi";

export const getLocations = createAsyncThunk("locations/fetch", async () => {
  return await fetchLocations();
});

const locationSlice = createSlice({
  name: "locations",
  initialState: { data: [], loading: false },
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(getLocations.fulfilled, (state, action) => {
      state.data = action.payload;
    });
  },
});

export default locationSlice.reducer;
