import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  loading: false,
  mounted: false,
  user: null,
  teachers: [],
};

const commonSlice = createSlice({
  name: "common",
  initialState,
  reducers: {
    setLoadig: (state, action) => {
      state.loading = action.payload;
    },
    setMounted: (state, action) => {
      state.mounted = action.payload;
    },
    setUser: (state, action) => {
      const {teachers, clients, ...rest} = action.payload;
      state.user = rest;
      state.clients = clients;
      state.teachers = teachers;
    },
    logout: (state) => {
      state.user = null;
      state.teachers = [];
    },
    addTeacher: (state, action) => {
      state.teachers.push(action.payload)
    },
    addAvaliable: (state, action) => {
      if (state.user?.role === 'teacher') {
        state.user.avaliable.push(action.payload.avaliable);
        return;
      }
      const teacher = state.teachers.find((teacher) => teacher._id === action.payload.teacherId);
      teacher.avaliable.push(action.payload.avaliable);
    },
    setAvaliable: (state, action) => {
      if (state.user?.role === 'teacher') {
        state.user.avaliable = action.payload.avaliable;
        return;
      }
      const teacher = state.teachers.find((teacher) => teacher._id === action.payload.teacherId);
      teacher.avaliable = action.payload.avaliable;
    },
    editAvaliable: (state, action) => {
      if (state.user?._id === action.payload.teacherId) {
        const avaliable = state.user.avaliable.find((avaliable) => avaliable._id === action.payload.avaliable._id);
        Object.assign(avaliable, action.payload.avaliable);
        return;
      }
      const teacher = state.teachers.find((teacher) => teacher._id === action.payload.teacherId);
      const avaliable = teacher.avaliable.find((avaliable) => avaliable._id === action.payload.avaliable._id);
      Object.assign(avaliable, action.payload.avaliable);
    },
    deleteAvalialbe: (state, action) => {
      const teacher = state.teachers.find((teacher) => teacher._id === action.payload.teacherId);
      teacher.avaliable = teacher.avaliable.filter((avaliable) => avaliable._id !== action.payload.avaliableId);
    },
    setMeets: (state, action) => {
      state.meets = action.payload;
    },
    editTeacher: (state, action) => {
      if (state.user?._id === action.payload._id) {
        state.user = action.payload;
        Object.entries(action.payload).forEach(([key, value]) => {
          if (!value || (Array.isArray(value) && !value.length)) return;
          state.user[key] = value;
        });
        return;
      }
      const teacher = state.teachers.find((teacher) => teacher._id === action.payload._id);
      Object.assign(teacher, action.payload);
    },
    deleteTeacher: (state, action) => {
      state.teachers = state.teachers.filter((teacher) => teacher._id !== action.payload);
    },
    addMeet: (state, action) => {
      const findIndex = state.meets?.findIndex((meet) => meet._id === action.payload._id);
      if (findIndex !== -1) {
        let meet = state.meets[findIndex]
        Object.assign(meet, {...action.payload, teacher: meet.teacher});
      } else {
        state.meets.push(action.payload);
      }
    },
    addClient: (state, action) => {
      state.clients.push(action.payload);
    },
    editClient: (state, action) => {
      const client = state.clients.find((client) => client._id === action.payload._id);
      Object.assign(client, action.payload);
    },
    deleteClient: (state, action) => {
      state.clients = state.clients.filter((client) => client._id !== action.payload);
    },
    setPhotos: (state, action) => {
      state.photos = action.payload;
    },
    appendPhoto: (state, action) => {
      state.photos.push(action.payload);
    },
    deletePhoto: (state, action) => {
      state.photos = state.photos.filter((photo) => photo.key !== action.payload);
    },
    deleteClients: (state, action) => {
      state.clients = state.clients.filter((client) => !action.payload.includes(client._id));
    },
    deleteClientFromMeet: (state, action) => {
      const meet = state.meets.find((meet) => meet._id === action.payload.meetId);
      meet.clients = meet.clients.filter((client) => client._id !== action.payload.clientId);
    }
  },
});

export const commonActions = commonSlice.actions;

export default commonSlice.reducer;
