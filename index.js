const express = require("express");
const app = express();
app.use(express.json());
const crypto = require("crypto");
const fs = require("fs");
var nc = require("nconf");
const { send } = require("process");
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

app.get("/backup", async (req, res) => {
  try {
    backupPasswords();
    res.send("success");
  } catch (error) {
    res.send("error");
  }
});

app.get("/passwords/:name", async (req, res) => {
  try {
    const { name } = req.params;
    const item = nc.get(name);
    const password = decryptPassword(item, key);
    res.send(password);
  } catch (error) {
    res.send("error");
  }
});

app.get("/allkeys", async (req, res) => {
  try {
    fs.readFile("../passwords.json", "utf8", readingFile);
    let keys = [];
    function readingFile(error, data) {
      if (error) {
        res.send("error");
      }
      for (key in JSON.parse(data)) {
        keys.push(key);
      }
      res.send(keys);
    }
  } catch (error) {
    res.send("error");
  }
});

app.post("/new", async (req, res) => {});

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

function backupPasswords() {
  fs.readFile("../passwords.json", "utf8", readingFile);

  function readingFile(error, data) {
    if (error) {
      console.log(error);
    } else {
      // Creating new file - paste.txt with file.txt's content
      fs.writeFile("../backup.json", data, "utf8", writeFile);
    }
  }

  function writeFile(error) {
    if (error) {
      console.log(error);
    } else {
      console.log("Content has been pasted to backup.json file");
    }
  }
}

function ncSave() {
  nc.save(function (err) {
    if (err) {
      console.error(err.message);
      return;
    }
    console.log("Configuration saved successfully.");
  });
}

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
  console.log(str);
  return str;
}

function encryptPassword(password, key) {
  let iv = getIv();

  let cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
  let encrypted = cipher.update(password, "utf-8", "hex");
  encrypted += cipher.final("hex");

  let item = encrypted.toString() + " " + iv;
  return item;
}

function decryptPassword(item, key) {
  iv = item.split(" ")[1];
  encrypted = item.split(" ")[0];
  console.log(iv);
  let decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);
  let decrypted = decipher.update(encrypted, "hex", "utf-8");
  decrypted += decipher.final("utf-8");
  return decrypted;
}

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
