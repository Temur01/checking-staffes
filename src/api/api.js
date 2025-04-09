import axios from "axios";

export const URL = "https://nazorat.argos.uz/api/";

const instance = axios.create({
  baseURL: URL,
});

export const checkMacAddress = async (macAddress) => {
  try {
    const response = await instance.get(`check-mac?mac_address=${macAddress}`);
    console.log(response, 'response coming')
    return response.data.is_exists;
  } catch {
    return false; 
  }
};


export default instance;