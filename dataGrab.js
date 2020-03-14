require("dotenv").config();

const request = require("request");
var mysql = require("mysql");

function saveToDb(body) {
  var con = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DATABASE
  });

  con.connect(function(err) {
    if (err) throw err;
    console.log("Connected!");
  });

  for (i of body) {
    console.log(i);
    if (!i.name) {
      return console.log("request bounced at captcha");
    }
    table = i.name
      .slice(0, -6)
      .replace(/ /g, "_")
      .replace("&", "and");
    for (b of i.bays) {
      if (b.bayType == "Disabled") {
        dis_bays = b.bayCount;
        occ_dis_bays = b.occupied;
      }
      if (b.bayType == "Pay and Display Parking") {
        reg_bays = b.bayCount;
        occ_reg_bays = b.occupied;
      }
    }

    d = new Date();
    d = d.toISOString().split("T")[0] + " " + d.toTimeString().split(" ")[0];

    // sql = `CREATE TABLE ${table} (date DATETIME, reg_bays INT, occ_reg_bays INT, dis_bays INT, occ_dis_bays INT)`;

    sql = `INSERT INTO ${table} (date, reg_bays, occ_reg_bays, dis_bays, occ_dis_bays) VALUES (NOW(), ${reg_bays}, ${occ_reg_bays}, ${dis_bays}, ${occ_dis_bays})`;

    con.query(sql, function(err, result) {
      if (err) throw err;
      console.log("record inserted");
    });
  }

  con.end();
}

request(
  `https://api.tfl.gov.uk/Occupancy/CarPark?app_id=${process.env.TFL_API_ID}&app_key=${process.env.TFL_API_KEY}`,
  {
    json: true
  },
  (err, res, body) => {
    if (err) {
      return console.log(err);
    }
    if (body == String) {
      return body;
    }
    saveToDb(body);
  }
);
