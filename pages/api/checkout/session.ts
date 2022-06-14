import type { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';
const priceIdLive = process.env.PRICE_ID_LIVE!
const priceIdTest = process.env.PRICE_ID_TEST!
const stripe = new Stripe(process.env.NODE_ENV === "production" ? process.env.STRIPE_SECRET_KEY_LIVE! : process.env.STRIPE_SECRET_KEY_TEST!, {
  apiVersion: '2020-08-27'
});

export default async (req: NextApiRequest, res: NextApiResponse) => {
    const listingData = JSON.parse(req.body.listingData)

    const session = await stripe.checkout.sessions.create({
        billing_address_collection: 'auto',
        line_items: [
          {
            price: process.env.NODE_ENV === "production" ? priceIdLive : priceIdTest,
            // For metered billing, do not pass quantity
            quantity: req.body.quantity,
    
          },
        ],
        mode: 'subscription',
        customer_email: listingData.companyPrimaryEmail,
        metadata: listingData,
        success_url: `${req.headers.origin}/result?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${req.headers.origin}/create?session_id={CHECKOUT_SESSION_ID}`,
    })
    res.status(200).json({sessionId: session.id});
}