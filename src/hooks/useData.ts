import { UseSelector, shallowEqual, useSelector } from "react-redux";
import { RootState } from "../store/store";

export const useData = () => {
	const { studentList, isLoading } = useSelector((state: RootState) => state.students, shallowEqual);
	return {
		studentList,
		isLoading,
	};
};
