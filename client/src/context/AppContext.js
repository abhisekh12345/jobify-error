import React, { useReducer } from 'react'
import { useEffect, useContext } from 'react'
import reducer from './reducer'
import {
  DISPLAY_ALERT,
  CLEAR_ALERT,
  SETUP_USER_BEGIN,
  SETUP_USER_SUCCESS,
  SETUP_USER_ERROR,
  TOGGLE_SIDEBAR,
  LOGOUT_USER,
  UPDATE_USER_BEGIN,
  UPDATE_USER_SUCCESS,
  UPDATE_USER_ERROR,
} from './action'

import axios from "axios"

const token = localStorage.getItem('token')
const user = localStorage.getItem('user')
const userlocation = localStorage.getItem('userlocation')

const initialState = {
  isLoading: false,
  showAlert: false,
  alertText: '',
  alertType: '',
  user: user ? JSON.parse(user) : null,
  token: token,
  userlocation: userlocation || '',
  joblocation: userlocation || "",
  showSidebar : false,
}








const AppContext = React.createContext()

const AppProvider = ({ children }) => {

  const [state, dispatch] = useReducer(reducer, initialState);

   //axios
  const authFetch = axios.create({
    baseURL: '/api/v1',
  });

  //  request interceptor
authFetch.interceptors.request.use(
  (config) => {
    config.headers['Authorization'] = `Bearer ${state.token}`;
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);



// response interceptor
authFetch.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.log(error.response);
    if (error.response.status === 401) {
      console.log('AUTH ERROR');
    }
    return Promise.reject(error);
  }
);








  const displayAlert = () => {
    dispatch({ type: DISPLAY_ALERT });
    clearAlert();
  }

  const clearAlert = () => {
    setTimeout(() => {
      dispatch({
        type: CLEAR_ALERT
      })
    }, 3000);
  }


  const addUserToLocalStorage = ({ user, token, location }) => {
    localStorage.setItem('user', JSON.stringify(user))
    localStorage.setItem('token', token)
    localStorage.setItem('location', location)
  
  }

  const removeUserFromLocalStorage = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('location')
  
  }

  const setupUser = async ({ currentUser, endPoint, alertText }) => {
    dispatch({ type: SETUP_USER_BEGIN });
    try {
      const { data } = await axios.post(
        `/api/v1/auth/${endPoint}`,
        currentUser
      );

      const { user, location } = data;
      dispatch({
        type: SETUP_USER_SUCCESS,
        payload: { user, location, alertText },
      });
      addUserToLocalStorage({user,token,location})
    } catch (error) {
      dispatch({
        type: SETUP_USER_ERROR,
        payload: { msg: error.response.data.msg },
      });
    }
    clearAlert();
  };
 
  const toogleSidebar =() =>{
    dispatch({type : TOGGLE_SIDEBAR})
  }

 
 const logoutUser = () =>{
  dispatch({type : LOGOUT_USER})
  removeUserFromLocalStorage()
 }

 const updateUser = async (currentUser) => {
  dispatch({ type: UPDATE_USER_BEGIN });
  try {
    const { data } = await authFetch.patch('/auth/updateUser', currentUser);
    const { user, location } = data;

    dispatch({
      type: UPDATE_USER_SUCCESS,
      payload: { user, location },
    });
  } catch (error) {
    if (error.response.status !== 401) {
      dispatch({
        type: UPDATE_USER_ERROR,
        payload: { msg: error.response.data.msg },
      });
    }
  }
  clearAlert();
};


  return (
    <AppContext.Provider value={{ ...state, displayAlert, setupUser, toogleSidebar, logoutUser, updateUser }}>{children}</AppContext.Provider>
  )
}

const useAppContext = () => {
  return useContext(AppContext)
}

export { initialState, AppProvider, useAppContext }