const express = require("express");
const router = express.Router();
const Student = require("../models/Student");
const fs = require("fs");
const csv = require("csv-parser");
const QRCode = require("qrcode");
var path = require("path");

router.get("/", async (req, res) => {
  // TODO: feat: filtering support for school, program, branch, year, semester
  const result = await Student.find();
  res.json({ success: true, count: result.length, data: result });
});

router.get("/:id", async (req, res) => {
  const result = await Student.findById(req.params.id);

  if (!result) return res.json({ count: 0, data: {} });

  res.json({ success: true, count: result.length, data: result });
});

/****************************************************************************
 * ROUTES ONLY FOR DEVELOPMENT PURPOSES! 								    *
 * DO NOT EXPOSE THESE IN PRODUCTION SINCE WE DON'T HAVE API AUTHENTICATION *
 ****************************************************************************/
if (process.env.NODE_ENV && process.env.NODE_ENV == "development") {
  router.post("/import", (req, res, next) => {
    let students = [];
    try {
      fs.createReadStream("./data/students.csv")
        .pipe(csv())
        .on("data", (row) => {
          students.push({
            _id: row.id,
            fullname: row.name.replace(/\s{2,}/g, " "),
            school: row.school,
            program: row.program,
            branch: row.branch,
            year: row.year,
            semester: row.semester,
            consentStatus:
              row.consent_status.toLowerCase() == "yes" ? true : false,
          });
        })
        .on("end", async () => {
          //   TODO: find which entry has duplicates intested of just returning boolean
          if (hasDuplicates(students.map((s) => s._id))) {
            return res.json({
              success: false,
              msg: `Duplicate entry found in 'id' column, please retry after removing duplicates!`,
            });
          }
          const dbStudents = await Student.find();

          // Only need emails of all db students
          const dbStudentIds = dbStudents.map((dbStudent) => dbStudent._id);

          // filter out only new entries of email
          students = students.filter(
            (student) => dbStudentIds.indexOf(student._id) === -1
          );
          // const result = [];
          const result = await Student.insertMany(students);
          return res.json({
            success: true,
            msg: `Imported ${result.length} students successfully!`,
            insertedCount: result.length,
          });
        });
    } catch (e) {
      next(e);
    }
  });

  router.post("/generateQRCodes", async (req, res, next) => {
    try {
      const dbStudents = await Student.find();

      dbStudents.forEach((student) => {
        generateQRCode(student);
      });
      return res.json({
        success: true,
        msg: `${dbStudents.length} QR codes generated.`,
      });
    } catch (e) {
      next(e);
    }
  });

  router.post("/generateQRCode/:id", async (req, res, next) => {
    try {
      if (!req.params.id)
        return res
          .status(400)
          .json({ success: false, error: "User ID is not provided." });
      const dbStudent = await Student.findById(req.params.id);
      if (!dbStudent)
        return res
          .status(404)
          .json({ success: false, error: "No user found." });

      const base64Data = generateQRCode(dbStudent);

      return res.json({
        success: true,
        msg: ` QR code generated for ${dbStudent.fullname}.`,
        base64Data: base64Data,
      });
    } catch (e) {
      next(e);
    }
  });

  //   router.post("/", async (req, res, next) => {
  //     try {
  //       const newStudent = new Student({
  //         _id: "17103487",
  //         fullname: "Pruthvi Patel",
  //         school: "SET",
  //         program: "B.Tech.",
  //         branch: "CSE",
  //         year: "4",
  //         semester: "8",
  //       });

  //       await newStudent.save();
  //       return res.json({
  //         success: true,
  //         msg: `${newStudent._id}: ${newStudent.fullname} added successfully!`,
  //       });
  //     } catch (e) {
  //       //TODO: Handle DB execptions
  //       next(e);
  //     }
  //   });
  //   router.delete("/", async (req, res, next) => {
  //     try {
  //       const dbResponse = await Student.deleteMany();

  //       return res.json({
  //         success: true,
  //         msg: `All students(${dbResponse.n}) are deleted!`,
  //       });
  //     } catch (e) {
  //       next(e);
  //     }
  //   });

  //   router.delete("/:id", async (req, res, next) => {
  //     try {
  //       const dbResponse = await Student.deleteOne({ _id: req.params.id });
  //       return res.json({
  //         success: true,
  //         msg:
  //           dbResponse.n === 1
  //             ? `Student ${req.params.id} deleted!`
  //             : `No student found for id: ${req.params.id}`,
  //       });
  //     } catch (e) {
  //       next(e);
  //     }
  //   });

  function generateQRCode(student, save = true, callback) {
    const data = {
      _id: student._id,
      fullname: student.fullname,
      school: student.school,
      program: student.program,
      branch: student.branch,
      year: student.year,
      semester: student.semester,
    };
    QRCode.toDataURL(JSON.stringify(data), { version: 10 }, function (
      err,
      url
    ) {
      if (err) {
        console.log(err);
        throw err;
      }
      const base64Data = url.replace(/^data:image\/png;base64,/, "");
      if (save) {
        const dir = path.join("qrcodes", student.school);
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, {
            recursive: true,
          });
        }
        fs.writeFile(
          path.join(dir, `${student._id}.png`),
          base64Data,
          "base64",
          function (err) {
            if (err) {
              console.log(err);
              throw err;
            }
          }
        );
      }

      if (callback) callback(base64Data);
      return base64Data;
    });
  }
}

module.exports = router;
