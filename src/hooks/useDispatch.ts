import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store/store";

// export const dispatch = () => useDispatch<AppDispatch>();
export const useAppDispatch: () => AppDispatch = useDispatch;
