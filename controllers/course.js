const AWS = require("aws-sdk");
const { nanoid } = require("nanoid");

const S3 = new AWS.S3({
  endpoint: "https://s3.filebase.com",
  signatureVersion: "v4",
});

exports.uploadImage = (req, res) => {
  const { image } = req.body;
  const type = image.split(";")[0].split("/")[1];
  const base64Data = new Buffer.from(
    image.replace(/^data:image\/\w+;base64,/, ""),
    "base64"
  );
  S3.listBuckets(function (err, data) {
    if (err) {
      console.log(err, err.stack);
      res.sendStatus(400);
    } else {
      var params = {
        Body: base64Data,
        Bucket: "edemy-courses",
        Key: `${nanoid()}.${type}`,
        ContentEncoding: "base64",
        ContentType: `image/${type}`,
      };
      S3.putObject(params, function (err, data) {
        if (err) {
          console.log(err, err.stack);
          res.sendStatus(400);
        } else {
          S3.getObject(
            { Key: params.Key, Bucket: params.Bucket },
            function (err, data) {
              if (err) {
                console.log(err, err.stack);
              } else {
                var resData = {
                  Bucket: params.Bucket,
                  Key: params.Key,
                  cid: data.Metadata.cid,
                };
                return res.status(200).send(resData);
              }
            }
          );
        }
      });
    }
  });
};
