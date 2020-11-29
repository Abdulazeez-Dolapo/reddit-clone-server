// Entities
import { Post } from "src/entities/Post"

// Types
import { MyContext } from "src/types"
import { Resolver, Query, Ctx, Arg, Int, Mutation } from "type-graphql"

@Resolver()
export class PostResolver {
	// Get all posts
	@Query(() => [Post])
	posts(@Ctx() { em }: MyContext): Promise<Post[]> {
		return em.find(Post, {})
	}

	// get a single post using ID
	@Query(() => Post, { nullable: true })
	post(
		@Arg("id", () => Int) id: number,
		@Ctx() { em }: MyContext
	): Promise<Post | null> {
		return em.findOne(Post, { id })
	}

	// Create a new post
	@Mutation(() => Post)
	async createPost(
		@Arg("title") title: string,
		@Ctx() { em }: MyContext
	): Promise<Post> {
		const post = em.create(Post, { title })
		await em.persistAndFlush(post)
		return post
	}

	// Update a post
	@Mutation(() => Post, { nullable: true })
	async updatePost(
		@Arg("id") id: number,
		@Arg("title", () => String, { nullable: true }) title: string,
		@Ctx() { em }: MyContext
	): Promise<Post | null> {
		const post = await em.findOne(Post, { id })

		if (!post) return null

		if (typeof title !== "undefined") {
			post.title = title
			await em.persistAndFlush(post)
		}

		return post
	}

	// Delete a post
	@Mutation(() => Boolean)
	async deletePost(
		@Arg("id") id: number,
		@Ctx() { em }: MyContext
	): Promise<Boolean> {
		try {
			await em.nativeDelete(Post, { id })
			return true
		} catch (error) {
			console.log(error)
			return false
		}
	}
}

// Notes
// if a field is not required, you can make it nullable {nullable: true}
// If you make something nullable, you must explicitly set the type () => String as the second argument
