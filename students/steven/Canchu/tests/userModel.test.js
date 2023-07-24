const userModel = require('../models/userModel');
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const db = mysql.createPool({
	host: process.env.DB_HOST || 'localhost',
	user: process.env.DB_USERNAME,
	password: process.env.DB_PASSWORD,
	database: 'user'
});

// Mock the response object
const mockResponse = {
  status: jest.fn(() => mockResponse),
  json: jest.fn((data) => data),
};

// Test case for the search function
test('search function should return a list of users', async () => {
  const keyword = 'John';
  // Mock the database query results
  const mockResults = [
    { id: 1, name: 'John Doe', picture: '...', friend_id: 2, status: 'friend' },
    // Add more mock data as needed
  ];
  db.query = jest.fn(() => [mockResults]);

  const response = await userModel.search(mockResponse, keyword);

  expect(response.data.users).toHaveLength(mockResults.length);
  // Add more assertions as needed
});

// Test case for the signin function
test('signin function should return access token and user data', async () => {
  const email = 'john@example.com';
  const password = 'password123';
  const provider = 'native';
  // Mock the database query results
  const mockResults = [
    { id: 1, name: 'John Doe', email: 'john@example.com', password: 'hashed_password', /* add other user data */ },
  ];
  db.query = jest.fn(() => [mockResults]);

  const response = await userModel.signin(mockResponse, email, password, provider);

  expect(response.data).toHaveProperty('access_token');
  expect(response.data.user).toHaveProperty('id', 1);
  expect(response.data.user).toHaveProperty('name', 'John Doe');
  // Add more assertions as needed
});

// Add test cases for other functions in the userModel file
// ...

