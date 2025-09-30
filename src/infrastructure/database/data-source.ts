import "reflect-metadata"
import { DataSource } from "typeorm"
import { User } from "../../domain/entities/User"
import { Ticket } from "../../domain/entities/Ticket"
import { Sprint } from "../../domain/entities/Sprint"
import { Comment } from "../../domain/entities/Comment"
import { Image } from "../../domain/entities/Image"
import { Test } from "../../domain/entities/Test"

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "5438"),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  synchronize: true,
  logging: false,
  entities: [
    User,
    Ticket,
    Sprint,
    Comment,
    Image,
    Test,
  ],
  migrations: [],
  subscribers: [],
})