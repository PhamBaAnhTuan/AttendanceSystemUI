import { useSelector, shallowEqual } from "react-redux";
import { RootState } from "../store/store";

export const useTeacher = () => {
	return useSelector((state: RootState) => state.teacher, shallowEqual);
};
export const useStudent = () => {
	return useSelector((state: RootState) => state.student, shallowEqual);
};
export const useSubject = () => {
	return useSelector((state: RootState) => state.subject, shallowEqual);
};
export const useClass = () => {
	return useSelector((state: RootState) => state.class, shallowEqual);
};
export const useRoom = () => {
	return useSelector((state: RootState) => state.room, shallowEqual);
};
