/** The text of the welcome email. */
export const welcomeTemplate = (fullName: string) => ({
  subject: "Welcome to Gaari Bhara",
  text:
    `Hello ${fullName},\n\n` +
    `Your Gaari Bhara account is ready. You can now post and find vehicles for rent.\n` +
    `Payment is between the two people. Gaari Bhara does not handle money.\n\n` +
    `Gaari Bhara team`,
});
