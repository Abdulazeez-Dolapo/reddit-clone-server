// Third party libraries
import argon2 from "argon2"

// Entities
import { User } from "src/entities/User"

// Types and Decorators
import { MyContext } from "src/types"
import {
	Resolver,
	Ctx,
	Arg,
	Mutation,
	InputType,
	Field,
	ObjectType,
} from "type-graphql"

// Use this to group all your arguments and make them reusable
@InputType()
class UsernamePasswordInput {
	@Field()
	username: string

	@Field()
	password: string
}

// local types
@ObjectType()
class FieldError {
	@Field()
	field: string

	@Field()
	message: string
}

@ObjectType()
class UserResponse {
	@Field(() => [FieldError], { nullable: true })
	errors?: FieldError[]

	@Field()
	user?: User
}

@Resolver()
export class UserResolver {
	// Register user
	@Mutation(() => User)
	async register(
		@Arg("options") options: UsernamePasswordInput,
		@Ctx() { em }: MyContext
	) {
		const hashedPassword = await argon2.hash(options.password)
		const user = em.create(User, {
			username: options.username,
			password: hashedPassword,
		})
		await em.persistAndFlush(user)

		return user
	}
}
