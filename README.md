# Ticketing demo application 

## What you built and how to run it

Run in dev mode with  `npm run dev`

It is a next.js application that creates isomphoric code for both SSR and CSR rendering of ui components. It contains the a node server that hosts the REST API endpoints for fetching shows and creating orders. 

It uses Next UI as the UI component library, vue testing library and vitest for unit tests.

All the data is stored in-memory and the list of shows are mock data retrieved from the /shows api. This endpoint gets POSTed to to update the the pricing and inventory, which comes from a simulator that will randomly change the price or decrement the inventory. Whenever price/inventory changes, it fires the Server Side Event to send the update to all connects clients (those on checkout), which will show a notification and re-render the UI.

## The checkout session state model

```
export type Session = {
  id: string
  showId: string
  username: string
  email: string
  quantity: number
  complete: boolean
}
```

I opted to skip modeling authentication, instead when a user lands on checkout a POST request will be sent to the /session API to create a new checkout session. This will return a session id that will be added as a query param to the url. Any changes to checkout options/form will be saved in the /session API so they can be retrieved via a GET request when opening the same url in another device. This would leak PII in the real world since there is no user auth verification.


## How web and mobile resume the same session

A session id is added to query params so copy pasting the url when on checkout page will restore that session on any device. If you complete the purchase, `complete` is marked as true in the api so attempting to purchase on another browser will check if the session was completed before allowing purchase. Attempting to load an already completed session page will redirect to the homepage.

## How you handle stale inventory, price changes, or duplicate completion

Price and inventory are changed randomly via a seperate service which then sends a Server Side Event to the clients to notify them of the update. Duplicate completion is gated by a check if the session was already completed and will throw an error or redirect to homepage in the case of trying to load in a new browser.

## What tradeoffs you made

I skipped an auth system so anyone can access another user's session. There could be a strategy here of using this to share ticket purchaces with a friend so they can complete checkout.

There is no reserving tickets or locking in a price on the checkout page with a countdown timer.

I stored completed orders in sessions via a complete flag instead of a separate orders api.


## What you'd do differently with more time

Add a orders api, store "static" event info and inventory/pricing updates separately so we don't have to constantly access event info api and update it unnecessarily (better backend infra performance). Test for accessibility, performance, seo.