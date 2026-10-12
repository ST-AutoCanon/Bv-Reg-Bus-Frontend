import axios from 'axios';
axios.defaults.baseURL = process.env.REACT_APP_BASE_URL // the prefix of the URL
axios.defaults.headers.get['Accept'] = 'application/json'   // default header for all get request
axios.defaults.headers.post['Accept'] = 'application/json'  // default header for all POST request


export function Get(url: any, header: any){
   return axios.get(url, header)
}
export function Post(url: any, dataset: any, header: any, ...extra: any[]){
   return axios.post(url, dataset, header,...(extra as []))
}
export function PATCH(url: any, dataset: any, header: any, ...extra: any[]){
   return axios.patch(url, dataset, header,...(extra as []))
}
