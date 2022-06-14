import type { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';
const STRIPE_SECRET_KEY_LIVE = process.env.STRIPE_SECRET_KEY_LIVE!
const STRIPE_SECRET_KEY_TEST = process.env.STRIPE_SECRET_KEY_TEST!

const stripe = new Stripe(process.env.NODE_ENV === "production" ? STRIPE_SECRET_KEY_LIVE : STRIPE_SECRET_KEY_TEST, {
  apiVersion: '2020-08-27'
});


export default async (req: NextApiRequest, res: NextApiResponse) => {
    const {id} = req.body;
    const session = await stripe.checkout.sessions.retrieve(id as string, {expand: ['customer_details']});
    res.status(200).json({session: session});
}