import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
  UseGuards
} from "@nestjs/common";
import { Access } from "decorators/abac.decorator";
import { Roles } from "decorators/roles.decorator";
import { ABAC } from "entities/abac.entities";
import { Role } from "entities/roles.entities";
import { JwtAuthGuard } from "resources/authentication/guards/jwt-auth.guard";
import {
  CreateTeacherDto,
  DeleteTeacherDto,
  GetTeacherDto,
  UpdateTeacherDto,
} from "./dto/teachers.dto";
import { TeachersService } from "./teachers.service";

@Controller("teachers")
@UseGuards(JwtAuthGuard)
export class TeachersController {
  constructor(private readonly teachersService: TeachersService) { }

  @Get()
  async get(): Promise<TeacherDto[]> {
    const teacherUsers = await this.teachersService.get();
    return TeacherDto.fromTeacherUsers(teacherUsers);
  }

  @Get("/mass")
  async getWithClassesAndCentres(): Promise<DetailedTeacherDto[]> {
    const teacherUsers = await this.teachersService.getWithClassesAndCentres();
    return DetailedTeacherDto.fromTeacherUsers(teacherUsers);
  }

  @Get(":id")
  async getById(@Param("id") id: string): Promise<TeacherDto> {
    const isUuid = Uuid.test(id);
    if (!isUuid) throw new BadRequestException("Invalid UUID");

    const teacherUser = await this.teachersService.findOneById(id);
    if (!teacherUser) throw new NotFoundException();

    return TeacherDto.fromTeacherUser(teacherUser);
  }

  @Post()
  @HttpCode(201)
  async create(
    @Body(new ParseArrayPipe({ items: CreateTeacherDto }))
    body: CreateTeacherDto[],
  ): Promise<TeacherDto[]> {
    const results = await this.teachersService.createMany(body); // TODO: add createdBy
    if (results.length > 0 && results[0] instanceof TeacherUser) {
      const teacherUsers = results as TeacherUser[];
      return TeacherDto.fromTeacherUsers(teacherUsers);
    }
    throw new BadRequestException(results);
  }

  @Put(":id")
  async updateById(
    @Param("id") id: string,
    @Body() body: Omit<CreateTeacherDto, "email">,
  ): Promise<TeacherDto> {
    const isUuid = Uuid.test(id);
    if (!isUuid) throw new BadRequestException("Invalid UUID");

    const teacherUser = await this.teachersService.updateById(id, body); // TODO: add updatedBy
    if (!teacherUser) throw new NotFoundException();

    return TeacherDto.fromTeacherUser(teacherUser);
  }

  @Delete(":id")
  async deleteById(@Param("id") id: string): Promise<TeacherDto> {
    const isUuid = Uuid.test(id);
    if (!isUuid) throw new BadRequestException("Invalid UUID");

    const teacherUser = await this.teachersService.findOneById(id);
    if (!teacherUser) throw new NotFoundException();

    await this.teachersService.deleteById(id);
    return TeacherDto.fromTeacherUser(teacherUser);
  }
}
