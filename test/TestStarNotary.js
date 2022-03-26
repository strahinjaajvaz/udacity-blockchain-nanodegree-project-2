const StarNotary = artifacts.require("StarNotary");

var accounts;
var owner;

contract("StarNotary", (accs) => {
  accounts = accs;
  owner = accounts[0];
});

it("can Create a Star", async () => {
  let tokenId = 1;
  let instance = await StarNotary.deployed();
  await instance.createStar("Awesome Star!", tokenId, { from: accounts[0] });
  assert.equal(await instance.tokenIdToStarInfo.call(tokenId), "Awesome Star!");
});

it("lets user1 put up their star for sale", async () => {
  let instance = await StarNotary.deployed();
  let [_, user1] = accounts;
  let starId = 2;
  let starPrice = web3.utils.toWei(".01", "ether");
  await instance.createStar("awesome star", starId, { from: user1 });
  await instance.putStarUpForSale(starId, starPrice, { from: user1 });
  assert.equal(await instance.starsForSale.call(starId), starPrice);
});

it("lets user1 get the funds after the sale", async () => {
  let instance = await StarNotary.deployed();
  let [_, user1, user2] = accounts;
  let starId = 3;
  let starPrice = web3.utils.toWei(".01", "ether");
  let balance = web3.utils.toWei(".05", "ether");
  await instance.createStar("awesome star", starId, { from: user1 });
  await instance.putStarUpForSale(starId, starPrice, { from: user1 });
  let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user1);
  await instance.buyStar(starId, { from: user2, value: balance });
  let balanceOfUser1AfterTransaction = await web3.eth.getBalance(user1);
  let value1 = Number(balanceOfUser1BeforeTransaction) + Number(starPrice);
  let value2 = Number(balanceOfUser1AfterTransaction);
  assert.equal(value1, value2);
});

it("lets user2 buy a star, if it is put up for sale", async () => {
  let instance = await StarNotary.deployed();
  let [_, user1, user2] = accounts;
  let starId = 4;
  let starPrice = web3.utils.toWei(".01", "ether");
  let balance = web3.utils.toWei(".05", "ether");
  await instance.createStar("awesome star", starId, { from: user1 });
  await instance.putStarUpForSale(starId, starPrice, { from: user1 });
  await instance.buyStar(starId, { from: user2, value: balance });
  assert.equal(await instance.ownerOf.call(starId), user2);
});

// test updated from
// https://github.com/udacity/nd1309-p2-Decentralized-Star-Notary-Service-Starter-Code/pull/16/files
it("lets user2 buy a star and decreases its balance in ether", async () => {
  let instance = await StarNotary.deployed();
  let [_, user1, user2] = accounts;
  let STAR_ID = 5;
  let starPrice = web3.utils.toWei(".01", "ether");
  let balance = web3.utils.toWei(".05", "ether");
  await instance.createStar("awesome star", STAR_ID, { from: user1 });
  await instance.putStarUpForSale(STAR_ID, starPrice, { from: user1 });
  const balanceOfUser2BeforeTransaction = web3.utils.toBN(
    await web3.eth.getBalance(user2)
  );
  const txInfo = await instance.buyStar(STAR_ID, {
    from: user2,
    value: balance,
  });
  const balanceAfterUser2BuysStar = web3.utils.toBN(
    await web3.eth.getBalance(user2)
  );
  const tx = await web3.eth.getTransaction(txInfo.tx);
  const gasPrice = web3.utils.toBN(tx.gasPrice);
  const gasUsed = web3.utils.toBN(txInfo.receipt.gasUsed);
  const txGasCost = gasPrice.mul(gasUsed);
  const starPriceBN = web3.utils.toBN(starPrice); // from string
  const expectedFinalBalance = balanceOfUser2BeforeTransaction
    .sub(starPriceBN)
    .sub(txGasCost);
  assert.equal(
    expectedFinalBalance.toString(),
    balanceAfterUser2BuysStar.toString()
  );
});

// Implement Task 2 Add supporting unit tests
it("can add the star name and star symbol properly", async () => {
  const STAR_NAME = "Star Notary Token";
  const STAR_SYMBOl = "SNT";

  const instance = await StarNotary.deployed();

  // check the star name and symbol
  const name = await instance.name.call();
  const symbol = await instance.symbol.call();

  // checking to see if the values are the same
  assert.equal(STAR_NAME, name);
  assert.equal(STAR_SYMBOl, symbol);
});

it("lets 2 users exchange stars", async () => {
  // creating variables for the stars
  const instance = await StarNotary.deployed();
  const [_, user1, user2] = accounts;

  const STAR_ID_1 = 6;
  const STAR_ID_2 = 7;

  await instance.createStar("Test Star 1", STAR_ID_1, { from: user1 });
  await instance.createStar("Test Star 2", STAR_ID_2, { from: user2 });

  // exchanging the starts
  await instance.exchangeStars(STAR_ID_1, STAR_ID_2, { from: user1 });

  // checking the values are correct
  assert.equal(await instance.ownerOf.call(STAR_ID_1), user2);
  assert.equal(await instance.ownerOf.call(STAR_ID_2), user1);
});

it("lets a user transfer a star", async () => {
  const instance = await StarNotary.deployed();

  const STAR_NAME = "TEST_TRANSFER";
  const STAR_ID = 8;

  let [_, user1, user2] = accounts;
  await instance.createStar(STAR_NAME, STAR_ID, { from: user1 });

  await instance.transferStar(user2, STAR_ID, { from: user1 });

  assert.equal(await instance.ownerOf.call(STAR_ID), user2);
});

it("lookUptokenIdToStarInfo test", async () => {
  const instance = await StarNotary.deployed();

  const STAR_NAME = "TEST";
  const STAR_ID = 9;

  let [_, user1] = accounts;
  await instance.createStar(STAR_NAME, STAR_ID, { from: user1 });

  const starName = await instance.lookUptokenIdToStarInfo.call(STAR_ID);
  assert.equal(starName, STAR_NAME);
});
