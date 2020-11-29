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

	@Field(() => User, { nullable: true })
	user?: User
}

@Resolver()
export class UserResolver {
	// Register user
	@Mutation(() => UserResponse)
	async register(
		@Arg("options") options: UsernamePasswordInput,
		@Ctx() { em }: MyContext
	): Promise<UserResponse> {
		if (options.username.length < 3) {
			return {
				errors: [
					{
						field: "username",
						message: "username must not be less than 3 characters",
					},
				],
			}
		}

		if (options.password.length < 8) {
			return {
				errors: [
					{
						field: "password",
						message: "password must not be less than 8 characters",
					},
				],
			}
		}

		const hashedPassword = await argon2.hash(options.password)
		const user = em.create(User, {
			username: options.username,
			password: hashedPassword,
		})

		try {
			await em.persistAndFlush(user)
		} catch (err) {
			if (err.code === "23505" || err.detail.includes("already taken")) {
				return {
					errors: [
						{
							field: "username",
							message: "username has already been taken",
						},
					],
				}
			}
		}

		return { user }
	}

	@Mutation(() => UserResponse)
	// Login user
	async login(
		@Arg("options") options: UsernamePasswordInput,
		@Ctx() { em }: MyContext
	): Promise<UserResponse> {
		const user = await em.findOne(User, { username: options.username })
		if (!user) {
			return {
				errors: [
					{
						field: "username",
						message: "invalid login credentials",
					},
				],
			}
		}

		const validPassword = await argon2.verify(user.password, options.password)
		if (!validPassword) {
			return {
				errors: [
					{
						field: "password",
						message: "invalid login credentials",
					},
				],
			}
		}

		return {
			user,
		}
	}
}
