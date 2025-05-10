import axios from "axios";
import { StudentType } from "../store/studentSlice";

const API_URL = "https://660d2bd96ddfa2943b33731c.mockapi.io/api/users/";

export const getStudentsAPI = async (): Promise<StudentType[]> => {
	const response = await axios.get(API_URL);
	return response.data;
};
