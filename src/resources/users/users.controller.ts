import { Controller, Get, NotFoundException, Param } from "@nestjs/common";
import { User } from "entities/user.entities";
import { UsersService } from "./users.service";

@Controller("/users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get(":email")
  async findOneByEmail(@Param("email") email: string): Promise<User> {
    const u = await this.usersService.findOneByEmail(email);
    if (!u) throw new NotFoundException();
    return u;
  }
}
