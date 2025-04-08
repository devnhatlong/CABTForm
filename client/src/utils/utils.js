import { message } from 'antd';
import { jwtDecode } from 'jwt-decode';

export const getTokenFromCookie = (cookieName) => {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i].trim();
        if (cookie.startsWith(cookieName + '=')) {
            return cookie.substring(cookieName.length + 1);
        }
    }
    return null;
};

export const handleDecoded = () => {
    let accessToken = getTokenFromCookie("accessToken_SLCB");
    let decoded = {};
    
    if (accessToken) {
      decoded = jwtDecode(accessToken);
    }

    return { accessToken, decoded };
};

export function getItem(label, key, icon, children, type, style) {
    return {
        key,
        icon,
        children,
        label,
        type,
        style,
    };
}

export const convertFileDataToFiles = (fileDataList) => {
    return fileDataList.map(fileData => {
        const file = new File([null], fileData.fileName, { type: fileData.type });
        file.path = fileData.path;
        return file;
    });
};

export const formatNumber = (number) => {
    return number.toLocaleString(); // Automatically adds thousands separators
};

// export const handleAttachFile = async (info, setSelectedFile) => {
//     const file = info.file;

//     // Kiểm tra MIME Type (nếu có thể xác định)
//     const allowedMimeType = 'application/octet-stream'; // MIME Type giả định cho file .bm2
//     const fileType = file.type;

//     if (fileType && fileType !== allowedMimeType) {
//         message.error('File không hợp lệ! MIME Type không khớp.');
//         return;
//     }

//     // Đọc nội dung file để kiểm tra (nếu cần)
//     // const fileContent = await file.text(); // Đọc nội dung file dưới dạng text
//     // if (!fileContent.startsWith('��')) { // Giả định file .bm2 bắt đầu bằng "BM2_HEADER"
//     //     message.error('File không hợp lệ! Nội dung không khớp.');
//     //     return;
//     // }

//     // Lưu tên file đã chọn
//     setSelectedFile({
//         name: file.name,
//     });

//     message.success(`File ${file.name} đã được đính kèm thành công!`);
// };

export const handleAttachFile = async (info, setSelectedFile) => {
    const file = info.file;

    // Kiểm tra MIME Type (chỉ cho phép file PDF)
    const allowedMimeType = 'application/pdf'; // MIME Type cho file PDF
    const fileType = file.type;

    if (fileType && fileType !== allowedMimeType) {
        message.error('Chỉ cho phép upload file PDF!');
        return;
    }

    // Lưu tên file đã chọn
    setSelectedFile({
        name: file.name,
    });

    message.success(`File ${file.name} đã được đính kèm thành công!`);
};