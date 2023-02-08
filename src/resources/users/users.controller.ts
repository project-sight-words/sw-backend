import { Controller, Get, NotFoundException, Param } from "@nestjs/common";
import { NotFoundError } from "rxjs";
import { User } from "../../entities/user.entities";
import { UsersService } from "./users.service";

@Controller("/users")
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Get(":email")
  async getByEmail(@Param("email") email: string): Promise<User> {
    const u = await this.usersService.getByEmail(email);
    if (!u) throw new NotFoundException();
    return u;
  }
}