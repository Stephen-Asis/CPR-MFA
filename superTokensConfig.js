const EmailPassword = require("supertokens-node/recipe/emailpassword")
const Passwordless = require("supertokens-node/recipe/passwordless")
const Session = require("supertokens-node/recipe/session")
const Dashboard = require("supertokens-node/recipe/dashboard")
const MultiFactorAuth = require("supertokens-node/recipe/multifactorauth")
const AccountLinking = require("supertokens-node/recipe/accountlinking")
const EmailVerification = require("supertokens-node/recipe/emailverification")
const UserRoles = require("supertokens-node/recipe/userroles")
const DotenvFlow = require("dotenv-flow")
const jwt = require("supertokens-node/recipe/jwt")
const UserMetadata = require("supertokens-node/recipe/usermetadata");
const Tenant = require('supertokens-node/recipe/multitenancy');
const Multitenancy = require('supertokens-node/recipe/multitenancy');
const { SMTPService } = require("supertokens-node/recipe/passwordless/emaildelivery");

DotenvFlow.config()
const dotEnv = process.env

module.exports = {
    supertokens: {
        // this is the location of the SuperTokens core.
        connectionURI: `${dotEnv.SUPERTOKEN_CONNECTION_URI}`,
        apiKey: dotEnv.SUPERTOKEN_API_KEY
    },
    appInfo: {
        appName: "LLS-MFA",
        apiDomain: dotEnv.API_DOMAIN,
        websiteDomain: dotEnv.WEBSITE_DOMAIN,
        apiBasePath: "/",
    },
    // recipeList contains all the modules that you want to
    // use from SuperTokens. See the full list here: https://supertokens.com/docs/guides
    recipeList: [
        EmailPassword.init({
            // emailDelivery: {
            //     override: (originalImplementation) => {
            //         return {
            //             ...originalImplementation,
            //             sendEmail: async function (input) {
            //                 if (input.type === "PASSWORD_RESET") {
            //                     return originalImplementation.sendEmail({
            //                         ...input,
            //                         passwordResetLink: input.passwordResetLink.replace(
            //                             // This is: `${websiteDomain}${websiteBasePath}/reset-password`
            //                             "http://localhost:8080//reset-password",
            //                             "http://localhost:8080/#/login"
            //                             )
            //                     })
            //                 }
            //                 return originalImplementation.sendEmail(input);
            //             }
            //         }
            //     }
            // },
            override: {
                apis: (originalImplementation) => {
                    return {
                        ...originalImplementation,
                        passwordResetPOST: async function(input) {
                            
                            if (originalImplementation.passwordResetPOST === undefined) {
                                throw Error("Should never come here");
                            }

                            // First we call the original implementation
                            let response = await originalImplementation.passwordResetPOST(input);
                            
                            // Then we check if it was successfully completed
                            if (response.status === "OK") {
                                // TODO: post password reset logic
                            }
                            return response;
                        }
                    };
                },
            },
            // override: {
            //     apis: (originalImplementation) => {
            //         return {
            //             ...originalImplementation,
            //             // Override sign-up API to add tenant handling
            //             signUpPOST: async function (input) {
            //                 // Set the tenantId to "dev"
            //                 // input.tenantId = "llsdev"; // You can make this dynamic if needed
            //                 console.log(input)

            //                 return originalImplementation.signUpPOST(input);
            //             },
            //             signInPOST: async function (input) {
            //                 // Set the tenantId to "dev"
            //                 // input.tenantId = "llsdev"; // You can make this dynamic if needed
            //                 console.log(input)
            //                 if (input.session != undefined) {
            //                     // input.session.userDataInAccessToken.tId = "llsdev"
            //                     // input.session.tenantId = "llsdev"
            //                 }
            //                 // console.log(input.tenantId, 'tnuoh', input.session.userDataInAccessToken.tId, input.session.tenantId)

            //                 return originalImplementation.signInPOST(input);
            //             },
            //         };
            //     },
            // },
        }),
        Passwordless.init({
            contactMethod: "EMAIL_OR_PHONE",
            flowType: "USER_INPUT_CODE_AND_MAGIC_LINK", // or 'MAGIC_LINK' based on your configuration
            // emailDelivery: {
            //     service: new SMTPService({
            //         smtpSettings: {
            //             host: "smtp.gmail.com",
            //             authUsername: "", // this is optional. In case not given, from.email will be used
            //             password: "ipyt cpoi ndwj rmzz",
            //             port: 587,
            //             from: {
            //                 name: "Stephen",
            //                 email: "rogersstephen076@gmail.com",
            //             },
            //             secure: false
            //         },
            //         override: (originalImplementation) => {
            //             return {
            //                 ...originalImplementation,
            //                 getContent: async function ({
            //                     isFirstFactor,
            //                     codeLifetime, // amount of time the code is alive for (in MS)
            //                     email,
            //                     urlWithLinkCode, // magic link
            //                     userInputCode, // OTP
            //                 }) {
            //                     // this is for MFA login (only applicable if you are using MFA).
            //                     // In this case, the urlWithLinkCode will always be undefined since 
            //                     // we only support OTP based MFA and not link based MFA
            //                     return {
            //                         body: "EMAIL BODY dfgf hfggdfbc whefuer uf dcausdhnc fegudc sjbhb",
            //                         isHtml: true,
            //                         subject: "Login via MFA",
            //                         toEmail: email
            //                     }

            //                     // You can even call the original implementation and
            //                     // modify its content:

            //                     /*
            //                     let originalContent = await originalImplementation.getContent(input)
            //                     originalContent.subject = "My custom subject";
            //                     return originalContent;
            //                     */
            //                 }
            //             }
            //         }
            //     })
            // }
        }),
        EmailVerification.init({
            mode: "REQUIRED",
        }),
        AccountLinking.init({
            shouldDoAutomaticAccountLinking: async () => ({
                shouldAutomaticallyLink: true,
                shouldRequireVerification: true,
            }),
        }),
        MultiFactorAuth.init({
            firstFactors: ["emailpassword"],
            override: {
                functions: (oI) => ({
                    ...oI,
                    getMFARequirementsForAuth: () => [
                        {
                            oneOf: [
                                MultiFactorAuth.FactorIds.LINK_EMAIL,
                                MultiFactorAuth.FactorIds.OTP_EMAIL,
                                MultiFactorAuth.FactorIds.OTP_PHONE,
                            ],
                        },
                    ],
                }),
            },
        }),
        Multitenancy.init(),
        UserMetadata.init(),
        jwt.init(),
        // totp.init(),

        Dashboard.init(),
        UserRoles.init(),
        Session.init({
            cookieSameSite: "none"
        }),
    ],
};
