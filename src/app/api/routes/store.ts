import { Hono } from "hono";
import publicErrorMessage from "@/helpers/publicErrorMessage";

import getHome, { getCategories } from "@/controllers/store/home";
import searchProducts from "@/controllers/store/search";
import getProduct from "@/controllers/store/product";
import createRequest from "@/controllers/store/createRequest";
import track from "@/controllers/store/track";
import { listShippingMethods } from "@/controllers/shipping";

// Public — the storefront. No session needed.
export const app = new Hono();

app.get("/home", async ({ json }) => {
  try {
    return json(await getHome());
  } catch (err: any) {
    return json(publicErrorMessage(err), 500);
  }
});

app.get("/search", async ({ req, json }) => {
  try {
    return json(await searchProducts(req.query()));
  } catch (err: any) {
    return json(publicErrorMessage(err), 500);
  }
});

app.get("/products/:slug", async ({ req, json }) => {
  try {
    return json(await getProduct(req.param("slug")));
  } catch (err: any) {
    return json(publicErrorMessage(err), 404);
  }
});

app.get("/categories", async ({ json }) => {
  try {
    return json(await getCategories());
  } catch (err: any) {
    return json(publicErrorMessage(err), 500);
  }
});

app.get("/shipping-methods", async ({ json }) => {
  try {
    const methods = await listShippingMethods();
    return json(methods.filter((m) => m.active));
  } catch (err: any) {
    return json(publicErrorMessage(err), 500);
  }
});

app.post("/requests/create", async ({ req, json }) => {
  try {
    return json(await createRequest(await req.json()));
  } catch (err: any) {
    return json(publicErrorMessage(err), 400);
  }
});

app.get("/track", async ({ req, json }) => {
  try {
    return json(await track({ code: req.query("code"), email: req.query("email") }));
  } catch (err: any) {
    return json(publicErrorMessage(err), 404);
  }
});

export default app;
