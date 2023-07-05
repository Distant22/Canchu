
## 王行遠 — Week 0 Assignment 

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
