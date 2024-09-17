const express = require("express")
const supertokens = require("supertokens-node")
const superTokensConfig = require("./superTokensConfig.js")
const cors = require("cors")
const pkg = require("supertokens-node/framework/express")
const { verifySession } = require("supertokens-node/recipe/session/framework/express")
const DotenvFlow = require("dotenv-flow")
const jwt = require("supertokens-node/recipe/jwt")

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

app.get("/", async (req, res) => {
    res.send('<h1>Node BackEnd Running Successfully</h1>')
})

app.use(errorHandler());

app.listen(dotEnv.PORT, () => {
    console.log("Back End Running On" + " " + dotEnv.PORT)
})