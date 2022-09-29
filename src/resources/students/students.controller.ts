import { Controller, Get } from "@nestjs/common";
import { UsersRepository } from "resources/users/users.repository";

@Controller("/students")
export class StudentsController {
  constructor(private readonly usersRepository: UsersRepository) { }

  @Get()
  getHello(): String {
    return "";
  }
}