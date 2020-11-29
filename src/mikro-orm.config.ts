import { MikroORM } from "@mikro-orm/core"
import { PRODUCTION } from "./constants"
import { Post } from "./entities/Post"
import path from "path"
import { User } from "./entities/User"

export default {
	migrations: {
		path: path.join(__dirname, "./migrations"),
		pattern: /^[\w-]+\d+\.[tj]s$/, // regex pattern for the migration files
	},
	dbName: "reddit-clone",
	type: "postgresql",
	debug: !PRODUCTION,
	entities: [Post, User],
	user: "postgres",
	password: "postgres",
} as Parameters<typeof MikroORM.init>[0]
