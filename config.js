import axios from "axios";

const api = axios.create({
    baseURL: `https://sinhvien1.tlu.edu.vn/education/`,
    withXSRFToken: true,
    headers:{
        Accept: 'application/json',
    }
})

export default api