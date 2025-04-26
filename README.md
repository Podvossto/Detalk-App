# DeTalk - แอปพลิเคชันแชทบนบล็อกเชน

![DeTalk Logo](/DeTalk-App\src\pictures\DeTalk-DarkLogo.png)

DeTalk เป็นแอปพลิเคชันแชทแบบกระจายศูนย์ (Decentralized Chat Application) ที่ทำงานบนบล็อกเชน Ethereum ด้วย Smart Contract และโทเคน $CHAT เพื่อการสื่อสารที่ปลอดภัย โปร่งใส และตรวจสอบได้

---

## ✨ สารบัญ

- [📄 ภาพรวมโปรเจค](#📄-ภาพรวมโปรเจค)
- [🛠️ เทคโนโลยีที่ใช้](#🛠️-เทคโนโลยที่ใช้)
- [⚙️ ทดลองใช้งาน](#⚙️-ทดลองใช้งาน)
- [🔹 ฟีเจอร์หลัก](#🔹-ฟีเจอร์หลัก)
- [🚀 Smart Contract](#🚀-smart-contract)

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

- ลงทะเบียนด้วย Wallet Address พร้อมรับโทเคนเริ่มต้น 100 $CHAT
- เพิ่มเพื่อน / เช็คสถานะเพื่อน
- แชทแบบส่วนตัว (0.01 $CHAT ต่อข้อความ)
- ส่ง/ขอโทเคนจากระบบ (จำกัด 10 $CHAT ต่อ 24 ชม.)
- ดูโปรไฟล์/ยอดคงเหลือ/ประวัติแชท
- Dark/Light Mode

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
