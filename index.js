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

app.post('/auth/signup', async (req, res) => {
    console.log('check')
    const data = await req.body;
    // const email = 'check@gmail.com'
    // const password = '34567876tghj'
    // const id = "4567"
    // const phone = "654334567"
    console.log(data)

    const obj = {
        "formFields": [
            { "id": "email", "value": email },
            { "id": "password", "value": password }
        ]
    }

    const response = await axios.post('http://localhost:8000/signup', obj, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'O5BCFdHwKHn8dOrpKCe2xd9abq' // Add any other headers as needed
        }
    });
    // const signup = await fetch("http://localhost:8000/signup", {
    //     method: "POST",
    //     headers: {
    //         // Automatically attach the session tokens in cookies
    //         "Content-Type": "application/json",
    //         "Authorization": "O5BCFdHwKHn8dOrpKCe2xd9abq"
    //     },
    //     credentials: "include", // This ensures cookies are sent with the request
    //     body: { email, password }
    // });

    console.log(response)

    // Validate the input
    // if (!email || !phone || !id) {
    //     return res.status(400).json({ message: 'All fields are required' });
    // }

    // Call SuperTokens to handle authentication
    // const data = await EmailPassword.signUp(email, password); // Example with email and ID for signup
    // console.log(data)
    // try {

    //     if (status === 'OK') {
    //         // Save additional fields to your database
    //         await Database.query(
    //             'INSERT INTO users (email, phone, id) VALUES (?, ?, ?)',
    //             [email, phone, id]
    //         );

    //         res.status(200).json({ message: 'Signup successful', user });
    //     } else {
    //         res.status(500).json({ message: 'Signup failed' });
    //     }
    // } catch (err) {
    //     res.status(500).json({ message: 'check', error: err });
    // }
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
        console.log(checkData, response)
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