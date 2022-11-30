const unirest = require("unirest");
const MpesaPushSTK = async (mpesaNumber, amount, courseSlug, userId) => {
  try {
    const date = new Date();
    const timestamp =
      date.getFullYear() +
      ("0" + date.getMonth() + 11).slice(-2) +
      ("0" + date.getDate()).slice(-2) +
      ("0" + date.getHours()).slice(-2) +
      ("0" + date.getMinutes()).slice(-2) +
      ("0" + date.getSeconds()).slice(-2);

    //generate base64 password
    const password = Buffer.from(
      // `${process.env.SAF_BUSINESS_SHORT_CODE}+${process.env.SAF_PASS_KEY}+${timestamp}`
      process.env.SAF_BUSINESS_SHORT_CODE + process.env.SAF_PASS_KEY + timestamp
    ).toString("base64");
    // console.log("PASSWORD=>", password);

    //generate auth token
    const auth = new Buffer.from(
      `${process.env.SAF_CONSUMER_KEY}:${process.env.SAF_CONSUMER_SECRET}`
      // "duxYp3TuxAClnHfohwtfXZyrLT87XliG:qXbGBvs3PPnTC0P4"
    ).toString("base64");
    // console.log(`BASIC => ${auth}`);

    // console.log("AUTH =>", auth);

    //Get access token from safaricom
    try {
      const getToken = await unirest
        .get(
          "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials"
        )
        .headers({
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/json",
        })
        .send();
      // console.log("GETTOKEN =>", getToken.body.access_token);
      const token = getToken.body.access_token;

      // console.log("TIMESTAMP =>", timestamp);

      //send payment request-pro to user sim toolkit
      const response = await unirest(
        "POST",
        "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest"
      )
        .headers({
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        })
        .send(
          JSON.stringify({
            BusinessShortCode: 174379,
            Password: `${password}`,
            Timestamp: `${timestamp}`,
            TransactionType: "CustomerPayBillOnline",
            Amount: `${amount}`,
            PartyA: `${mpesaNumber}`,
            PartyB: 174379,
            PhoneNumber: `${mpesaNumber}`,

            CallBackURL: `${process.env.SAF_CALLBACK_URL}/auth/mpesa/transaction/callback/${courseSlug}/${userId}`,
            AccountReference: "YulluCorp",
            TransactionDesc: "Enrollment",
          })
        );
      // console.log(response.body);
      return response;
    } catch (err) {
      console.log(err);
      return err;
    }
  } catch (err) {
    console.log("error", err);
    return err;
  }
};

module.exports = MpesaPushSTK;
