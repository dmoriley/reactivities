import { IActivity } from './../models/activity';
import axios, { AxiosResponse } from 'axios';

axios.defaults.baseURL = 'http://localhost:5000/api';

const responseBody = (response: AxiosResponse) => response.data;

// use currying to transform a function with multiple arguments into a sequence of nesting functions
// to add artificial delay to the app
const sleep = (ms: number) => (response: AxiosResponse) => 
  new Promise<AxiosResponse>(resolve => setTimeout(() => resolve(response), ms));

const sleepTime = 1000; // number of ms to wait

const requests = {
  get: (url: string) => axios.get(url).then(sleep(sleepTime)).then(responseBody),
  post: (url: string, body: {}) => axios.post(url, body).then(sleep(sleepTime)).then(responseBody),
  put: (url: string, body: {}) => axios.put(url, body).then(sleep(sleepTime)).then(responseBody),
  delete: (url: string) => axios.delete(url).then(sleep(sleepTime)).then(responseBody)
};

const Activities = {
  list: (): Promise<IActivity[]> => requests.get('/activities'),
  details: (id: string) => requests.get(`/activities/${id}`),
  create: (activity: IActivity) => requests.post('/activities', activity),
  update: (activity: IActivity) => requests.put(`/activities/${activity.id}`, activity),
  delete: (id: string) => requests.delete(`/activities/${id}`)
};

export default Object.freeze({
  Activities
});