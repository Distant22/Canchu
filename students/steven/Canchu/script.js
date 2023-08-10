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

  const accessToken = __ENV.TOKEN
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

