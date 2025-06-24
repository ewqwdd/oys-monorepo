const { redis } = require("./redis");
require("dotenv").config();
const qs = require('query-string');

const axios = require("axios");

const zoom = axios.create({
  baseURL: "https://api.zoom.us/v2",
});

const fetchToken = async () => {

  const { data } = await axios.post(
    "https://zoom.us/oauth/token",
    qs.stringify({
      grant_type: "account_credentials",
      account_id: process.env.ZOOM_ACCOUNT_ID,
    }),
    {
      headers: {
        Authorization: `Basic ${Buffer.from(
          `${process.env.ZOOM_CLIENT_ID}:${process.env.ZOOM_CLIENT_SECRET}`
        ).toString("base64")}`,
      },
    }
  );
  
  await redis.set("zoom_token", data.access_token);
  return data.access_token;
};

zoom.interceptors.request.use(async (config) => {
  let token = await redis.get("zoom_token");
  if (!token) {
    token = await fetchToken();
  }
  config.headers.Authorization = `Bearer ${token}`;
  return config;
});

zoom.interceptors.response.use(
  async (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    if (error.response.status !== 401) {
      return Promise.reject(error);
    }
    try {
        await redis.del("zoom_token");
      const token = await fetchToken();

      originalRequest.headers.Authorization = `Bearer ${token}`;

      return axios(originalRequest);
    } catch (err) {
      console.log(err);
      throw Promise.reject(err);
    }
  }
);

module.exports = { zoom };