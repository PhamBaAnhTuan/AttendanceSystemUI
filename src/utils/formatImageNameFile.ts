export const formatImageNameFile = (originalFile: any, targetName: string, fullname: string) => {
	// const fileExtension = originalFile.name.split(".").pop(); // Lấy đuôi file
	const clearName = fullname.replace(/\s+/g, "");
	const newFileName = `${targetName}_${clearName}.png`;
	// Tạo file mới với tên đã định dạng
	const renamedFile = new File([originalFile], newFileName, {
		type: originalFile.type,
	});
	return renamedFile;
};
