export default {
  providers: [
    {
      domain: process.env.JWT_DOMAIN,
      applicationID: process.env.JWT_APP_ID,
    },
  ],
};
