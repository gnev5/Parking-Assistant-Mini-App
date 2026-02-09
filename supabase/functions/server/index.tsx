import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";
const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization", "apikey"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-48e86749/health", (c) => {
  return c.json({ status: "ok" });
});

// ============ USER ROUTES ============

// Create or update user profile
app.post("/make-server-48e86749/users", async (c) => {
  try {
    const body = await c.req.json();
    const { userId, name, telegramUsername, phoneNumber, isOwner, language } = body;
    
    if (!userId || !name) {
      return c.json({ error: "userId and name are required" }, 400);
    }

    const user = {
      userId,
      name,
      telegramUsername: telegramUsername || "",
      phoneNumber: phoneNumber || "",
      isOwner: isOwner || false,
      language: language || "en",
      createdAt: new Date().toISOString(),
    };

    await kv.set(`user:${userId}`, user);
    return c.json({ success: true, user });
  } catch (error) {
    console.log(`Error creating user profile: ${error}`);
    return c.json({ error: String(error) }, 500);
  }
});

// Get user profile
app.get("/make-server-48e86749/users/:id", async (c) => {
  try {
    const userId = c.req.param("id");
    const user = await kv.get(`user:${userId}`);
    
    if (!user) {
      return c.json({ error: "User not found" }, 404);
    }
    
    return c.json({ user });
  } catch (error) {
    console.log(`Error fetching user profile: ${error}`);
    return c.json({ error: String(error) }, 500);
  }
});

// ============ PARKING SPACE ROUTES ============

// Create parking space (owners only)
app.post("/make-server-48e86749/spaces", async (c) => {
  try {
    const body = await c.req.json();
    const { ownerId, spaceNumber, location, ownerName, ownerTelegram, ownerPhone } = body;
    
    if (!ownerId || !spaceNumber) {
      return c.json({ error: "ownerId and spaceNumber are required" }, 400);
    }

    const spaceId = `space-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const space = {
      spaceId,
      ownerId,
      spaceNumber,
      location: location || "",
      ownerName: ownerName || "",
      ownerTelegram: ownerTelegram || "",
      ownerPhone: ownerPhone || "",
      createdAt: new Date().toISOString(),
    };

    await kv.set(`space:${spaceId}`, space);
    
    // Add to owner's spaces list
    const ownerSpaces = await kv.get(`owner:${ownerId}:spaces`) || [];
    ownerSpaces.push(spaceId);
    await kv.set(`owner:${ownerId}:spaces`, ownerSpaces);
    
    return c.json({ success: true, space });
  } catch (error) {
    console.log(`Error creating parking space: ${error}`);
    return c.json({ error: String(error) }, 500);
  }
});

// Get all parking spaces for an owner
app.get("/make-server-48e86749/spaces/owner/:ownerId", async (c) => {
  try {
    const ownerId = c.req.param("ownerId");
    const spaceIds = await kv.get(`owner:${ownerId}:spaces`) || [];
    
    const spaces = [];
    for (const spaceId of spaceIds) {
      const space = await kv.get(`space:${spaceId}`);
      if (space) {
        spaces.push(space);
      }
    }
    
    return c.json({ spaces });
  } catch (error) {
    console.log(`Error fetching owner spaces: ${error}`);
    return c.json({ error: String(error) }, 500);
  }
});

// Update parking space
app.put("/make-server-48e86749/spaces/:id", async (c) => {
  try {
    const spaceId = c.req.param("id");
    const body = await c.req.json();
    
    const existingSpace = await kv.get(`space:${spaceId}`);
    if (!existingSpace) {
      return c.json({ error: "Space not found" }, 404);
    }

    const updatedSpace = { ...existingSpace, ...body, spaceId };
    await kv.set(`space:${spaceId}`, updatedSpace);
    
    return c.json({ success: true, space: updatedSpace });
  } catch (error) {
    console.log(`Error updating parking space: ${error}`);
    return c.json({ error: String(error) }, 500);
  }
});

// ============ LISTING ROUTES ============

// Create listing (offer)
app.post("/make-server-48e86749/listings", async (c) => {
  try {
    const body = await c.req.json();
    const { spaceId, type, price, availableFrom, availableTo, postedBy, description, title } = body;
    
    if (!type || !postedBy) {
      return c.json({ error: "type and postedBy are required" }, 400);
    }

    const listingId = `listing-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const listing = {
      listingId,
      spaceId: spaceId || null,
      type, // 'sale', 'rent-long', 'short-term'
      price: price || "",
      availableFrom: availableFrom || "",
      availableTo: availableTo || "",
      postedBy,
      description: description || "",
      title: title || "",
      status: "available",
      createdAt: new Date().toISOString(),
    };

    await kv.set(`listing:${listingId}`, listing);
    
    // Add to all listings index
    const allListings = await kv.get("listings:all") || [];
    allListings.unshift(listingId); // Add to beginning for recent first
    await kv.set("listings:all", allListings);
    
    return c.json({ success: true, listing });
  } catch (error) {
    console.log(`Error creating listing: ${error}`);
    return c.json({ error: String(error) }, 500);
  }
});

// Get all listings with optional filters
app.get("/make-server-48e86749/listings", async (c) => {
  try {
    const typeFilter = c.req.query("type"); // 'sale', 'rent-long', 'short-term', or undefined for all
    const allListingIds = await kv.get("listings:all") || [];
    
    const listings = [];
    for (const listingId of allListingIds) {
      const listing = await kv.get(`listing:${listingId}`);
      if (listing) {
        // Apply filter if specified
        if (!typeFilter || listing.type === typeFilter) {
          // Fetch associated space and user data
          if (listing.spaceId) {
            listing.space = await kv.get(`space:${listing.spaceId}`);
          }
          listing.poster = await kv.get(`user:${listing.postedBy}`);
          listings.push(listing);
        }
      }
    }
    
    return c.json({ listings });
  } catch (error) {
    console.log(`Error fetching listings: ${error}`);
    return c.json({ error: String(error) }, 500);
  }
});

// Get single listing by ID
app.get("/make-server-48e86749/listings/:id", async (c) => {
  try {
    const listingId = c.req.param("id");
    const listing = await kv.get(`listing:${listingId}`);
    
    if (!listing) {
      return c.json({ error: "Listing not found" }, 404);
    }

    // Fetch associated space and user data
    if (listing.spaceId) {
      listing.space = await kv.get(`space:${listing.spaceId}`);
    }
    listing.poster = await kv.get(`user:${listing.postedBy}`);
    
    return c.json({ listing });
  } catch (error) {
    console.log(`Error fetching listing: ${error}`);
    return c.json({ error: String(error) }, 500);
  }
});

// ============ REQUEST ROUTES ============

// Create request
app.post("/make-server-48e86749/requests", async (c) => {
  try {
    const body = await c.req.json();
    const { type, requestedFrom, requestedTo, budget, description, postedBy, title } = body;
    
    if (!type || !postedBy) {
      return c.json({ error: "type and postedBy are required" }, 400);
    }

    const requestId = `request-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const request = {
      requestId,
      type, // 'buy', 'rent-long', 'short-term'
      requestedFrom: requestedFrom || "",
      requestedTo: requestedTo || "",
      budget: budget || "",
      description: description || "",
      title: title || "",
      postedBy,
      status: "open",
      createdAt: new Date().toISOString(),
    };

    await kv.set(`request:${requestId}`, request);
    
    // Add to all requests index
    const allRequests = await kv.get("requests:all") || [];
    allRequests.unshift(requestId);
    await kv.set("requests:all", allRequests);
    
    return c.json({ success: true, request });
  } catch (error) {
    console.log(`Error creating request: ${error}`);
    return c.json({ error: String(error) }, 500);
  }
});

// Get all requests with optional filters
app.get("/make-server-48e86749/requests", async (c) => {
  try {
    const typeFilter = c.req.query("type");
    const allRequestIds = await kv.get("requests:all") || [];
    
    const requests = [];
    for (const requestId of allRequestIds) {
      const request = await kv.get(`request:${requestId}`);
      if (request) {
        if (!typeFilter || request.type === typeFilter) {
          request.poster = await kv.get(`user:${request.postedBy}`);
          requests.push(request);
        }
      }
    }
    
    return c.json({ requests });
  } catch (error) {
    console.log(`Error fetching requests: ${error}`);
    return c.json({ error: String(error) }, 500);
  }
});

// Get single request by ID
app.get("/make-server-48e86749/requests/:id", async (c) => {
  try {
    const requestId = c.req.param("id");
    const request = await kv.get(`request:${requestId}`);
    
    if (!request) {
      return c.json({ error: "Request not found" }, 404);
    }

    request.poster = await kv.get(`user:${request.postedBy}`);
    
    return c.json({ request });
  } catch (error) {
    console.log(`Error fetching request: ${error}`);
    return c.json({ error: String(error) }, 500);
  }
});

// Delete request (only by author)
app.delete("/make-server-48e86749/requests/:id", async (c) => {
  try {
    const requestId = c.req.param("id");
    const body = await c.req.json();
    const { userId } = body;
    
    if (!userId) {
      return c.json({ error: "userId is required" }, 400);
    }

    const request = await kv.get(`request:${requestId}`);
    
    if (!request) {
      return c.json({ error: "Request not found" }, 404);
    }

    // Verify that the user is the author of the request
    if (request.postedBy !== userId) {
      return c.json({ error: "Unauthorized: You can only delete your own requests" }, 403);
    }

    // Delete the request
    await kv.del(`request:${requestId}`);
    
    // Remove from all requests index
    const allRequests = await kv.get("requests:all") || [];
    const updatedRequests = allRequests.filter((id: string) => id !== requestId);
    await kv.set("requests:all", updatedRequests);
    
    return c.json({ success: true, message: "Request deleted successfully" });
  } catch (error) {
    console.log(`Error deleting request: ${error}`);
    return c.json({ error: String(error) }, 500);
  }
});

// ============ BOOKING ROUTES ============

// Book a short-term listing
app.post("/make-server-48e86749/bookings", async (c) => {
  try {
    const body = await c.req.json();
    const { listingId, userId, parkingFrom, parkingTo } = body;
    
    if (!listingId || !userId || !parkingFrom || !parkingTo) {
      return c.json({ error: "listingId, userId, parkingFrom, and parkingTo are required" }, 400);
    }

    // Get listing details
    const listing = await kv.get(`listing:${listingId}`);
    if (!listing) {
      return c.json({ error: "Listing not found" }, 404);
    }

    // Verify it's a short-term listing
    if (listing.type !== "short-term") {
      return c.json({ error: "Only short-term listings can be booked" }, 400);
    }

    // Get booking user info
    const bookingUser = await kv.get(`user:${userId}`);
    if (!bookingUser) {
      return c.json({ error: "User not found" }, 404);
    }

    // Create booking record
    const bookingId = `booking-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const booking = {
      bookingId,
      listingId,
      userId,
      parkingFrom,
      parkingTo,
      bookedBy: bookingUser.name,
      bookedByUsername: bookingUser.telegramUsername || "",
      createdAt: new Date().toISOString(),
    };

    await kv.set(`booking:${bookingId}`, booking);

    // Create notification for listing owner
    const notificationId = `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const notification = {
      notificationId,
      recipientId: listing.postedBy,
      type: "booking",
      message: `${bookingUser.name} (${bookingUser.telegramUsername || "no username"}) has booked your parking space`,
      parkingFrom,
      parkingTo,
      listingId,
      bookingId,
      read: false,
      createdAt: new Date().toISOString(),
    };

    await kv.set(`notification:${notificationId}`, notification);

    // Add to owner's notifications
    const ownerNotifications = await kv.get(`user:${listing.postedBy}:notifications`) || [];
    ownerNotifications.unshift(notificationId);
    await kv.set(`user:${listing.postedBy}:notifications`, ownerNotifications);

    // Delete the listing
    await kv.del(`listing:${listingId}`);
    
    // Remove from all listings index
    const allListings = await kv.get("listings:all") || [];
    const updatedListings = allListings.filter((id: string) => id !== listingId);
    await kv.set("listings:all", updatedListings);
    
    return c.json({ success: true, booking, notification });
  } catch (error) {
    console.log(`Error creating booking: ${error}`);
    return c.json({ error: String(error) }, 500);
  }
});

// ============ OFFER ROUTES ============

// Offer a space for a short-term request
app.post("/make-server-48e86749/offers", async (c) => {
  try {
    const body = await c.req.json();
    const { requestId, userId, spaceId } = body;
    
    if (!requestId || !userId || !spaceId) {
      return c.json({ error: "requestId, userId, and spaceId are required" }, 400);
    }

    // Get request details
    const request = await kv.get(`request:${requestId}`);
    if (!request) {
      return c.json({ error: "Request not found" }, 404);
    }

    // Verify it's a short-term request
    if (request.type !== "short-term") {
      return c.json({ error: "Only short-term requests can receive offers" }, 400);
    }

    // Get offering user info
    const offeringUser = await kv.get(`user:${userId}`);
    if (!offeringUser) {
      return c.json({ error: "User not found" }, 404);
    }

    // Get space details
    const space = await kv.get(`space:${spaceId}`);
    if (!space) {
      return c.json({ error: "Space not found" }, 404);
    }

    // Verify the user owns the space
    if (space.ownerId !== userId) {
      return c.json({ error: "You can only offer your own spaces" }, 403);
    }

    // Create offer record
    const offerId = `offer-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const offer = {
      offerId,
      requestId,
      spaceId,
      userId,
      offeredBy: offeringUser.name,
      offeredByUsername: offeringUser.telegramUsername || "",
      spaceNumber: space.spaceNumber,
      spaceLocation: space.location || "",
      createdAt: new Date().toISOString(),
    };

    await kv.set(`offer:${offerId}`, offer);

    // Create notification for request author
    const notificationId = `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const notification = {
      notificationId,
      recipientId: request.postedBy,
      type: "offer",
      message: `${offeringUser.name} (${offeringUser.telegramUsername || "no username"}) has offered parking space #${space.spaceNumber}`,
      requestId,
      offerId,
      spaceId,
      requestedFrom: request.requestedFrom,
      requestedTo: request.requestedTo,
      read: false,
      createdAt: new Date().toISOString(),
    };

    await kv.set(`notification:${notificationId}`, notification);

    // Add to requester's notifications
    const requesterNotifications = await kv.get(`user:${request.postedBy}:notifications`) || [];
    requesterNotifications.unshift(notificationId);
    await kv.set(`user:${request.postedBy}:notifications`, requesterNotifications);
    
    return c.json({ success: true, offer, notification });
  } catch (error) {
    console.log(`Error creating offer: ${error}`);
    return c.json({ error: String(error) }, 500);
  }
});

// Get user notifications
app.get("/make-server-48e86749/notifications/:userId", async (c) => {
  try {
    const userId = c.req.param("userId");
    const notificationIds = await kv.get(`user:${userId}:notifications`) || [];
    
    const notifications = [];
    for (const notificationId of notificationIds) {
      const notification = await kv.get(`notification:${notificationId}`);
      if (notification) {
        notifications.push(notification);
      }
    }
    
    return c.json({ notifications });
  } catch (error) {
    console.log(`Error fetching notifications: ${error}`);
    return c.json({ error: String(error) }, 500);
  }
});

Deno.serve(app.fetch);
