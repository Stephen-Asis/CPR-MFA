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
const EmailPassword = require('supertokens-node/recipe/emailpassword');
const axios = require("axios")
// const SuperTokens = require('supertokens-node');

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

app.use((req, res, next) => {
    req.tenantId = "llsdev"; // Add the tenant ID to the request object
    next();
});

app.use(middleware());

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

app.post('/register', async (req, res) => {
    const data = await req.body;
    const obj = {
        "formFields": [
            { "id": "email", "value": data.email },
            { "id": "password", "value": data.password }
        ]
    }

console.log(obj,'objCheck',data)
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
        // console.log(checkData, response)
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

app.get("/", async (req, res) => {
    res.send('<h1>Node Running Successfully</h1>')
})

app.use(errorHandler());

app.listen(dotEnv.PORT, () => {
    console.log("Back End Running On" + " " + dotEnv.PORT)
})