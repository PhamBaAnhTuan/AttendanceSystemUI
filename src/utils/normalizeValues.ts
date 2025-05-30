import dayjs from "dayjs";
import { formatDate } from "./formatTime";

export const normalizeValues = (values: any) => {
	return {
		...values,
		date_of_birth: values.date_of_birth ? dayjs(values.date_of_birth).format(formatDate) : null,
		avatar: typeof values.avatar === "string" ? values.avatar : null,
	};
};

export const compareTwoObject = (initObject: any, currentObject: any) => {
	const initNorm = normalizeValues(initObject);
	console.log("Initial object after normalize: ", initNorm);
	const currentNorm = normalizeValues(currentObject);
	console.log("Current object after normalize: ", currentNorm);

	return Object.keys(initNorm).some((key) => initNorm[key] !== currentNorm[key]);
};

export const getChangedFields = (initial: any, current: any): Record<string, any> => {
	const initialNormalized = normalizeValues(initial);
	const currentNormalized = normalizeValues(current);

	const changedFields: Record<string, any> = {};

	Object.keys(currentNormalized).forEach((key) => {
		if (initialNormalized[key] !== currentNormalized[key]) {
			changedFields[key] = current[key]; // lấy giá trị chưa format để giữ kiểu nguyên thủy (đặc biệt với file)
		}
	});

	return changedFields;
};
