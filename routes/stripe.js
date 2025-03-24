import express from "express";
import Stripe from "stripe";
import dotenv from "dotenv";
import User from "../schemas/user.js";
import mongoose from "../config/client.js";

dotenv.config();
const router = express.Router();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    const sig = req.headers["stripe-signature"];
    let event;

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
      console.log("✅ Webhook vérifié:", event.type);
    } catch (err) {
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    try {
      //Gestion des évènements
      switch (event.type) {
        case "checkout.session.completed":
          const session = await stripe.checkout.sessions.retrieve(
            event.data.object.id,
            {
              expand: ["line_items"],
            }
          );
          const customerId = session?.customer;
          const customer = await stripe.customers.retrieve(customerId);
          const priceId = session?.line_items?.data[0]?.price.id;

          let user;

          if (customer.email) {
            console.log("🔴 Customer trouvé:", customer.email);
            //update l'utilisateur
            user = await User.findOneAndUpdate(
              { email: customer.email },
              {
                customerId: customerId,
                priceId: priceId,
                hasAccess: true,
              },
              { new: true }
            );
            //si user n'existe pas peut pas payer
            if (!user) {
              console.error(
                `Tentative de paiement d'un utilisateur non inscrit: ${customer.email}`
              );
              throw new Error(
                `Utilisateur non Inscrit. Inscription requise avant le paiement`
              );
            }
            //notification existe?
            // let notification = await Notification.findOne({userId: user._id});
            // //si notification existe, on la met à jour
            // if(notification){
            //   notification.status = 'recurring';
            //   await notification.save();
            // }

            // Si on arrive ici, on est sûr que l'utilisateur existe et a été mis à jour
            console.log(`Utilisateur ${customer.email} mis à jour avec succès`);

            //Envoi d'un email de confirmation

            break;
          }
        case "customer.subscription.deleted": {
          const subscription = await stripe.subscriptions.retrieve(
            event.data.object.id
          );

          // 1. Vérifier si on a un customer
          if (!subscription.customer) {
            console.log("⚠️ Pas de customerId dans la subscription");
            return res.json({
              received: true,
              warning: "No customer ID in subscription",
            });
          }

          console.log("🔴 Subscription supprimée:", subscription.customer);

          const user = await User.findOne({
            customerId: subscription.customer,
          });

          // 3. Vérifier si l'utilisateur existe
          if (!user) {
            console.log(
              "⚠️ Utilisateur non trouvé pour customerId:",
              subscription.customer
            );
            return res.json({
              received: true,
              warning: "User not found for this customer ID",
            });
          }

          //   const notification = await Notification.updateOne(
          //     { userId: user._id },
          //     { $set: { status: "disabled" } }
          //   );

          // if (notification) {
          //   notification.status = "disabled";
          //   await notification.save();
          // }

          user.hasAccess = false;
          await user.save();

          break;
        }

        default:
          console.log(`évènement non géré ${event.type}`);
      }
      //Réponse de succès
      res.json({ received: true });
    } catch (error) {
      console.error(
        `Erreur Stripe: ${error.message}  | Type d'évènement:${event.type}`
      );

      if (error.message.includes("Utilisateur non inscrit")) {
        return res.status(400).json({
          error: error.message,
          type: "unregistered_user_error",
        });
      }

      res.status(500).json({
        error: "Erreur interne du serveur",
        message: error.message,
      });
    }
  }
);

export default router;
