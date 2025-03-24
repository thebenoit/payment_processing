import express from "express";
import cors from "cors";
import stripeWebhookRouter from "./routes/stripe.js";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.use(
    cors({
      origin: "*", // ou spécifiez les domaines autorisés, ex: ['http://localhost:3000', 'https://votreapp.com']
      methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
      allowedHeaders: [
        "Origin",
        "X-Requested-With",
        "Content-Type",
        "Accept",
        "Authorization",
      ],
      credentials: true, // si vous avez besoin de supporter les cookies/auth
    })
  );

app.use(
    "/api/stripe/",
    //express.raw({type: "application/json"}),
    stripeWebhookRouter
  );

  // Ajouter ces middlewares avant vos routes
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname + "/")));

app.get("/", (req, res) => {
    res.send("Stripe webhook server is running...");
  });

  app.listen(process.env.PORT, () => {
    console.log(`notification server is running on port ${process.env.PORT}`);
  });
  