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

  const accessToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NDA4LCJwcm92aWRlciI6Im5hdGl2ZSIsIm5hbWUiOiJEYXZpZCIsImVtYWlsIjoiRGF2aWRAZ21haWwuY29tIiwicGljdHVyZSI6Imh0dHBzOi8vMTMuNTQuMjEwLjE4OS9zdGF0aWMvcGljdHVyZS0xNjg5ODMwMDYzMTM4IiwiaW50cm9kdWN0aW9uIjoi6JeN6Imy5bCP6bOlIiwidGFncyI6IiIsImZyaWVuZF9jb3VudCI6MiwiaWF0IjoxNjkxNTY3NjcxLCJleHAiOjE2OTE1NzEyNzF9.yXzeTvCRTZYU3FeFKrcEmMOiLD6yVa0X00GtcDtj-uU"

  const params = {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  };

  const res = http.get('https://13.238.130.147/api/1.0/posts/search', params);
  console.log('Response:', res, res.status);
  check(res, { 'status was 200': (r) => r.status == 200 });
  sleep(1);
}

