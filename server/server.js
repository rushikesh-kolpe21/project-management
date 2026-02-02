const expresss = require('express');


const { serve } = require("inngest/express");
const { inngest, functions } = require("./inngest/index.js");

const cors = require('cors');
const dotenv = require('dotenv');



const {clerkMiddleware} = require("@clerk/express");


const app = expresss();
app.use(expresss.json());
app.use(cors());
dotenv.config();

const PORT = process.env.PORT || 5000;


app.use(clerkMiddleware())

app.use("/api/inngest", serve({ client: inngest, functions }));

const workspaceRouter = require('./routes/workspaceRoutes.js')
app.use('/api/workspaces', workspaceRouter);

app.get('/', (req, res) => {
    res.send('Server is running');
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

