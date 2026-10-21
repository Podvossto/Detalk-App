const { expect } = require("chai");
const { ethers } = require("hardhat");
const { loadFixture } = require("@nomicfoundation/hardhat-toolbox/network-helpers");

const parse = ethers.parseEther;
const FEE = parse("0.01");

describe("ChatContract", () => {
  async function deploy() {
    const [owner, alice, bob, carol] = await ethers.getSigners();
    const token = await ethers.deployContract("TokenContract");
    const chat = await ethers.deployContract("ChatContract", [await token.getAddress()]);
    await token.setMinter(await chat.getAddress());
    return { token, chat, owner, alice, bob, carol };
  }

  async function withUsers() {
    const ctx = await deploy();
    await ctx.chat.connect(ctx.alice).registerUser("alice");
    await ctx.chat.connect(ctx.bob).registerUser("bob");
    return ctx;
  }

  describe("registration", () => {
    it("registers a user and mints the 100 token bonus", async () => {
      const { chat, token, alice } = await loadFixture(deploy);
      await expect(chat.connect(alice).registerUser("alice"))
        .to.emit(chat, "UserRegistered")
        .withArgs(alice.address, "alice");
      expect(await chat.isRegistered(alice.address)).to.equal(true);
      expect(await token.balanceOf(alice.address)).to.equal(parse("100"));
      const user = await chat.getUserByAddress(alice.address);
      expect(user.name).to.equal("alice");
    });

    it("rejects double registration and empty names", async () => {
      const { chat, alice } = await loadFixture(deploy);
      await expect(chat.connect(alice).registerUser("")).to.be.revertedWith("Name cannot be empty");
      await chat.connect(alice).registerUser("alice");
      await expect(chat.connect(alice).registerUser("again")).to.be.revertedWith(
        "User already registered"
      );
    });

    it("lists all users", async () => {
      const { chat } = await loadFixture(withUsers);
      const users = await chat.getAllUsers();
      expect(users.map((u) => u.name)).to.deep.equal(["alice", "bob"]);
    });
  });

  describe("friends", () => {
    it("adds a friend", async () => {
      const { chat, alice, bob } = await loadFixture(withUsers);
      await expect(chat.connect(alice).addFriend(bob.address))
        .to.emit(chat, "FriendAdded")
        .withArgs(alice.address, bob.address);
      expect(await chat.checkFriendship(alice.address, bob.address)).to.equal(true);
      expect(await chat.checkFriendship(bob.address, alice.address)).to.equal(false);
      const friends = await chat.connect(alice).getFriends();
      expect(friends.map((f) => f.name)).to.deep.equal(["bob"]);
    });

    it("rejects invalid friend requests", async () => {
      const { chat, alice, bob, carol } = await loadFixture(withUsers);
      await expect(chat.connect(alice).addFriend(alice.address)).to.be.revertedWith(
        "Cannot add yourself as a friend"
      );
      await expect(chat.connect(alice).addFriend(carol.address)).to.be.revertedWith(
        "Friend not registered"
      );
      await expect(chat.connect(carol).addFriend(alice.address)).to.be.revertedWith(
        "User not registered"
      );
      await chat.connect(alice).addFriend(bob.address);
      await expect(chat.connect(alice).addFriend(bob.address)).to.be.revertedWith("Already friends");
    });
  });

  describe("messages", () => {
    it("charges 0.01 CHAT and stores the message for both sides", async () => {
      const { chat, token, alice, bob } = await loadFixture(withUsers);
      const chatAddr = await chat.getAddress();
      await token.connect(alice).approve(chatAddr, FEE);

      await expect(chat.connect(alice).sendMessage(bob.address, "hello")).to.emit(chat, "MessageSent");

      expect(await token.balanceOf(alice.address)).to.equal(parse("100") - FEE);
      expect(await token.balanceOf(chatAddr)).to.equal(FEE);

      const fromAlice = await chat.connect(alice).getMessages(bob.address);
      const fromBob = await chat.connect(bob).getMessages(alice.address);
      expect(fromAlice).to.have.length(1);
      expect(fromBob[0].content).to.equal("hello");
      expect(fromBob[0].sender).to.equal(alice.address);
    });

    it("reverts without allowance and stores nothing", async () => {
      const { chat, alice, bob } = await loadFixture(withUsers);
      await expect(chat.connect(alice).sendMessage(bob.address, "hello")).to.be.revertedWith(
        "Insufficient allowance"
      );
      expect(await chat.connect(alice).getMessages(bob.address)).to.have.length(0);
    });

    it("reverts when the sender cannot pay the fee", async () => {
      const { chat, token, alice, bob } = await loadFixture(withUsers);
      const chatAddr = await chat.getAddress();
      await token.connect(alice).transfer(bob.address, parse("100"));
      await token.connect(alice).approve(chatAddr, FEE);
      await expect(chat.connect(alice).sendMessage(bob.address, "hello")).to.be.revertedWith(
        "Insufficient balance"
      );
    });

    it("rejects unregistered parties and empty content", async () => {
      const { chat, token, alice, bob, carol } = await loadFixture(withUsers);
      await token.connect(alice).approve(await chat.getAddress(), FEE);
      await expect(chat.connect(alice).sendMessage(carol.address, "hi")).to.be.revertedWith(
        "Receiver not registered"
      );
      await expect(chat.connect(carol).sendMessage(alice.address, "hi")).to.be.revertedWith(
        "Sender not registered"
      );
      await expect(chat.connect(alice).sendMessage(bob.address, "")).to.be.revertedWith(
        "Message cannot be empty"
      );
    });
  });

  describe("sending tokens", () => {
    it("sends tokens to a friend and records a system message", async () => {
      const { chat, token, alice, bob } = await loadFixture(withUsers);
      await chat.connect(alice).addFriend(bob.address);
      await token.connect(alice).approve(await chat.getAddress(), parse("2.5"));

      await expect(chat.connect(alice).sendTokensToFriend(bob.address, parse("2.5")))
        .to.emit(chat, "TokensSent")
        .withArgs(alice.address, bob.address, parse("2.5"));

      expect(await token.balanceOf(bob.address)).to.equal(parse("102.5"));
      const msgs = await chat.connect(bob).getMessages(alice.address);
      expect(msgs[0].content).to.equal("SYSTEM: alice sent 2.5 CHAT tokens");
    });

    it("requires friendship and a positive amount", async () => {
      const { chat, token, alice, bob } = await loadFixture(withUsers);
      await token.connect(alice).approve(await chat.getAddress(), parse("1"));
      await expect(chat.connect(alice).sendTokensToFriend(bob.address, parse("1"))).to.be.revertedWith(
        "You can only send tokens to friends"
      );
      await chat.connect(alice).addFriend(bob.address);
      await expect(chat.connect(alice).sendTokensToFriend(bob.address, 0)).to.be.revertedWith(
        "Amount must be greater than 0"
      );
    });
  });

  describe("fee withdrawal", () => {
    it("lets only the owner withdraw collected fees", async () => {
      const { chat, token, owner, alice, bob } = await loadFixture(withUsers);
      await token.connect(alice).approve(await chat.getAddress(), FEE);
      await chat.connect(alice).sendMessage(bob.address, "hello");

      await expect(chat.connect(alice).withdrawTokens(alice.address, FEE)).to.be.revertedWith(
        "Only owner can call this function"
      );
      await expect(chat.withdrawTokens(owner.address, FEE + 1n)).to.be.revertedWith(
        "Insufficient contract balance"
      );
      await chat.withdrawTokens(owner.address, FEE);
      expect(await token.balanceOf(owner.address)).to.equal(FEE);
    });
  });

  describe("ownership", () => {
    it("lets the owner transfer ownership", async () => {
      const { chat, owner, alice } = await loadFixture(deploy);
      await expect(chat.transferOwnership(alice.address))
        .to.emit(chat, "OwnershipTransferred")
        .withArgs(owner.address, alice.address);
      expect(await chat.owner()).to.equal(alice.address);
    });

    it("rejects transferOwnership from non-owners and to the zero address", async () => {
      const { chat, alice } = await loadFixture(deploy);
      await expect(chat.connect(alice).transferOwnership(alice.address)).to.be.revertedWith(
        "Only owner can call this function"
      );
      await expect(chat.transferOwnership(ethers.ZeroAddress)).to.be.revertedWith(
        "New owner cannot be the zero address"
      );
    });
  });
});
