import http from 'k6/http';
import { sleep, check } from 'k6';

export const options = {
  discardResponseBodies: true,
  scenarios: {
    contacts: {
      executor: 'constant-arrival-rate',
      rate: 40,
      timeUnit: '1s',
      duration: '20s',
      preAllocatedVUs: 50,
      maxVUs: 100,
    },
  },
};


export default function () {

  const accessToken = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwicHJvdmlkZXIiOiJuYXRpdmUiLCJuYW1lIjoiaGV5IiwiZW1haWwiOiJEYXZpZEBnbWFpbC5jb20iLCJwaWN0dXJlIjoiIiwiaW50cm9kdWN0aW9uIjoiIiwidGFncyI6IiIsImZyaWVuZF9jb3VudCI6MCwiaWF0IjoxNjkxNjU1MTcyLCJleHAiOjE2OTE2NTg3NzJ9._wNg5iVzxyWQCPmHle_BMj79uydvUnbpnuDWuLvzrfM`

  const params = {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  };

  const res = http.get('https://13.238.130.147/api/1.0/posts/search', params);
  console.log('Response:', res.status);
  check(res, { 'status was 200': (r) => r.status == 200 });
  sleep(1);
}

