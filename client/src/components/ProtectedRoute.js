import React, { useEffect } from "react";
import { message } from "antd";
import { GetUserInfo } from "../apicalls/users";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { ReloadUser, SetUser } from "../redux/usersSlice";
import { HideLoading, ShowLoading } from "../redux/loadersSlice";
import DefaultLayout from "./DefaultLayout";

function ProtectedRoute(props) {
  const { user , reloadUser } = useSelector((state) => state.users);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const getData = async () => {
    try {
      dispatch(ShowLoading());
      const response = await GetUserInfo();
      dispatch(HideLoading());
      if (response.success) {
        dispatch(SetUser(response.data));
      } else {
        message.error(response.message);
        navigate("/login");
      }
      dispatch(ReloadUser(false));
    } catch (error) {
      dispatch(HideLoading());
      navigate("/login");
      message.error(error.message);
    }
  };

  useEffect(() => {
    if (localStorage.getItem("token")) {
      if (!user) {
        getData();
      }
    } else {
      navigate("/login");
    }
  }, []);

  useEffect(()=>{
    
    if(reloadUser){
      getData();
    }

  },[reloadUser])
  return (
    user && (
      <div>
        <DefaultLayout>{props.children}</DefaultLayout>
      </div>
    )
  );
}

export default ProtectedRoute;
