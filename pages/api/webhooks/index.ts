import { buffer } from 'micro'
import Cors from 'micro-cors'
import { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';
const { connectToDatabase } = require('../../../lib/mongodb');

const stripe = new Stripe(process.env.NODE_ENV === "production" ? process.env.STRIPE_SECRET_KEY_LIVE! : process.env.STRIPE_SECRET_KEY_TEST!, {
    apiVersion: '2020-08-27'
  });
  
const mongoDbUri = process.env.MONGODB_URI
const mongoDb = process.env.DB_NAME

const cors = Cors({
    allowMethods: ['POST', 'HEAD'],
  });


  const webhookSecret: string = process.env.NODE_ENV === "production" ? process.env.STRIPE_WEBHOOK_SECRET_LIVE! : process.env.STRIPE_WEBHOOK_SECRET_TEST!

  // Stripe requires the raw body to construct the event.
  export const config = {
    api: {
      bodyParser: false,
    },
  }
  
  const webhookHandler = async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method === 'POST') {
      const buf = await buffer(req)
      const sig = req.headers['stripe-signature']!
  
      let event: Stripe.Event
    
      try {
        event = stripe.webhooks.constructEvent(buf.toString(), sig, webhookSecret)
      } catch (err) {
        const error = err as any
        // On error, log and return the error message
        console.log(`❌ Error message: ${error.message}`)
        res.status(400).send(`Webhook Error: ${error.message}`)
        return
      }

        // Successfully constructed event
        console.log('✅ Success:', event.id)

        // Handle the event
        // Cast event data to Stripe object.

        if (event.type === 'customer.subscription.created') {
            const data = event.data.object as Stripe.Invoice
            const customerId = data.customer
            const subscriptionId = data.id
            console.log(JSON.stringify(data, null, 2)) 
            console.log(`💰 PaymentIntent status: ${data.status}, customer: ${customerId}, subscription: ${subscriptionId}`)

            // TODO: CREATE LISTING
        } else if (event.type === 'customer.subscription.deleted') {
            // Continue to provision the subscription as payments continue to be made.
            // Store the status in your database and check when a user accesses your service.
            // This approach helps you avoid hitting rate limits.
            const data = event.data.object as Stripe.Invoice
            const customerId = data.customer
            const subscriptionId = data.id

            deleteListing(customerId as string, subscriptionId, res)
            console.log(`💰 PaymentIntent status: ${data.status}, customer: ${customerId}, subscription: ${subscriptionId}`)
        } else {
            console.warn(`🤷‍♀️ Unhandled event type: ${event.type}`)
        }
  
      // Return a response to acknowledge receipt of the event.
      res.json({ received: true })
    } else {
        res.setHeader('Allow', 'POST')
        res.status(405).end('Method Not Allowed')
    }
}


export default cors(webhookHandler as any);


async function deleteListing(customerIdProp: string, subscriptionIdProp: string, res: NextApiResponse) {
  try {

      const customerId = customerIdProp;
      const subscriptionId = subscriptionIdProp;

      // create a filter for a movie to update
      const filter = { $and: [{'employer.customerId': customerId}, {'employer.subscriptionId': subscriptionId}] };
    
      let { db } = await connectToDatabase(mongoDbUri, mongoDb);

      await db.collection('InternshipListings').deleteOne(filter)
      .then((res: any) => {
          return JSON.parse(JSON.stringify(res));
      })
      .then(async (json: string) => {
          return res.json({
              message: json,
              success: true,
          });
      })
      .catch((err: any) => {
          return res.json({
              message: err,
              success: false,
          });
      })

  } catch (error) {
      // return the error
      return res.json({
          message: (error as Error).message,
          success: false,
      });
  }
}