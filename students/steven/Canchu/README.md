## Dt22 — Assignment 


#### Run the application
  ```
  sudo /home/ubuntu/.nvm/versions/node/v18.16.1/bin/node server.js &
  ```
  `&` is for server to continue running in background.

### Summary of each part
<details>
  <summary>Week 0</summary>
  
  

  #### **Updated 23/07/05** 
  Website: [http://13.54.210.189/](http://13.54.210.189/)



  ===========================================================
  
  ### **昨天卡關：ERR_CONNECTION_REFUSED**
  
  **已測試內容：**
  * Security Group 加上 HTTP 的 80 Port 以及 SSH 的 22 Port
  * Network ACL 的 Inbound rule 設定無誤
  * Subnet , Route tables 為正確的 VPC ID
  * 關閉iptables的原設定，並允許22 port通行
  * 重開新的 instances 

  上述內容已全數確認，然而並未解決問題
  
  #### **解法：網址要用HTTP而不是HTTPS...**
  
  **參考資源：**
  https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/TroubleshootingInstancesConnecting.html#TroubleshootingInstancesConnectionTimeout
  https://medium.com/cs-note/setup-node-and-express-on-aws-ec2-windows-7-8cb499ab14eb
  
  ===========================================================
  
  ### **Start server:**
  #### 1. Create a new folder inside EC2
  ` mkdir server `
  #### 2. Initialize Express.js project
  ```
  cd server
  npm init
  npm install express
  ```
  #### 3. Setup configuration 
  ```
  const express = require('express')
  const app = express()
  const port = 80
  
  app.get('/', (req, res) => {
    res.send('Hello, My Server!')
  })
  
  app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
  })
  console.log('Listening on port',port) 
  ```
  #### 4. Run the application
  ` sudo /home/ubuntu/.nvm/versions/node/v18.16.1/bin/node server.js ` 
  
  #### 5. Run web server in the background
  I use nohup for solution.
  ```
  sudo nohup /home/ubuntu/.nvm/versions/node/v18.16.1/bin/node server.js
  ```
</details>

<details>
  <summary>Week 1 Part 1</summary>
  
  #### Create signup API 
  * Email Validaion：REGEX
  * Access Token：JWT

  #### Website
  http://13.54.210.189/api/1.0/users/signup

</details>

<details>
  <summary>Week 1 Part 2</summary>
  
  #### Create signin API 
  * Access Token：JWT
  * Password Salting：bcrypt

  #### Website
  http://13.54.210.189/api/1.0/users/signin

</details>

<details>
  <summary>Week 1 Part 3</summary>
  
  #### Create Profile API

  #### Website
  http://13.54.210.189/api/1.0/users/profile

</details>

<details>
  <summary>Week 2 Part 1</summary>
  
  #### Create Friends API

  #### Website
  http://13.54.210.189/api/1.0/friends/pending

</details>

<details>
  <summary>Week 2 Part 2</summary>

</details>

<details>
	<summary>
	Week 2 Part 3
	</summary>
</details>
