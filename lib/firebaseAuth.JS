
// const renewToken = async (user: User) => {
//   try {
//     await user.getIdToken(true);
//     console.log("Token renewed successfully");
//   } catch (error) {
//     console.log("Error renewing token:", error);
//   }
// };

// export const addTokenRenewalListener = () => {
//   auth.onIdTokenChanged(async (user) => {
//     if (user) {
//       const nowInSeconds = Math.floor(Date.now() / 1000);
//       const tokenResult = await user.getIdTokenResult();
//       const expirationTime = Math.floor(+tokenResult.expirationTime / 1000);
//       const expiresIn = expirationTime - nowInSeconds;
//       if (expiresIn <= 0) {
//         await renewToken(user);
//         console.log("renewing id token in firebaseAuth");
//       }
//     }
//   });
// };
