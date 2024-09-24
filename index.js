const express = require("express")
const supertokens = require("supertokens-node")
const superTokensConfig = require("./superTokensConfig.js")
const cors = require("cors")
const pkg = require("supertokens-node/framework/express")
const { verifySession } = require("supertokens-node/recipe/session/framework/express")
const DotenvFlow = require("dotenv-flow")
const jwt = require("supertokens-node/recipe/jwt")
const UserMetadata = require("supertokens-node/recipe/usermetadata");
const { signUp } = require("supertokens-node/recipe/emailpassword");
// const EmailPassword = require('supertokens-node/recipe/emailpassword');
const axios = require("axios")
const Multitenancy = require("supertokens-node/recipe/multitenancy");
const Tenant = require('supertokens-node/recipe/multitenancy');
const { EmailPassword } = require("supertokens-node/recipe/emailpassword");

const { middleware, errorHandler, SessionRequest } = pkg

supertokens.init(superTokensConfig);

const app = express()

DotenvFlow.config()
const dotEnv = process.env

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
    cors({
        origin: dotEnv.WEBSITE_DOMAIN,
        allowedHeaders: ["content-type", ...supertokens.getAllCORSHeaders()],
        methods: ["GET", "PUT", "POST", "DELETE"],
        credentials: true,
    })
);

app.use(middleware());

app.use((req, res, next) => {
    req.tenantId = "public"; // Add the tenant ID to the request object
    next();
});

app.get("/sessioninfo", verifySession(), async (req, res) => {
    let session = req.session;
    res.json({
        sessionHandle: session?.getHandle(),
        userId: session?.getUserId(),
        accessTokenPayload: session?.getAccessTokenPayload(),
    });
});

async function createCheck(payload) {
    let jwtResponse = await jwt.createJWT({
        ...payload,
        source: "microservice"
    }, 7200);
    if (jwtResponse.status === "OK") {
        // Send JWT as Authorization header to M2
        return jwtResponse;
    }
    throw new Error("Unable to create JWT. Should never come here.")
}

app.post("/getJwtToken", verifySession(), async (req, res) => {
    let token = await createCheck(req.body)
    res.json({ token })
})

app.get('/set-cookie', (req, res) => {
    res.cookie('myCookie', 'value', {
        sameSite: 'None', // or 'Lax' / 'Strict'secure: true,     // Ensure to set this if using SameSite=None    });     res.send('Cookie set'); });
    })
})

app.post('/register', async (req, res) => {
    const data = await req.body;
    const obj = {
        "formFields": [
            { "id": "email", "value": data.email },
            { "id": "password", "value": data.password }
        ]
    }

    const response = await axios.post(`${dotEnv.API_DOMAIN}/signup`, obj, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `${dotEnv.SUPERTOKEN_API_KEY}` // Add any other headers as needed
        }
    });

    if (response.data.status == "OK") {
        let checkData = {}

        Object.keys(data).map((val) => {
            if (val != "email" && val != "password") {
                checkData = { ...checkData, ...{ [val]: data[val] } }
            }
        })
        await UserMetadata.updateUserMetadata(response.data.user.id, checkData);
        res.status(200).json({
            message: 'Signup successful',
        });
    } else {
        res.status(500).json({
            message: 'Internal Serval Error',
        });
    }

})

app.put("/meta-data-update", async (req, res) => {
    console.log(req.body)
    await UserMetadata.updateUserMetadata(req.body.id, req.body);
})

// app.post("/change-password", async (req, res) => {
//     await EmailPassword.sendPasswordResetEmail("stephen.j@tekclansolutions.com");
// })

app.get("/", async (req, res) => {
    // let resp = await Multitenancy.getTenant("llsdev")
    let resp = await Multitenancy.listAllTenants()

    // let response = await Multitenancy.createOrUpdateTenant("stephen", {
    //     firstFactors: ["emailpassword"]
    // });s
    res.send('<h1>Node Running Successfully</h1>')
})

app.use(errorHandler());

app.listen(dotEnv.PORT, () => {
    console.log("Back End Running On" + " " + dotEnv.PORT)
})