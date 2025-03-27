import express from "express";

import dotenv from 'dotenv';
dotenv.config();
import cors from "cors";


import routes from "./routes";

const PORT = process.env.PORT || 8000;

const app = express();
app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/api',routes)


app.listen(PORT, () => {
	console.log("Server is listening on port", PORT)
});
