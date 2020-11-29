// Third party libraries
import "reflect-metadata"
import express from "express"
import { MikroORM } from "@mikro-orm/core"
import { ApolloServer } from "apollo-server-express"
import { buildSchema } from "type-graphql"
import redis from "redis"
import session from "express-session"
import connectRedis from "connect-redis"

// Config files
import mikroConfig from "./mikro-orm.config"

// Resolvers
import { PostResolver } from "./resolvers/post"
import { UserResolver } from "./resolvers/user"

// constants
import { PRODUCTION } from "./constants"
import { MyContext } from "./types"
const TEN_YEARS = 1000 * 60 * 60 * 24 * 365 * 10

const main = async () => {
	// Initialize
	const orm = await MikroORM.init(mikroConfig)
	// Run migration
	await orm.getMigrator().up()

	const app = express()

	// Setup redis
	const RedisStore = connectRedis(session)
	const redisClient = redis.createClient()

	app.use(
		session({
			name: "qid",
			store: new RedisStore({
				client: redisClient,
				disableTouch: true,
				// disableTTL: true,
			}),
			cookie: {
				maxAge: TEN_YEARS,
				httpOnly: true,
				sameSite: "lax", // crsf
				secure: PRODUCTION, // Cookie only works in https during production
			},
			saveUninitialized: false,
			secret: "keyboard cat", // TODO: Change to environment variables
			resave: false,
		})
	)

	const apolloServer = new ApolloServer({
		schema: await buildSchema({
			resolvers: [PostResolver, UserResolver],
			validate: false,
		}),
		context: ({ req, res }): MyContext => ({ em: orm.em, req, res }),
	})

	apolloServer.applyMiddleware({ app })

	app.listen(4000, () => console.log("Server started on port 4000..."))
}

main().catch(err => console.error(err))

// Notes:
// 1. It's important for the session middleware to be written
//		before the apollo middleware because it will be
// 		used inside the apollo middleware
