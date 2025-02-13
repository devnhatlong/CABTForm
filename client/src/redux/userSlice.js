import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  _id: "",
  userName: "",
  role: ""
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (state, action) => {
      let { _id = "", userName = "", role = "" } = action.payload;
      state._id = _id;
      state.userName = userName;
      state.role = role
    },
    clearUser: (state) => {
      state._id = "";
      state.userName = "";
      state.role = "";
    },
  },
});

export const { setUser, clearUser } = userSlice.actions;

export default userSlice.reducer;
