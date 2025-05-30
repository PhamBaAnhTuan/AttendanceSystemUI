import dayjs from "dayjs";
import { formatDate } from "./formatTime";

const arraysEqual = (a: any[], b: any[]) => {
	return a.length === b.length && a.every((item) => b.includes(item));
};

export const normalizeField = (val: any) => {
	if (typeof val === "number" || typeof val === "string") {
		return String(val);
	}
	if (dayjs.isDayjs(val)) {
		return val.format(formatDate);
	}
	if (typeof val === "object" && val !== null) {
		return JSON.stringify(val);
	}
	return val;
};
export const isAvatarChanged = (initialAvatar: any, currentAvatar: any): boolean => {
	if (typeof initialAvatar === "string" && typeof currentAvatar === "string") {
		return initialAvatar !== currentAvatar;
	}
	if (typeof initialAvatar === "string" && typeof currentAvatar === "object") {
		return !initialAvatar.includes(currentAvatar.name);
	}
	if (
		typeof initialAvatar === "object" &&
		initialAvatar !== null &&
		typeof currentAvatar === "object" &&
		currentAvatar !== null
	) {
		return initialAvatar.name !== currentAvatar.name || initialAvatar.size !== currentAvatar.size;
	}
	return initialAvatar !== currentAvatar;
};

export const isFormChanged = (initialValues: any, currentValues: any): boolean => {
	return Object.keys(initialValues).some((key) => {
		if (key === "avatar") {
			return isAvatarChanged(initialValues.avatar, currentValues.avatar);
		}
		return normalizeField(initialValues[key]) !== normalizeField(currentValues[key]);
	});
};

export const checkIfChangesExist = (
	initialValues: any,
	currentValues: any,
	currentSubjectRelations: any[],
	selectedSubjectIds: number[],
	currentClassRelations: any[],
	selectedClassIds: number[],
) => {
	const isForm = isFormChanged(initialValues, currentValues);

	const currentSubjectIds = currentSubjectRelations.map((rel) => rel.id);
	const currentClassIds = currentClassRelations.map((rel) => rel.id);

	return {
		isFormChanged: isForm,
		isSubjectChanged: !arraysEqual(currentSubjectIds, selectedSubjectIds),
		isClassChanged: !arraysEqual(currentClassIds, selectedClassIds),
	};
};

export const getChangedFields = (initial: any, current: any): Record<string, any> => {
	const changedFields: Record<string, any> = {};

	Object.keys(current).forEach((key) => {
		if (key === "avatar") {
			if (isAvatarChanged(initial.avatar, current.avatar)) {
				changedFields.avatar = current.avatar;
			}
		} else {
			const a = normalizeField(initial[key]);
			const b = normalizeField(current[key]);
			if (a !== b) {
				changedFields[key] = current[key]; // giữ raw value để nộp lên
			}
		}
	});

	return changedFields;
};
