import React, {
    createContext,
    useContext,
    useEffect,
    useState,
} from "react";

import { useNavigate } from "react-router"

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {

    const navigate = useNavigate()

    const [isLoggedIn, setIsLoggedIn] = useState(false);

    // Login
    const handleLogin = async (data) => {
        console.log("login", data)
        try {
            // Save Tokens
            localStorage.setItem(
                "access_token",
                data.access_token
            );


            localStorage.setItem(
                "refresh_token",
                data.refresh_token
            );
            setIsLoggedIn(true);
        } catch (err) {
            console.error(err, "cannot store login credentials")
        }

    };
    // Logout
    const handleLogout = () => {
        console.log("log out")
        // Remove Tokens
        localStorage.removeItem(
            "access_token"
        );

        localStorage.removeItem(
            "refresh_token"
        );
        // Logout User
        setIsLoggedIn(false);
    };

    useEffect(() => {
        console.log("render")
        const token =
            localStorage.getItem(
                "access_token"
            );

        if (token){
            setIsLoggedIn(true)
            // to be improved
            navigate("/",{ replace: true });
        }else{
            navigate("/login",{ replace: true });
        }

    }, [isLoggedIn]);
    


    // ── provider ──────────────────────────────────────────────────────────────
    return (
        <AuthContext.Provider
            value={{
                isLoggedIn,
                handleLogin,
                handleLogout
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuthStore = () => useContext(AuthContext);