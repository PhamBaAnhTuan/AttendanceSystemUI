import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";

import authReducer from "./authSlice";
import teacherReducer from "./teacherSlice";
import studentReducer from "./studentSlice";
import subjectReducer from "./subjectSlice";
import classReducer from "./classSlice";
import roomReducer from "./roomSlice";

const persistConfig = {
	key: "root",
	storage,
	// whitelist: ["auth"],
};

const rootReducer = combineReducers({
	auth: authReducer,
	teacher: teacherReducer,
	student: studentReducer,
	subject: subjectReducer,
	class: classReducer,
	room: roomReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
	reducer: persistedReducer,
	middleware: (getDefaultMiddleware) =>
		getDefaultMiddleware({
			serializableCheck: false,
		}),
});

export const persistor = persistStore(store);
export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = typeof store.dispatch;
