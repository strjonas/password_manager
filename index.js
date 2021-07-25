const express = require("express");
const app = express();
app.use(express.json());
const crypto = require("crypto");
var pbkdf2 = require("pbkdf2");
const pool = require("./db");
const bcrypt = require("bcrypt");

const MASTER = "$2b$10$G.PjCSjF4weyzKVM9gDib.CM7Ci97ZuTcKlm9l.3cr8fBDll.W1Oy";

app.get("/", async (req, res) => {
  try {
    res.send("Hallo");
  } catch (e) {
    console.log(e);
    res.send("Error");
  }
});

app.get("/passwords/:id/:key", async (req, res) => {
  try {
    const { id, key } = req.params;

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

app.get("/delpasswords/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query(`delete from passwords where id = '${id}'`);
    res.send("success");
  } catch (error) {
    res.send("error");
    console.log(error);
  }
});

app.get("/allkeys/:key", async (req, res) => {
  try {
    const { key } = req.params;
    // console.log(key);
    // console.log(bcrypt.compareSync(key.toString(), MASTER));
    if (bcrypt.compareSync(key, MASTER) === false) {
      res.send("Wrong Password");
      return;
    }
    const passwords = await pool.query(`select * from passwords order by name`);
    let liste = [];
    for (let i = 0; i < passwords.length; i++) {
      liste.push(passwords[i]);
    }
    res.send(liste);
  } catch (error) {
    res.send("error");
  }
});

app.post("/new/:key", async (req, res) => {
  try {
    const { key } = req.params;

    if (bcrypt.compareSync(key, MASTER) === false) {
      res.send("Wrong Password");
      return;
    }
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

function getIv() {
  var str = "";
  for (counter = 0; counter <= 15; counter++) {
    var randomNum = 0 + parseInt(Math.random() * 122);
    if (randomNum > 97) {
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
  console.log(item);
  var derivedKey = pbkdf2.pbkdf2Sync(key, "salt", 1, 32, "sha512");
  iv = item.split(" ")[1];
  encrypted = item.split(" ")[0];
  let decipher = crypto.createDecipheriv("aes-256-cbc", derivedKey, iv);
  let decrypted = decipher.update(encrypted, "hex", "utf-8");
  decrypted += decipher.final("utf-8");
  return decrypted;
}

const port = 5000;
app.listen(port, () => {
  console.log("server started");
});
