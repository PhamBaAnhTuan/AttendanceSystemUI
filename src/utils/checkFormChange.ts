import dayjs from "dayjs";
import { formatDate } from "./formatTime";
import { turnToArray } from "./turnToArray";

// So sánh 2 mảng bất kể thứ tự
const arraysEqual = (a: any[], b: any[]) => {
	const aSorted = [...a].sort();
	const bSorted = [...b].sort();
	return a.length === b.length && aSorted.every((item, idx) => item === bSorted[idx]);
};

// Chuẩn hóa giá trị để so sánh
export const normalizeField = (val: any): string => {
	if (val === null || val === undefined) return "";

	if (dayjs.isDayjs(val)) {
		return val.format(formatDate);
	}

	if (typeof val === "string" || typeof val === "number" || typeof val === "boolean") {
		return String(val).trim();
	}

	if (val instanceof Date) {
		return dayjs(val).format(formatDate);
	}

	if (typeof val === "object") {
		// Convert object có thể lặp lại thành chuỗi chuẩn hóa
		try {
			return JSON.stringify(val, Object.keys(val).sort());
		} catch {
			return "";
		}
	}

	return "";
};

// So sánh avatar cũ và mới
export const isAvatarChanged = (initialAvatar: any, currentAvatar: any): boolean => {
	if (!initialAvatar && !currentAvatar) return false;
	if (!initialAvatar || !currentAvatar) return true;

	if (typeof initialAvatar === "string" && typeof currentAvatar === "string") {
		return initialAvatar !== currentAvatar;
	}

	if (typeof currentAvatar === "object" && currentAvatar?.name) {
		if (typeof initialAvatar === "string") {
			return !initialAvatar.includes(currentAvatar.name);
		}
		if (typeof initialAvatar === "object") {
			return initialAvatar.name !== currentAvatar.name || initialAvatar.size !== currentAvatar.size;
		}
	}

	return true;
};

// So sánh toàn bộ form
export const isFormChanged = (initialValues: any, currentValues: any): boolean => {
	// console.log("Checking form change...");
	return Object.keys(initialValues).some((key) => {
		if (key === "avatar") {
			return isAvatarChanged(initialValues.avatar, currentValues.avatar);
		}

		const initial = normalizeField(initialValues[key]);
		const current = normalizeField(currentValues[key]);
		return initial !== current;
	});
};

export const getChangedFields = (initial: any, current: any): Record<string, any> => {
	const changedFields: Record<string, any> = {};

	// Chỉ so sánh những field có trong form submit
	Object.keys(current).forEach((key) => {
		// if (!(key in initial)) return; // ⚠️ Bỏ qua field không có trong initialValues

		if (key === "avatar") {
			if (isAvatarChanged(initial.avatar, current.avatar)) {
				changedFields.avatar = current.avatar;
			}
		} else {
			const a = normalizeField(initial[key]);
			const b = normalizeField(current[key]);

			if (a !== b) {
				changedFields[key] = current[key];
			}
		}
	});

	return changedFields;
};

export const checkSubjectRelationChange = (initialSubjectIDs: string[], selectedSubjectIDs: string[]) => {
	return !arraysEqual(initialSubjectIDs, selectedSubjectIDs);
};
export const checkClassRelationChange = (initialClassIDs: string[], selectedClassIDs: string[]) => {
	return !arraysEqual(initialClassIDs, selectedClassIDs);
};

export const checkRelationChange = (initialIDs: string[], currentIDs: string[]) => {
	const initialID = turnToArray(initialIDs);
	const currentID = turnToArray(currentIDs);
	// console.log("Initial IDs:", initialID);
	// console.log("Current IDs:", currentID);
	return !arraysEqual(initialID, currentID);
};
