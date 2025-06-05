export const turnToArray = <T>(value: T | T[]): T[] => {
	if (Array.isArray(value)) {
		return value;
	}
	return [value];
};

// const uniqueClassMap = new Map<string, any>();
// 	classList.forEach((cls: any) => {
// 		const className = cls?.name;
// 		if (!uniqueClassMap.has(className)) {
// 			uniqueClassMap.set(className, cls);
// 			// console.log('Unique class added:', uniqueClassMap);
// 		}
// 	});
