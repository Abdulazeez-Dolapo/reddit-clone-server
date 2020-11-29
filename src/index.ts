// Third party libraries
import "reflect-metadata"
import express from "express"
import { MikroORM } from "@mikro-orm/core"
import { ApolloServer } from "apollo-server-express"
import { buildSchema } from "type-graphql"

// Config files
import mikroConfig from "./mikro-orm.config"

// Resolvers
import { PostResolver } from "./resolvers/post"
import { UserResolver } from "./resolvers/user"

const main = async () => {
	// Initialize
	const orm = await MikroORM.init(mikroConfig)
	// Run migration
	await orm.getMigrator().up()

	const app = express()

	const apolloServer = new ApolloServer({
		schema: await buildSchema({
			resolvers: [PostResolver, UserResolver],
			validate: false,
		}),
		context: () => ({ em: orm.em }),
	})

	apolloServer.applyMiddleware({ app })

	app.listen(4000, () => console.log("Server started on port 4000..."))
}

main().catch(err => console.error(err))
