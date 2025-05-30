import { UseSelector, shallowEqual, useSelector } from "react-redux";
import { RootState } from "../store/store";

export const useAuth = () => {
	// const {isAdmin, isAuthenticated, info, refresh_token, scope, token} = useSelector((state: RootState) => state.auth, shallowEqual);
	// return { isAdmin, isAuthenticated, info, refresh_token, scope, token };
	return useSelector((state: RootState) => state.auth, shallowEqual);
};
