import { EntityManager, IDatabaseDriver, Connection } from "@mikro-orm/core"
import { Request, Response } from "express"
import session from "express-session"

// I had to create this myself when the tutorial was working and mine
// wasn't. It could be wrong or there could be a better way to do it.
interface SessionData {
	userId?: number
}

export type MyContext = {
	em: EntityManager<any> & EntityManager<IDatabaseDriver<Connection>>
	req: Request & {
		session: session.Session & Partial<session.SessionData> & SessionData
	}
	res: Response
}
