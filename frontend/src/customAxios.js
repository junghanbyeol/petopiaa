import axios from "axios";
import {jwtDecode} from "jwt-decode";
import {createBrowserRouter} from "react-router-dom";


const createAuthInstance = () => {

    const instance = axios.create({
        baseURL: "http://localhost:3000",
        headers: {
            "Content-Type": 'application/json'
        }
    })

    return setInterceptors(instance)
}

const createFormInstance = () => {
    const instance = axios.create({
        baseURL: "http://localhost:3000",
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    })

    return setInterceptors(instance)
}

const setInterceptors = (instance) => {

    instance.interceptors.request.use(
        async (config) => {
            try {
                const memberId = JSON.parse(localStorage.getItem("memberData")).id
                const token = localStorage.getItem('accessToken');
                if (token == null) {
                    const response = await refreshTokenAPI(memberId)

                    localStorage.setItem('accessToken', response.data)
                    const newToken = localStorage.getItem('accessToken')
                    config.headers.Authorization = `Bearer ${newToken}`
                } else {
                    const currentTime = Math.floor(Date.now() / 1000);
                    const exp = jwtDecode(token).exp

                    if (exp >= currentTime) {
                        config.headers.Authorization = `Bearer ${token}`
                    } else {
                        const response = await refreshTokenAPI(memberId)

                        localStorage.setItem('accessToken', response.data)
                        const newToken = localStorage.getItem('accessToken')
                        config.headers.Authorization = `Bearer ${newToken}`

                    }
                }

            } catch (error) {
                if (error.response.status === 401 || error.response.status === 404) {
                    window.location.href = '/'
                }
                console.log(error);
            }


            return config;
        },
        (error) => {
            return Promise.reject(error);
        }
    );

    instance.interceptors.response.use(
        (response) => {
            return response;
        },
        (error) => {
            return Promise.reject(error);
        }
    );
    return instance;
}

const authInstance = createAuthInstance();
const formInstance = createFormInstance();

const instance = axios.create({
    baseURL: "http://localhost:3000"
})

// instance(인증필요X) authInstance(인증필요O) formInstance(인증필요O, 업로드 관련O)

export const createMemberAPI = (createMemberRequest) => {
    return instance.post("/api/members", createMemberRequest)
}

export const loginAPI = (loginRequest) => {
    return instance.post("/api/auth", loginRequest)
}

export const logoutAPI = (memberId) => {
    return authInstance.post(`/api/auth/members/${memberId}`)
}

export const refreshTokenAPI = (memberId) => {
    return instance.post(`/api/refresh-tokens/members/${memberId}`)
}

export const petsByMemberAPI = (memberId) => {
    return authInstance.get(`/api/pets/members/${memberId}`)
}

export const createPetAPI = (formData) => {
    return formInstance.post("/api/pets", formData)
}

export const getPetAPI = (petId) => {
    return authInstance.get(`/api/pets/${petId}`)
}

export const followAPI = (followRequest) => {
    return authInstance.post("/api/follows", followRequest)
}
