export default class OrderModel {
  constructor(userID, TotalAmount, timeStamp) {
    this.userID = userID;
    this.TotalAmount = TotalAmount;
    this.timeStamp = timeStamp;
  }
}
