import express from "express";
const app = express();
const port = 3000;
app.use(express.json())

app.use((req,res,next) => {
  req.requestTime = new Date().toISOString()
  next()
})
app.post("/v1/task", (req, res, next) => {
  console.log("Req", req.requestTime);
  res.status(200).send({ data: [], meta: [] });
});
app.get("/v1/task", (req, res, next) => {
  console.log("Req", req);
  res.status(200).send({ data: [], meta: [] });
});

app.delete('/v1/task', (req, res, next) => {
  // console.log("req", req);
  res.send({data: [], meta: []})
})

app.listen(port, () => {
  console.log(`Listening on the http://localhost:${port}`);
});
