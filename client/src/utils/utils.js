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