"use strict";
const { sanitizeEntity } = require("strapi-utils");
const unparsed = require("koa-body/unparsed.js");
const stripe = require("stripe")(process.env.STRIPE_SECRET_TEST);

const YOUR_DOMAIN = "http://localhost:3000/my-courses";

// const endpointSecret = "whsec_...";
/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-controllers)
 * to customize this controller
 */

module.exports = {
  async createStripeCheckout(ctx) {
    const { id: userId } = ctx.state.user;
    const { course } = ctx.request.body;
    const { id: courseId = 0, name = "", price = 0 } = course;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "usd",
            product_data: {
              name,
            },
            unit_amount: Math.round(price) * 100,
          },
        },
      ],
      metadata: { courseId, userId },
      mode: "payment",
      success_url: `${YOUR_DOMAIN}`,
      cancel_url: `${YOUR_DOMAIN}`,
    });
    ctx.status = 200;
    const data = { url: session.url };
    ctx.send({
      data,
    });
  },
  async createOrderWebHook(ctx) {
    console.log("hello world");
    // const payload = ctx.request.body[unparsed];
    // const sig = request.headers["stripe-signature"];
    // let event;

    // try {
    //   event = stripe.webhooks.constructEvent(payload, sig, endpointSecret);
    // } catch (err) {
    //   return response.status(400).send(`Webhook Error: ${err.message}`);
    // }

    // // Handle the checkout.session.completed event
    // if (event.type === "checkout.session.completed") {
    //   const session = event.data.object;
    //   const { courseId, userId } = session.metadata;
    //   // Fulfill the purchase...
    //   console.log(courseId, userId);
    //   console.log(session.metadata);
    //   // fulfillOrder(session);
    // }

    // response.status(200);
  },
  async isPurchase(ctx) {
    const { id } = ctx.state.user;
    const { courseId = 0 } = ctx.request.body;
    const entity = await strapi
      .query("orders")
      .findOne({ user: id, course: courseId });
    if (entity) {
      ctx.status = 200;
      ctx.send({
        ok: true,
      });
    }
    // console.log(entity);
  },
};
