import express from 'express';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

//Middleware
app.use(express.json());

//Test route
app.get('/', (req,res) => {
  res.json({
    message: 'Server is running',
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on ${PORT}`);
});