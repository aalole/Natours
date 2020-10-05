import axios from 'axios';
import { showAlert } from './alert';

// type can either be 'password' or 'data'
export const updateSettings = async (data, type) => {
  try {
    const url =
      type === 'password'
        ? '/api/v1/users/updateMyPassword'
        : '/api/v1/users/updateMe';
    const result = await axios({
      method: 'PATCH',
      url,
      data,
    });
    if (result.data.status === 'success') {
      showAlert('success', `${type.toUpperCase()} updated successfully`);
      //     window.setTimeout(() => {
      //       location.assign('/');
      //     }, 1500);
    }
  } catch (error) {
    showAlert('error', err.response.data.message);
  }
};
