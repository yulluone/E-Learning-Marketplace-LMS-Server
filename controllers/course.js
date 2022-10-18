const AWS = require("aws-sdk");
const { nanoid } = require("nanoid");
const Course = require("../models/course");
const slugify = require("slugify");

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
        Bucket: "edemy-public",
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
                  // ETag: data.ETag,
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

exports.removeImage = (req, res) => {
  if (!req.body.image) {
    console.log(req.body);
    return res.sendStatus(400);
  } else {
    console.log(req.body);
    const { image } = req.body;
    var params = {
      Bucket: image.Bucket,
      Key: image.Key,
    };
    S3.deleteObject(params, (err, data) => {
      if (err) {
        console.log(err);
        return res.sendStatus(500);
      } else {
        console.log(data);
        return res.send(data);
      }
    });
  }
};

exports.create = async (req, res) => {
  console.log("crete course", req.body);
  const alreadyExist = await Course.findOne({
    slug: slugify(req.body.name.toLowerCase()),
  });

  if (alreadyExist) return res.status(400).send("Title is taken");

  const course = await new Course({
    slug: slugify(req.body.name),
    instructor: req.user.userId,
    ...req.body,
  }).save();
  res.json(course);
  try {
  } catch (err) {
    console.log(err);
    return res.status(400).send("Course create failed. Try Again");
  }
};


