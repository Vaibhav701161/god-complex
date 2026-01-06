import app from "./app";

const PORT  = process.env.port || 4000 ;

app.listen(PORT, () => {
    console.log('HTTP server running on port ${PORT}');
});