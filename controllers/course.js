const AWS = require("aws-sdk");
const { nanoid } = require("nanoid");
const Course = require("../models/course");
const slugify = require("slugify");
const fs = require("fs");
const path = require("path");
const { Storage } = require("@google-cloud/storage");

const gc = new Storage({
  keyFilename: path.join(__dirname, "../optimal-weft-368215-e62d705e67e7.json"),
  projectId: "optimal-weft-368215",
});

const edemyBucket = gc.bucket("edemy-bucet");

// gc.getBuckets().then((bucket) => console.log(bucket));

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
    slug: slugify(req.body.name),
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

exports.readCourse = async (req, res) => {
  try {
    // res.send("read course end point reached");
    const course = await Course.findOne({ slug: req.params.slug })
      .populate("instructor", "_id name")
      .exec();
    res.json(course);
  } catch (err) {
    console.log(err);
  }
};

exports.videoUpload = (req, res) => {
  try {
    if (req.params.instructorId !== req.user.userId) {
      return res.status(400).send("Unauthorized");
    }

    const { video } = req.files;
    const videoPath = fs.realpathSync(video.path);

    console.log(videoPath);
    const key = `${nanoid()}.${video.type.split("/")[1]}`;

    if (!video) return res.status(400), send("No Video");
    fs.createReadStream(videoPath).pipe(
      edemyBucket
        .file(key)
        .createWriteStream({
          contentType: video.type,
          resumable: true,
          metadata: {
            contentType: video.type,
          },
        })

        .on("error", (err) => {
          console.log("failed to	upload");
          console.log(err);
        })
        .on("finish", () => {
          console.log(`uploaded to ${edemyBucket}, "as", ${key}`);
          res.json({
            Location: `https://storage.googleapis.com/edemy-bucet/${key}`,
            Key: key,
            Bucket: "edemy-bucet",
          });
        })
    );
  } catch (err) {
    console.log(err);
  }
};

//remove video from google cloud storage
exports.removeVideo = async (req, res) => {
  try {
    if (req.params.instructorId !== req.user.userId) {
      return res.status(400).send("Unauthorized");
    }
    const video = req.body.video;
    if (!video) res.status(400).send("No video to delete");
    const key = video.Key;
    const { data } = await edemyBucket.file(key).delete();
    console.log(data);
    res.json(data);
  } catch (err) {
    console.log(err);
  }
};

//add lesson
exports.addLesson = async (req, res) => {
  try {
    const { courseId, instructorId } = req.params;
    const { title, content, video } = req.body;
    if (instructorId !== req.user.userId) {
      return res.status(400).send("Unauthorized");
    }
    const updated = await Course.findByIdAndUpdate(
      { _id: courseId },
      { $push: { lessons: { title, video, content, slug: slugify(title) } } },
      { new: true }
    )
      .populate("instructor", "id	name")
      .exec();
    res.json(updated);
  } catch (err) {
    console.log(err);
  }
};

exports.updateCourse = async (req, res) => {
  try {
    const { slug } = req.params;

    const course = await Course.findOne({
      slug,
    }).exec();
    // console.log(req.body);

    if (req.user.userId !== course.instructor._id.toString()) {
      return res.status(400).send("Unauthorized");
    }

    const updated = await Course.findOneAndUpdate({ slug }, req.body, {
      new: true,
    }).exec();
    console.log("UPDATED COURSE => ", updated);
    res.json(updated);
  } catch (err) {
    console.log(err);
  }
};

exports.deleteLesson = async (req, res) => {
  try {
    const { slug, lessonId } = req.params;
    const course = await Course.findOne({ slug }).exec();

    if (course.instructor._id.toString() !== req.user.userId) {
      return res.status(400).send("Unauthorized");
    }

    const updated = await Course.findByIdAndUpdate(
      course._id,
      { $pull: { lessons: { _id: lessonId } } },
      { new: true }
    ).exec();
    res.json({ ok: true });
  } catch (err) {
    console.log(err);
  }
};

//update lesson
exports.lessonUpdate = async (req, res) => {
  try {
    // console.log(req.body);
    // console.log(req.params);
    // console.log(req.user);

    const { _id, title, content, video, free_preview } = req.body;
    const { slug, lessonId } = req.params;

    const course = await Course.findOne({ slug }).select("instructor").exec();

    if (course.instructor._id.toString() !== req.user.userId) {
      return res.status(400).send("Unauthorized");
    }

    const updated = await Course.updateOne(
      { "lessons._id": lessonId },
      {
        $set: {
          "lessons.$.title": title,
          "lessons.$.content": content,
          "lessons.$.video": video,
          "lessons.$.free_preview": free_preview,
        },
      },
      { new: true }
    ).exec();
    res.json({ ok: true });
  } catch (err) {
    console.log(err);
    res.status(400).send("Lesson update failed");
  }
};
