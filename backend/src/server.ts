import express from "express";
import { env } from "./env";

const app = express();

app.get("/", (req, res) => res.send("<h1>heyaa</h1>"));

app.listen(env.PORT, () => console.log("server is up"));
