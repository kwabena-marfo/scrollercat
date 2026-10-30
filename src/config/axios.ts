import axios from "axios";

// Relative (same-origin) in the browser, the public host on the server.
axios.defaults.baseURL =
  typeof window !== "undefined" ? "" : process.env.NEXT_PUBLIC_HOST;

export default axios;
