const { axiosInstance } = require(".");

// login user

export const LoginUser = async (payload) => {
  try {
    const { data } = await axiosInstance.post("/api/users/login", payload);
    return data;
  } catch (error) {
    return error.response.data;
  }
};

// register user

export const RegisterUser = async (payload) => {
  try {
    const { data } = await axiosInstance.post("/api/users/register", payload);
    return data;
  } catch (error) {
    return error.response.data;
  }
};


// get user info

export const GetUserInfo = async () => {
  try {
    const { data } = await axiosInstance.post("/api/users/get-user-info");
    return data;
  } catch (error) {
    return error.response.data;
  }
}

// get all users

export const GetAllUsers = async () => {
  try {
    const { data } = await axiosInstance.get("/api/users/get-all-users");
    return data;
  } catch (error) {
    return error.response.data;
  }
}

// Update user verified status

export const UpdateUserVerifiedStatus = async (payload) => {
  try {
    const { data } = await axiosInstance.post(
      "/api/users/update-user-verified-status",
      payload
    );
    return data;
  } catch (error) {
    return error.response.data;
  }
}