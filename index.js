const express = require("express");
const app = express();
app.use(express.json());
const crypto = require("crypto");
const fs = require("fs");
var nc = require("nconf");
var pbkdf2 = require("pbkdf2");
const pool = require("./db");

nc.use("file", { file: "./../passwords.json" });
nc.load();

let key = "#lml!showpb->comeback2014letmein";

app.get("/", async (req, res) => {
  try {
    res.send("Hallo");
  } catch (e) {
    console.log(e);
    res.send("Error");
  }
});

app.get("/passwords/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const item = await pool.query(
      `select pwd from passwords where id = '${id}'`
    );
    const password = decryptPassword(item[0].pwd, key);
    res.send(password);
  } catch (error) {
    console.log(error);
    res.send("error");
  }
});

app.get("/allkeys", async (req, res) => {
  try {
    const passwords = await pool.query(`select * from passwords`);
    let liste = [];
    for (let i = 0; i < passwords.length; i++) {
      liste.push(passwords[i]);
    }
    res.send(liste);
  } catch (error) {
    res.send("error");
  }
});

app.post("/new", async (req, res) => {
  try {
    const { password, name, url, id } = req.body;

    const item = encryptPassword(password, key);
    await pool.query(
      `insert into passwords (pwd, name, url, id) values('${item}','${name}', '${url}', '${id}')`
    );

    res.send("success");
  } catch (error) {
    console.log(error);
    res.send(error);
  }
});

app.get("/all", async (req, res) => {
  try {
    fs.readFile("../passwords.json", "utf8", readingFile);

    function readingFile(error, data) {
      if (error) {
        console.log(error);
      } else {
        res.send(data);
      }
    }
  } catch (error) {
    res.send("error");
  }
});

function getIv() {
  var str = "";
  for (counter = 0; counter <= 15; counter++) {
    var randomNum = 0 + parseInt(Math.random() * 127);
    if (randomNum > 33) {
      str += String.fromCharCode(randomNum);
    } else {
      counter--;
    }
  }
  return str;
}

function encryptPassword(password, key) {
  let iv = getIv();
  var derivedKey = pbkdf2.pbkdf2Sync(key, "salt", 1, 32, "sha512");
  console.log(`derivedKey: ${derivedKey}`);
  let cipher = crypto.createCipheriv("aes-256-cbc", derivedKey, iv);
  let encrypted = cipher.update(password, "utf-8", "hex");
  encrypted += cipher.final("hex");

  let item = encrypted.toString() + " " + iv;
  return item;
}

function decryptPassword(item, key) {
  var derivedKey = pbkdf2.pbkdf2Sync(key, "salt", 1, 32, "sha512");
  iv = item.split(" ")[1];
  encrypted = item.split(" ")[0];
  let decipher = crypto.createDecipheriv("aes-256-cbc", derivedKey, iv);
  let decrypted = decipher.update(encrypted, "hex", "utf-8");
  decrypted += decipher.final("utf-8");
  return decrypted;
}

// const f = encryptPassword("sanoj1809", key);
// console.log(f);
// const i = decryptPassword(f, key);
// console.log(i);

// let item = encryptPassword("#jonascc88", key);
// nc.set("twitter.com", item.toString());

// item = nc.get("twitter.com");
// console.log(decryptPassword(item, key));

//nc.get("desert");
//ncSave();

//`decrypted ${decrypted}; encrypted ${encrypted}; ${iv}; ${password}; ${key}`;

const port = 5000;
app.listen(port, () => {
  console.log("server started");
});
