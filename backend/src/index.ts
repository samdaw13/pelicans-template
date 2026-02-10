import express from 'express';
import cors from 'cors';

const app = express();
const port = 3200;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'hello-world' });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

