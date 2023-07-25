import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import fs from 'fs';
import morgan from 'morgan';
import dotenv from 'dotenv';

dotenv.config();
const app = express();

const routerFiles = fs.readdirSync('./src/routes');
const PORT = process.env.PORT || 3001;

// middlewares
app.use(morgan('tiny'));
app.use(express.json());
app.use(cors());
// using router
routerFiles.forEach((file) => {
  app.use('/api', require(`./routes/${file}`).default);
});

const server = app.listen(PORT, () => {
  console.info(`Server listening on port ${PORT}`);
});

mongoose.set('strictQuery', true);
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.info('Connect database successfully');
  })
  .catch((error) => {
    console.info(error);
  });
