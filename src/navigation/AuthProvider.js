import React, {createContext, useState} from 'react';
import auth from '@react-native-firebase/auth';

export const AuthContext = createContext();

export const AuthProvider = ({children}) => {
    const [user, setUser] = useState(null);
    return (
        <AuthContext.Provider
            value={{
                user,
                setUser,
                login: async (email, password,navigation) => {
                    try {
                        await auth().signInWithEmailAndPassword(email, password)
                            .then(res=>{
                                console.log(res)
                            })
                            .catch(error=>{
                                console.log(error)
                            })
                    } catch (e) {
                        console.log(e);
                    }
                },
                register: async (email, password) => {
                    try {
                        await auth().createUserWithEmailAndPassword(email, password)
                            .then(res=>{
                                console.log(res)
                            })
                            .catch(error=>{
                                console.log(error)
                            })
                    } catch (e) {
                        console.log(e);
                    }
                },
                logout: async () => {
                    try {
                        await auth().signOut();
                    } catch (e) {
                        console.log(e);
                    }
                },
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};
