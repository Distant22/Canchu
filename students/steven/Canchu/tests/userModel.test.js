// const userModel = require('../models/userModel');

// const mockResponse = {
//   status: jest.fn().mockReturnThis(),
//   json: jest.fn(),
// };

// test('signin function should return access token and user data', async () => {
//   const email = 'Steven@gmail.com';
//   const password = '123';
//   const provider = 'native';

//   await userModel.signin(mockResponse, email, password, provider);
//   expect(mockResponse.data).toHaveProperty('access_token');
//   expect(mockResponse.data.user).toHaveProperty('name','Steven');
// })


// userModel.test.js

const userModel = require('../models/userModel');

// Mock mysql2 module
jest.mock('mysql2/promise', () => ({
  createPool: jest.fn(() => ({
    query: jest.fn(),
  })),
}));

// Mock bcrypt module
jest.mock('bcrypt', () => ({
  compare: jest.fn(),
}));

// Mock the util module
jest.mock('../utils/util', () => ({
  generateToken: jest.fn(() => 'mocked_access_token'),
}));

// Mock the redis module
jest.mock('../utils/redis', () => ({}));

const mockResponse = {
  status: jest.fn().mockReturnThis(),
  json: jest.fn(),
};

describe('userModel', () => {
  beforeEach(() => {
    // Clear the mock implementation for each test
    jest.clearAllMocks();
  });

  test('signin function should return access token and user data', async () => {
    // Mock the query result from the database
    const mockedDbResult = [
      {
        id: 1,
        name: 'Steven',
        email: 'Steven@gmail.com',
        password: '$2b$10$mockedhashedpassword',
        picture: 'profile.jpg',
        introduction: 'Hello, I am Steven.',
        tags: 'programming,reading',
        friend_count: 10,
      },
    ];
    const mockedQuery = jest.fn(() => [mockedDbResult]);
    const mockedDbConnection = {
      query: mockedQuery,
    };
    // Mock the database query to return the expected result
    require('mysql2/promise').createPool.mockReturnValueOnce(mockedDbConnection);

    // Mock bcrypt.compare to return true (passwords match)
    require('bcrypt').compare.mockResolvedValueOnce(true);

    // Test data
    const email = 'Steven@gmail.com';
    const password = '123';
    const provider = 'native';

    // Call the signin function
    await userModel.signin(mockResponse, email, password, provider);

    // Assertions
    expect(mockResponse).toEqual({
      data: {
        access_token: 'mocked_access_token',
        user: {
          id: 1,
          provider: 'native',
          name: 'Steven',
          email: 'Steven@gmail.com',
          picture: 'profile.jpg',
        },
      },
    });

    // Ensure that util.generateToken is called with the expected user object
    expect(require('../utils/util').generateToken).toHaveBeenCalledWith({
      id: 1,
      provider: 'native',
      name: 'Steven',
      email: 'Steven@gmail.com',
      picture: 'profile.jpg',
      introduction: 'Hello, I am Steven.',
      tags: 'programming,reading',
      friend_count: 10,
    });
  });
});

