// Third party libraries
import { Entity, PrimaryKey, Property } from "@mikro-orm/core"
import { Field, ObjectType } from "type-graphql"

@ObjectType()
@Entity()
export class User {
	@Field() // no need to put the type-graphql type as it is going to be inferred from the typescript's class
	@PrimaryKey()
	id!: number

	@Field(() => String)
	@Property({ type: "date" })
	createdAt = new Date()

	@Field(() => String)
	@Property({ type: "date", onUpdate: () => new Date() })
	updatedAt = new Date()

	@Field(() => String)
	@Property({ type: "text", unique: true })
	username!: string

	// No field property because we don't want the password to be accessible from the queries
	@Property({ type: "text" })
	password!: string
}
