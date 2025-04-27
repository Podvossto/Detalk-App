# DeTalk - แอปพลิเคชันแชทบนบล็อกเชน (DEMO เพื่อการศึกษา)

## ✨ สารบัญ

- [📄 ภาพรวมโปรเจค](#📄-ภาพรวมโปรเจค)
- [🛠️ เทคโนโลยีที่ใช้](#🛠️-เทคโนโลยที่ใช้)
- [⚙️ ทดลองใช้งาน](#⚙️-ทดลองใช้งาน)
- [🔹 ฟีเจอร์หลัก](#🔹-ฟีเจอร์หลัก)
- [🚀 Smart Contract](#🚀-smart-contract)

---
## 📄 สมาชิก

<table align="center">
  <tr>
    <td align="center">
      <img src="src/pictures/PitchayaProfile.jpg" width="150" height="150" style="object-fit: cover; border-radius: 50%; overflow: hidden;"><br>
      <sub>65051645<br>พิชยะ หุตะจูฑะ</sub>
    </td>
    <td align="center">
      <img src="src/pictures/PitchayapaProfile.jpg" width="150" height="150" style="object-fit: cover; border-radius: 50%; overflow: hidden;"><br>
      <sub>65073814<br>พิชญาภา บุญถนอม</sub>
    </td>
    <td align="center">
      <img src="src/pictures/PiyakitProfile.jpg" width="150" height="150" style="object-fit: cover; border-radius: 50%; overflow: hidden;"><br>
      <sub>65054924<br>ปิยย์กฤษณ์ วงศ์เกษมศักดิ์</sub>
    </td>
  </tr>
</table>


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

### ChatContract Address : 0x47C4bdBb0977D926b956e0D6735FB3e6aA49d0e2

Link : [https://holesky.etherscan.io/address/0x47C4bdBb0977D926b956e0D6735FB3e6aA49d0e2](https://holesky.etherscan.io/address/0x47C4bdBb0977D926b956e0D6735FB3e6aA49d0e2)

จัดการผู้ใช้ เพื่อน แชท และค่าธรรมเนียม:

- registerUser, getUserByAddress, getAllUsers
- addFriend, getFriends, checkFriendship
- sendMessage, getMessages
- sendTokensToFriend, withdrawTokens

### TokenContract : 0x2C6c792ED415d7360e783761a425FACaa2B4343C

Link : [https://holesky.etherscan.io/address/0x204dD20D690cfa5B12c063Df5a10B4Aa7f49090A](https://holesky.etherscan.io/address/0x2C6c792ED415d7360e783761a425FACaa2B4343C#code)

จัดการโทเคน $CHAT:

- transfer, approve, allowance
- mint, requestTokens
- getCooldownRemaining
