import type { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';

const stripe = new Stripe( process.env.NODE_ENV === "production" ? process.env.STRIPE_SECRET_KEY_LIVE! : process.env.STRIPE_SECRET_KEY_TEST!, {
  apiVersion: '2020-08-27'
});

// This is the url to which the customer will be redirected when they are done
// managing their billing with the portal.

export default async (req: NextApiRequest, res: NextApiResponse) => {

    const returnUrl = `${req.headers.origin}/manage/${req.body.editId}?listingDeleted=true`;
    const customerId = req.body.customerId;

    const portalSession = await stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: returnUrl,
      });

    res.status(200).json({sessionUrl: portalSession.url});
}