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
// const { verifySession } = require('supertokens-node/recipe/session')


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
            // override: {
            //     apis: (originalImplementation) => {
            //         return {
            //             ...originalImplementation,
            //             signUpPOST: async function (input) {
            //                 console.log(input,'input')
            //                 const { formFields } = input;
                            
            //                 // Extract the extra fields
            //                 const fullName = formFields.find(field => field.id === 'fullName').value;
            //                 const phoneNumber = formFields.find(field => field.id === 'phoneNumber').value;
            //                 console.log(fullName,phoneNumber,'phoneNumber')
            //                 // const userId = req.session.getUserId();
                            
            //                 // Handle or store these fields as needed
            //                 // e.g., Store them in user metadata or a custom database table
                            
            //                 // Continue with the original signup process
            //                 const data = await originalImplementation.signUpPOST(input)
            //                 console.log(data.session.userId,'await originalImplementation.signUpPOST(input);')
            //                 await UserMetadata.updateUserMetadata(data.session.userId, { formFields: formFields });
            //                 return data;
            //             }
            //         }
            //     }
            // },
            // signUpFeature: {
            //     formFields: [{
            //         id: "ReferenceID"
            //     }, {
            //         id: "PhoneNumber"
            //     }, {
            //         id: "PortalUserID",
            //     }, {
            //         id: "PortalUserType",
            //     }]
            // }
            // signUpFeature: {
            //     formFields: [
            //         {
            //             id: 'fullName',
            //             label: 'Full Name',
            //             placeholder: 'Enter your full name',
            //             optional: false,
            //             validate: async (value) => {
            //                 // Example validation: Check if the field is not empty
            //                 if (value.length === 0) {
            //                     return 'Full name is required';
            //                 }
            //                 return undefined; // Validation passed
            //             }
            //         },
            //         {
            //             id: 'phoneNumber',
            //             label: 'Phone Number',
            //             placeholder: 'Enter your phone number',
            //             optional: true, // This field is optional
            //         },
            //     ],
            // },
            // signUpFeature:{
            //     phoneNumber:''
            // }
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
        UserMetadata.init(),
        jwt.init(),
        // totp.init(),
        Session.init(),
        Dashboard.init(),
        UserRoles.init()
    ],
};
