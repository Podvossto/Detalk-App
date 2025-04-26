# DeTalk - แอปพลิเคชันแชทบนบล็อกเชน

## ✨ สารบัญ

- [📄 ภาพรวมโปรเจค](#📄-ภาพรวมโปรเจค)
- [🛠️ เทคโนโลยีที่ใช้](#🛠️-เทคโนโลยที่ใช้)
- [⚙️ ทดลองใช้งาน](#⚙️-ทดลองใช้งาน)
- [🔹 ฟีเจอร์หลัก](#🔹-ฟีเจอร์หลัก)
- [🚀 Smart Contract](#🚀-smart-contract)

---
## 📄 สมาชิก

<div style="background-color: #0D0D2B; padding: 40px; display: flex; justify-content: center; gap: 60px; flex-wrap: wrap;">
  <div style="text-align: center;">
    <img src="src/pictures/PitchayaProfile.jpg" style="width: 150px; height: 150px; object-fit: cover; border-radius: 50%; background-color: white;">
    <p style="color: white; margin-top: 15px; font-size: 18px;">65051645<br>พิชยะ หุตะจูฑะ</p>
  </div>
  
  <div style="text-align: center;">
    <img src="src/pictures/PitchayapaProfile.jpg" style="width: 150px; height: 150px; object-fit: cover; border-radius: 50%; background-color: white;">
    <p style="color: white; margin-top: 15px; font-size: 18px;">65073814<br>พิชญาภา บุญถนอม</p>
  </div>

  <div style="text-align: center;">
    <img src="src/pictures/Piyakit.jpg" style="width: 150px; height: 150px; object-fit: cover; border-radius: 50%; background-color: white;">
    <p style="color: white; margin-top: 15px; font-size: 18px;">65054924<br>ปิยย์กฤษณ์ วงศ์เกษมศักดิ์</p>
  </div>
</div>



---
## 📄 ภาพรวมโปรเจค

DeTalk คือแพลตฟอร์มแชทบนบล็อกเชนที่ให้ผู้ใช้สามารถลงทะเบียน เพิ่มเพื่อน แชท ส่งโทเคน และดูประวัติการทำธุรกรรมได้ โดยมีโทเคน $CHAT เป็นสื่อกลางในการใช้งานระบบ ซึ่งทุกข้อความจะถูกจัดเก็บอย่างถาวรและปลอดภัยผ่าน Smart Contract

## 🛠️ เทคโนโลยีที่ใช้

### Frontend:

- Vite + React + TypeScript
- Tailwind CSS + shadcn/ui
- TanStack Query

### Blockchain:

- Solidity
- Remix IDE
- Web3.js

## ⚙️ ทดลองใช้งาน

https://Podvossto.github.io/Detalk-App

> ⚡ ต้องติดตั้ง MetaMask และเชื่อมต่อเครือข่าย Holesky Testnet

## 🔹 ฟีเจอร์หลัก

### • ลงทะเบียนด้วย Wallet Address พร้อมรับโทเคนเริ่มต้น 100 $CHAT  
![CreateProfile](src/pictures/Screenshot/CreateProfile.png)
<p>ตั้งชื่อและยืนยัน เมื่อ Transaction Success จะเข้าสู่ระบบอัตโนมัต</p>

---

### • เพิ่มเพื่อน  
<p align="center">
  <img src="src/pictures/Screenshot/AllUser.png" width="400px" />
</p>
<p>เห็น User ทุกคนที่อยู่ในระบบและสามารถแอดได้</p>

---

### • แชทแบบส่วนตัว (0.01 $CHAT ต่อข้อความ)  
![SentMessage](src/pictures/Screenshot/SentMessage.png)
<p>สามารถส่งข้อความหาคนที่เป็นเพื่อนเท่านั้น</p>

![SendToken](src/pictures/Screenshot/SendToken.png)
<p>สามารถส่ง TOKEN CHAT ให้เพื่อนได้</p>

---

### • ขอโทเคนจากระบบ (จำกัด 10 $CHAT ต่อ 24 ชม.)  
![GetToken](src/pictures/Screenshot/GetToken.png)
<p>กดรับ 10 CHAT TOKEN ทุกๆ 1 วัน</p>

---

### • ดูโปรไฟล์ / ยอด TOKEN คงเหลือ / ประวัติธุรกรรมต่างๆ  
![Profile](src/pictures/Screenshot/Profile.png)

---

### • ธีม Dark / Light Mode  
![Setting](src/pictures/Screenshot/Setting.png)

---

## 🚀 Smart Contract

### ChatContract Address : 0xB2Af43467E4486788b81f3a373d9F8Af8e792920

Link : https://holesky.etherscan.io/address/0xB2Af43467E4486788b81f3a373d9F8Af8e792920#readContract

จัดการผู้ใช้ เพื่อน แชท และค่าธรรมเนียม:

- registerUser, getUserByAddress, getAllUsers
- addFriend, getFriends, checkFriendship
- sendMessage, getMessages
- sendTokensToFriend, withdrawTokens

### TokenContract : 0x204dD20D690cfa5B12c063Df5a10B4Aa7f49090A

Link : https://holesky.etherscan.io/address/0x204dD20D690cfa5B12c063Df5a10B4Aa7f49090A

จัดการโทเคน $CHAT:

- transfer, approve, allowance
- mint, requestTokens
- getCooldownRemaining
