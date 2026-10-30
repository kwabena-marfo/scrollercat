import { Hono } from "hono";
import publicErrorMessage from "@/helpers/publicErrorMessage";

import getDashboardStats from "@/controllers/dashboard/stats";
import listProducts from "@/controllers/products/list";
import saveProduct from "@/controllers/products/save";
import removeProduct from "@/controllers/products/remove";
import { saveCategory, removeCategory } from "@/controllers/categories";
import {
  listShippingMethods,
  saveShippingMethod,
  removeShippingMethod,
} from "@/controllers/shipping";
import { listOrders, updateOrder } from "@/controllers/orders";
import { listRequests, quoteRequest, updateRequest } from "@/controllers/requests";
import listCustomers from "@/controllers/customers/list";
import listPayments from "@/controllers/payments/list";

export type AuthState = {
  admin: any;
};

// Mounted after authoriseAdmin() — every route here has a signed-in admin.
// Same shape as myklesia: GET …/get to read, POST …/create|update|delete
// to write, with the record's id in ?id=.
export const app = new Hono<{ Variables: AuthState }>();

app.get("/dashboard", async ({ json }) => {
  try {
    return json(await getDashboardStats());
  } catch (err: any) {
    return json(publicErrorMessage(err), 500);
  }
});

// ---------------- Products
app.get("/products/get", async ({ json }) => {
  try {
    return json(await listProducts());
  } catch (err: any) {
    return json(publicErrorMessage(err), 500);
  }
});

app.post("/products/create", async ({ req, json }) => {
  try {
    await saveProduct({ body: await req.json() });
    return json("Product added");
  } catch (err: any) {
    return json(publicErrorMessage(err), 500);
  }
});

app.post("/products/update", async ({ req, json }) => {
  try {
    await saveProduct({ id: req.query("id"), body: await req.json() });
    return json("Product saved");
  } catch (err: any) {
    return json(publicErrorMessage(err), 500);
  }
});

app.post("/products/delete", async ({ req, json }) => {
  try {
    await removeProduct(req.query("id"));
    return json("Product deleted");
  } catch (err: any) {
    return json(publicErrorMessage(err), 500);
  }
});

// ---------------- Categories (listed with products)
app.post("/categories/create", async ({ req, json }) => {
  try {
    await saveCategory({ body: await req.json() });
    return json("Category added");
  } catch (err: any) {
    return json(publicErrorMessage(err), 500);
  }
});

app.post("/categories/update", async ({ req, json }) => {
  try {
    await saveCategory({ id: req.query("id"), body: await req.json() });
    return json("Category renamed");
  } catch (err: any) {
    return json(publicErrorMessage(err), 500);
  }
});

app.post("/categories/delete", async ({ req, json }) => {
  try {
    await removeCategory(req.query("id"));
    return json("Category deleted");
  } catch (err: any) {
    return json(publicErrorMessage(err), 500);
  }
});

// ---------------- Shipping methods
app.get("/shipping/get", async ({ json }) => {
  try {
    return json(await listShippingMethods());
  } catch (err: any) {
    return json(publicErrorMessage(err), 500);
  }
});

app.post("/shipping/create", async ({ req, json }) => {
  try {
    await saveShippingMethod({ body: await req.json() });
    return json("Delivery option added");
  } catch (err: any) {
    return json(publicErrorMessage(err), 500);
  }
});

app.post("/shipping/update", async ({ req, json }) => {
  try {
    await saveShippingMethod({ id: req.query("id"), body: await req.json() });
    return json("Delivery option saved");
  } catch (err: any) {
    return json(publicErrorMessage(err), 500);
  }
});

app.post("/shipping/delete", async ({ req, json }) => {
  try {
    await removeShippingMethod(req.query("id"));
    return json("Delivery option deleted");
  } catch (err: any) {
    return json(publicErrorMessage(err), 500);
  }
});

// ---------------- Orders
app.get("/orders/get", async ({ json }) => {
  try {
    return json(await listOrders());
  } catch (err: any) {
    return json(publicErrorMessage(err), 500);
  }
});

app.post("/orders/update", async ({ req, json }) => {
  try {
    await updateOrder({ id: req.query("id"), body: await req.json() });
    return json("Order updated");
  } catch (err: any) {
    return json(publicErrorMessage(err), 500);
  }
});

// ---------------- Sourcing requests
app.get("/requests/get", async ({ json }) => {
  try {
    return json(await listRequests());
  } catch (err: any) {
    return json(publicErrorMessage(err), 500);
  }
});

app.post("/requests/quote", async ({ req, json }) => {
  try {
    await quoteRequest({ id: req.query("id"), body: await req.json() });
    return json("Quote saved — the customer can now pay from the tracking page");
  } catch (err: any) {
    return json(publicErrorMessage(err), 500);
  }
});

app.post("/requests/update", async ({ req, json }) => {
  try {
    await updateRequest({ id: req.query("id"), body: await req.json() });
    return json("Request updated");
  } catch (err: any) {
    return json(publicErrorMessage(err), 500);
  }
});

// ---------------- Customers & payments
app.get("/customers/get", async ({ json }) => {
  try {
    return json(await listCustomers());
  } catch (err: any) {
    return json(publicErrorMessage(err), 500);
  }
});

app.get("/payments/get", async ({ json }) => {
  try {
    return json(await listPayments());
  } catch (err: any) {
    return json(publicErrorMessage(err), 500);
  }
});

export default app;
