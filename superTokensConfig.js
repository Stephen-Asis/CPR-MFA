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



DotenvFlow.config()
const dotEnv = process.env

module.exports = {
    supertokens: {
        // this is the location of the SuperTokens core.
        connectionURI: dotEnv.SUPERTOKEN_CONNECTION_URI,
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
            signUpFeature: {
                formFields: [{
                    id: "ReferenceID"
                }, {
                    id: "PhoneNumber"
                }, {
                    id: "PortalUserID",
                }, {
                    id: "PortalUserType",
                }]
            }
        }),
        Passwordless.init({
            contactMethod: "EMAIL_OR_PHONE",
            flowType: "USER_INPUT_CODE_AND_MAGIC_LINK",
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
        jwt.init(),
        // totp.init(),
        Session.init(),
        Dashboard.init(),
        UserRoles.init()
    ],
};
