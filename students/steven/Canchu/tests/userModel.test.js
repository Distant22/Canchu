const userModel = require('../models/userModel');


test('signin function should return access token and user data', async () => {
  const email = 'Steven@gmail.com';
  const password = '123';
  const provider = 'native';

  const response = await userModel.signin(res, email, password, provider);
  expect(response.data).toHaveProperty('access_token');
  expect(response.data.user).toHaveProperty('name','Steven');
})



// Mock the response object
// const mockResponse = {
//   status: jest.fn(() => mockResponse),
//   json: jest.fn((data) => data),
// };



// // Test case for the signin function
// test('signin function should return access token and user data', async () => {
//   const email = 'john@example.com';
//   const password = 'password123';
//   const provider = 'native';
//   // // Mock the database query results
//   // const mockResults = [
//   //   { id: 1, name: 'John Doe', email: 'john@example.com', password: 'hashed_password', /* add other user data */ },
//   // ];
//   // // Create a mock function for db.query
//   // global.db.query.mockResolvedValueOnce([mockResults]);

//   const response = await userModel.signin(mockResponse, email, password, provider);

//   expect(response.data).toHaveProperty('access_token');
//   expect(response.data.user).toHaveProperty('id', 1);
//   expect(response.data.user).toHaveProperty('name', 'John Doe');
//   // Add more assertions as needed
// });

// Add test cases for other functions in the userModel file
// ...
