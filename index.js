require("dotenv").config();
const XLSX = require("xlsx");
var unserialize = require("php-serialization").unserialize;
const Sequelize = require("sequelize");
const AWS = require("aws-sdk");

const seq = new Sequelize({
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_DATABASE,
  host: process.env.DB_HOST,
  dialect: "mysql",
  logging: false,
  pool: {
    max: 20,
    min: 0,
    idle: 5000
  }
});

AWS.config.update({
  accessKeyId: process.env.S3_ACESS,
  secretAccessKey: process.env.S3_SECRET,
  region: process.env.S3_REGION
});

function getBufferFromS3(file, callback) {
  const buffers = [];
  const s3 = new AWS.S3();
  const stream = s3
    .getObject({ Bucket: process.env.S3_BUCKET, Key: file })
    .createReadStream();
  stream.on("data", data => buffers.push(data));
  stream.on("end", () => callback(null, Buffer.concat(buffers)));
  stream.on("error", error => callback(error));
}

function getBufferFromS3Promise(file) {
  return new Promise((resolve, reject) => {
    getBufferFromS3(file, (error, s3buffer) => {
      if (error) return reject(error);
      return resolve(s3buffer);
    });
  });
}

const Model = seq.define(
  "excel",
  {
    teste: Sequelize.TEXT
  },
  { tableName: "excel" }
);

function processData(jsonRows, context) {
  return new Promise(async (resolve, reject) => {
    var dados = [];
    var last = 2500;

    for (i = 0; i < jsonRows.length; i++) {
      dados.push({ teste: JSON.stringify(jsonRows[i]) });

      if (i >= last) {
        last += 2500;
        await Model.bulkCreate(dados);
        dados = [];
      } else if (i === jsonRows.length - 1) {
        await Model.bulkCreate(dados);
        dados = [];
        context.succeed("Success");
      }
    }
  });
}

exports.handler = async (event, context) => {
  var record = event.Records[0];

  try {
    var body = JSON.parse(record.body);
    var result = unserialize(body.data.command);
    var url = result.url;
  } catch (err) {
    var url = record.payload.url;
  }

  console.log("aqui1");

  const buffer = await getBufferFromS3Promise(url);
  console.log("aqui2");
  const workbook = XLSX.read(buffer);

  console.log("aqui3");

  const jsonRows = XLSX.utils.sheet_to_json(
    workbook.Sheets[workbook.SheetNames[0]]
  );

  console.log("aqui4");

  console.log(jsonRows.length);

  function wait() {
    return new Promise((resolve, reject) => {
      setTimeout(() => resolve("hello"), 2000);
    });
  }
  console.log(await wait());
  await processData(jsonRows, context);
};
