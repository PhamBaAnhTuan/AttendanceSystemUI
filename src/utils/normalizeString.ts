export const normalizeString = (str: string) => {
	return str
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "")
		.toLowerCase();
};

export const removeSpace = (str: string | any) => {
	return str.replace(/\s+/g, "");
};
export const removeSpecialCharacters = (str: string) => {
	return str.replace(/[^a-zA-Z0-9]/g, "");
};
export const removeAccents = (str: string) => {
	return str
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "")
		.replace(/[^a-zA-Z0-9]/g, "");
};

// Helper chuyển shift từ tiếng Anh sang tiếng Việt
export const mapShiftToText = (shift: string): string => {
	switch (shift) {
		case "morning":
			return "(Buổi sáng)";
		case "afternoon":
			return "(Buổi chiều)";
		case "evening":
			return "";
		default:
			return shift;
	}
};
