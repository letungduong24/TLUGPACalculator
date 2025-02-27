import { useState, useEffect } from 'react';
import api from '../config';
import _ from "lodash";
import { Toaster } from 'sonner';
import { toast } from 'sonner'
import Loading from './Loading.jsx'

function App() {
  
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [data, setData] = useState([]);
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (token) {
      fetchData();
    }
  }, []); 

  useEffect(() => {
    if (data.length > 0) {
      gpaBySemester();
    }
  }, []);
  

  const fetchData = async () => {
    try {
      const response = await api.get("/api/studentsubjectmark/getListMarkDetailStudent", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setData(response.data);
      console.log(response.data);
    } catch (err) {
      if(err.message === 'Network Error'){
        toast.error('Web trường sập rồi không lấy thông tin để tính toán được!!', {duration:3000})
      }
      else{
        toast.error('Lỗi không xác định!!', {duration:3000})
      }
    } finally{
      setLoading(false)
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if(username == '' || password == ''){
      toast.error('Vui lòng nhập đầy đủ thông tin!', {
        duration:3000
      })
      return
    }
    const formData = new URLSearchParams();
    formData.append("client_id", "education_client");
    formData.append("grant_type", "password");
    formData.append("username", username);
    formData.append("password", password);
    formData.append("client_secret", "password");
    setLoading(true)
    try {
      const response = await api.post("/oauth/token", formData, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });
      setToken(response.data.access_token); 
    } catch (err) {
      if(err.message === 'Network Error'){
        toast.error('Web trường sập rồi không lấy thông tin để tính toán được!!', {duration:3000})
      }
      else{
        toast.error('Tài khoản hoặc mật khẩu không đúng!!!', {duration:3000})
      }
    } finally{
      setLoading(false)
    }
  };

  const calculateGPA = (data) => {
    let totalMark = 0;
    let totalCredit = 0;
  
    if (data.length > 0) {
      data.forEach((subject) => {
        switch(subject.charMark) {
          case 'A':
            totalMark += 4 * subject.subject.numberOfCredit;
            break;
          case 'B':
            totalMark += 3 * subject.subject.numberOfCredit;
            break;
          case 'C':
            totalMark += 2 * subject.subject.numberOfCredit;
            break;
          case 'D':
            totalMark += 1 * subject.subject.numberOfCredit;
            break;
          case 'F':
            totalMark += 0;
            break;
        }
        totalCredit += subject.subject.numberOfCredit;
      });
      return totalCredit > 0 ? (totalMark / totalCredit).toFixed(2) : 0;
    }
    return 0;
  };
  
  const gpaBySemester = () => {
    let gpaBySemester = []
    const groupedSemester = _.groupBy(data, 'semester.semesterCode')
    Object.entries(groupedSemester).forEach(([semesterCode, subjects]) => {
      gpaBySemester.push({semesterId: subjects[0].semester.id ,semesterCode, gpa: calculateGPA(subjects)})
    })
    gpaBySemester.sort((a, b) => a.semesterId - b.semesterId);
    console.log(groupedSemester)
    return gpaBySemester
  }
  
  return (
    <>
    <Toaster position="top-right" />
    <div className=" flex flex-col min-h-screen px-5">
      <div className='flex-grow items-center flex'>
        <div className="container mx-auto flex flex-col gap-3 items-center">
          <h2 className='font-bold text-4xl text-sky-900 text-center'>Tính GPA TLU</h2>
          <h2 className=' font-bold text-sky-900 text-center italic'>Trang web không lưu lại thông tin & tài khoản của người dùng!</h2>
          <div className="w-full md:w-2/3 lg:w-1/2 flex items-center justify-center mt-5 md:mt-0">
            <form onSubmit={handleSubmit} className="w-full p-4 flex flex-col justify-center shadow-lg rounded-3xl">
              <div className="mb-2 flex-col flex w-full">
                <label className='font-bold text-sky-900' htmlFor="">Tài khoản</label>
                <input value={username} onChange={(e) => setUsername(e.target.value)} type="text" className='text-sky-900 font-medium focus:ring-sky-600 outline-none focus:ring w-full border border-sky-800 rounded-lg p-2 bg-white' />
              </div>
              <div className="mb-2 flex-col flex">
                <label className='font-bold text-sky-900' htmlFor="">Mật khẩu</label>
                <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" className='text-sky-900 focus:ring-sky-600 outline-none focus:ring w-full border border-sky-800 rounded-lg p-2' />
              </div>
              {loading 
                ? 
                  <Loading /> 
                : 
                  <button 
                  type='submit' 
                  className='bg-sky-800 hover:bg-sky-900 font-bold text-lg transition-all duration-300 text-white px-4 py-2 rounded-lg cursor-pointer w-full'
                  >
                    Xem điểm
                  </button>
              }
            </form>
          </div>
          <div className="w-full md:w-2/3 lg:w-1/2 rounded-3xl font-semibold shadow-lg p-4 flex flex-col sm:flex-row gap-3 sm:items-center">
          {data.length > 0 ? (
            <>
            <div className="flow-root sm:border-e border-gray-100 sm:w-1/2">
              <dl className="-my-3 divide-y divide-gray-100 text-sm">
                <div className="grid grid-cols-2 py-3 gap-4">
                  <dt className="font-medium text-gray-900">Tên</dt>
                  <dd className="text-gray-700 ">{data[0].student.displayName}</dd>
                </div>

                <div className="grid grid-cols-2 py-3 gap-4">
                  <dt className="font-medium text-gray-900">Lớp</dt>
                  <dd className="text-gray-700 ">{data[0].student.className}</dd>
                </div>

                <div className="grid grid-cols-2 py-3 gap-4">
                  <dt className="font-medium text-gray-900">MSV</dt>
                  <dd className="text-gray-700 ">{data[0].student.studentCode}</dd>
                </div>
                <div className=" mb-3 grid grid-cols-2 py-3 gap-4">
                  <dt className="font-medium text-gray-900">GPA tổng</dt>
                  <dd className="text-gray-700 ">{calculateGPA(data)}</dd>
                </div>
              </dl>
            </div>
            <div className="flow-root sm:border-none border-t border-gray-400 sm:w-1/2">
              <dl className="mt-3 divide-y divide-gray-100 text-sm">
                <div className="grid grid-cols-2 py-3 gap-4">
                  <dt className="font-medium text-gray-900">Kì</dt>
                  <dt className="font-medium text-gray-900">GPA</dt>
                </div>
                {gpaBySemester().map((semester)=> (
                <div className="grid grid-cols-2 py-3 gap-4">
                  <dt className="font-medium text-gray-900">{semester.semesterCode}</dt>
                  <dd className="text-gray-700 ">{semester.gpa}</dd>
                </div>
                ))}
              </dl>
            </div>
            </>
          ) : (
            <p className='w-full text-center'>Chưa có dữ liệu, vui lòng đăng nhập bằng tài khoản sinhvien.tlu.edu.vn</p>
          )}    
          </div>
        </div>
      </div>
      <div className="text-center py-3">
        <p className='text-sm font-bold'>2025. LTD 🩶</p>
      </div>
    </div>
    
    </>
  );
}

export default App;
