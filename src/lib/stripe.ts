import { loadStripe } from "@stripe/stripe-js";

// Load the Stripe.js library with your publishable key
export const stripePromise = loadStripe(
  "pk_test_51R2M5YRgx5G02wlnklvYD5iWPrYBJdyg87VunbuwRGg7uVog1NxNGwlsokmWj1v2TXjAX8Ys8kqTAvVqKk6KeeED002uqSxiTq",
);
