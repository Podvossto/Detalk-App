const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time, loadFixture } = require("@nomicfoundation/hardhat-toolbox/network-helpers");

const parse = ethers.parseEther;
const DAY = 24 * 60 * 60;

describe("TokenContract", () => {
  async function deploy() {
    const [owner, alice, bob, minter] = await ethers.getSigners();
    const token = await ethers.deployContract("TokenContract");
    return { token, owner, alice, bob, minter };
  }

  describe("faucet", () => {
    it("mints 10 tokens on the first request", async () => {
      const { token, alice } = await loadFixture(deploy);
      await token.connect(alice).requestTokens();
      expect(await token.balanceOf(alice.address)).to.equal(parse("10"));
      expect(await token.totalSupply()).to.equal(parse("10"));
    });

    it("blocks a second request inside the cooldown", async () => {
      const { token, alice } = await loadFixture(deploy);
      await token.connect(alice).requestTokens();
      await expect(token.connect(alice).requestTokens()).to.be.revertedWith(
        "Cooldown period not over yet"
      );
    });

    it("allows another request once 24 hours have passed", async () => {
      const { token, alice } = await loadFixture(deploy);
      await token.connect(alice).requestTokens();
      await time.increase(DAY);
      await token.connect(alice).requestTokens();
      expect(await token.balanceOf(alice.address)).to.equal(parse("20"));
    });

    it("reports the remaining cooldown", async () => {
      const { token, alice } = await loadFixture(deploy);
      expect(await token.connect(alice).getCooldownRemaining()).to.equal(0);
      await token.connect(alice).requestTokens();
      const left = await token.connect(alice).getCooldownRemaining();
      expect(left).to.be.gt(DAY - 60).and.lte(DAY);
    });

    it("tracks cooldown per address", async () => {
      const { token, alice, bob } = await loadFixture(deploy);
      await token.connect(alice).requestTokens();
      await expect(token.connect(bob).requestTokens()).not.to.be.reverted;
    });
  });

  describe("minter restriction", () => {
    it("rejects requestTokens(address,uint256) from arbitrary callers", async () => {
      const { token, alice } = await loadFixture(deploy);
      await expect(
        token.connect(alice)["requestTokens(address,uint256)"](alice.address, parse("1000"))
      ).to.be.revertedWith("Only minter can call this function");
      expect(await token.totalSupply()).to.equal(0);
    });

    it("rejects the owner too until a minter is set", async () => {
      const { token, owner, alice } = await loadFixture(deploy);
      await expect(
        token["requestTokens(address,uint256)"](alice.address, 1)
      ).to.be.revertedWith("Only minter can call this function");
    });

    it("lets the owner set a minter who can then mint", async () => {
      const { token, minter, alice } = await loadFixture(deploy);
      await expect(token.setMinter(minter.address))
        .to.emit(token, "MinterUpdated")
        .withArgs(ethers.ZeroAddress, minter.address);
      await token.connect(minter)["requestTokens(address,uint256)"](alice.address, parse("5"));
      expect(await token.balanceOf(alice.address)).to.equal(parse("5"));
    });

    it("does not let non-owners set the minter", async () => {
      const { token, alice } = await loadFixture(deploy);
      await expect(token.connect(alice).setMinter(alice.address)).to.be.revertedWith(
        "Only owner can call this function"
      );
    });

    it("restricts mint() to the owner", async () => {
      const { token, owner, alice } = await loadFixture(deploy);
      await expect(token.connect(alice).mint(alice.address, 1)).to.be.revertedWith(
        "Only owner can call this function"
      );
      await token.mint(alice.address, 1);
      expect(await token.balanceOf(alice.address)).to.equal(1);
    });
  });

  describe("ownership", () => {
    it("lets the owner transfer ownership", async () => {
      const { token, owner, alice } = await loadFixture(deploy);
      await expect(token.transferOwnership(alice.address))
        .to.emit(token, "OwnershipTransferred")
        .withArgs(owner.address, alice.address);
      expect(await token.owner()).to.equal(alice.address);
    });

    it("rejects transferOwnership from non-owners", async () => {
      const { token, alice } = await loadFixture(deploy);
      await expect(token.connect(alice).transferOwnership(alice.address)).to.be.revertedWith(
        "Only owner can call this function"
      );
    });

    it("rejects the zero address", async () => {
      const { token } = await loadFixture(deploy);
      await expect(token.transferOwnership(ethers.ZeroAddress)).to.be.revertedWith(
        "New owner cannot be the zero address"
      );
    });
  });

  describe("ERC-20 basics", () => {
    it("transfers and uses allowances", async () => {
      const { token, alice, bob, minter } = await loadFixture(deploy);
      await token.mint(alice.address, parse("10"));
      await token.connect(alice).transfer(bob.address, parse("3"));
      expect(await token.balanceOf(bob.address)).to.equal(parse("3"));

      await expect(
        token.connect(minter).transferFrom(alice.address, minter.address, 1)
      ).to.be.revertedWith("Insufficient allowance");
      await token.connect(alice).approve(minter.address, parse("2"));
      await token.connect(minter).transferFrom(alice.address, minter.address, parse("2"));
      expect(await token.allowance(alice.address, minter.address)).to.equal(0);
      expect(await token.balanceOf(alice.address)).to.equal(parse("5"));
    });
  });
});
