import { jwtDecode } from 'jwt-decode';

interface DecodedToken {
    sub: string; // Subject (usually username or email)
    roles: string[]; // User roles
    iat: number; // Issued at
    exp: number; // Expiration time
}

export const getDecodedToken = (): DecodedToken | null => {
    const token = sessionStorage.getItem('jwtToken');
    if (!token) {
        return null;
    }

    try {
        const decoded = jwtDecode<DecodedToken>(token);
        return decoded;
    } catch (error) {
        console.error('Failed to decode JWT:', error);
        return null;
    }
};

export const useAuth = () => {
    const decodedToken = getDecodedToken();

    const isLoggedIn = !!decodedToken;
    const userRole = decodedToken?.roles?.[0] || null; // Assuming one role per user for simplicity
    const isAdmin = userRole === 'ROLE_ADMIN';
    const username = decodedToken?.sub;

    return { isLoggedIn, userRole, isAdmin, username };
};
