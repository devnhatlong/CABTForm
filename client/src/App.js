import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import "./styles/sb-admin-2.min.css";
import { Login } from './pages/Login/views/Login';
import PrivateRoute from './routes/PrivateRoute';
import { Dashboard } from './pages/Dashboard/views/Dashboard';
import userService from './services/userService';
import { useDispatch } from 'react-redux';
import { setUser } from './redux/userSlice';
import { handleDecoded } from './utils/utils';
import Loading from './components/LoadingComponent/Loading';

function App() {
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(true); // Mặc định là `true` để chờ tải dữ liệu

  const handleGetDetailsUser = async () => {
    const { accessToken, decoded } = handleDecoded();

    if (decoded?._id) {
      const response = await userService.getUser(accessToken);
      dispatch(setUser(response.result));
    }
    setIsLoading(false); // Kết thúc trạng thái tải
  };

  useEffect(() => {
    handleGetDetailsUser();
  }, []);

  // Hiển thị trạng thái tải trước khi render các route
  if (isLoading) {
    return <Loading isLoading={true} />;
  }

  return (
    <Router>
      <div className="App" id="wrapper">
        <Routes>
          <Route element={<PrivateRoute />}>
            <Route path="/*" element={<Dashboard />} />
          </Route>
          <Route path="/login" element={<Login />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;