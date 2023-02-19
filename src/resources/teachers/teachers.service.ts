import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from "@nestjs/common";
import {
  CreateTeacherDto,
  TeacherDto,
  UpdateTeacherDto,
} from "./dto/teachers.dto";
import { Teacher, TeacherUser } from "entities/teacher.entities";
import { UsersService } from "resources/users/users.service";
import { InjectRepository } from "@nestjs/typeorm";
import { DataSource, EntityManager, In, Repository } from "typeorm";

@Injectable()
export class TeachersService {
  constructor(
    private readonly usersService: UsersService,
    private readonly dataSource: DataSource,
    @InjectRepository(Teacher)
    private readonly teacherRepository: Repository<Teacher>,
    @InjectRepository(TeacherUser)
    private readonly teacherUserRepository: Repository<TeacherUser>,
  ) {}

  private readonly loggerService = new Logger("TeachersService");

  async searchByIds(ids: Set<string>): Promise<Teacher[]> {
    const teacherUsers = await this.teacherUserRepository.find({
      relations: {
        user: true,
        teacher: true,
      },
      withDeleted: false,
      where: {
        teacher: {
          staffId: In(Array.from(ids)),
        },
      },
    });
    const teachers = teacherUsers.map((tu) => Teacher.fromTeacherUser(tu));
    return teachers;
  }

  async get(): Promise<Teacher[]> {
    const teacherUsers = await this.teacherUserRepository.find({
      relations: {
        user: true,
        teacher: true,
      },
      withDeleted: false,
    });
    const teachers = teacherUsers.map((tu) => Teacher.fromTeacherUser(tu));
    return teachers;
  }

  async findOneById(uuid: string): Promise<Teacher> {
    const teacherUser = await this.teacherUserRepository.findOne({
      relations: {
        user: true,
        teacher: true,
      },
      withDeleted: false,
      where: {
        teacher: { id: uuid },
      },
    });
    if (!teacherUser) throw new NotFoundException();
    const teacher = Teacher.fromTeacherUser(teacherUser);
    return teacher;
  }

  async updateById(
    uuid: string,
    updateTeacherDto: UpdateTeacherDto,
    updatedBy: string | null = null,
  ): Promise<Teacher> {
    const { name, staffId } = updateTeacherDto;
    await this.teacherRepository
      .createQueryBuilder()
      .select()
      .from(Teacher, "teachers")
      .where({ id: uuid })
      .update()
      .set({
        name,
        staffId,
        updatedBy,
      })
      .execute();
    return this.findOneById(uuid);
  }

  async deleteById(uuid: string): Promise<void> {
    const results = await this.teacherUserRepository
      .createQueryBuilder()
      .softDelete()
      .where("teacher_id = :teacherId", { teacherId: uuid })
      .andWhere("deleted_at IS NULL")
      .execute();
    if (results.affected && results.affected !== 1)
      throw new InternalServerErrorException();
  }

  async createMany(teacherDtos: CreateTeacherDto[]): Promise<TeacherDto[]> {
    return await this.dataSource.transaction(async (entityManager) => {
      const createdTeachers = [];
      for (const teacherDto of teacherDtos) {
        try {
          const teacher = await this.createOne(teacherDto, entityManager);
          createdTeachers.push(teacher);
        } catch (e: unknown) {
          this.loggerService.error(e);
          const errorMessages = await this.validateAll(
            teacherDtos,
            entityManager,
          );
          throw new BadRequestException(errorMessages);
        }
      }
      return createdTeachers;
    });
  }

  async createOne(
    teacherDto: CreateTeacherDto,
    entityManager: EntityManager,
    createdBy: string | null = null,
  ): Promise<TeacherDto> {
    const { email, name, staffId } = teacherDto;

    let user = await this.usersService.findOneByEmail(email);
    if (!user) user = await this.usersService.create(email);

    let teacher = await entityManager.findOneBy(Teacher, { staffId });
    if (!teacher)
      teacher = await entityManager.save(Teacher, { name, staffId });

    if (teacher.name !== name)
      throw new BadRequestException(
        "Teacher's recorded name does not match given name.",
      );

    const isExisting = await entityManager.findOneBy(TeacherUser, {
      teacherId: teacher.id,
      userId: user.id,
    });
    if (!isExisting) {
      await entityManager.save(TeacherUser, {
        teacher,
        user,
      });
    }

    return {
      email,
      id: teacher.id,
      name,
      staffId,
    };
  }

  private async validateAll(
    teacherDtos: CreateTeacherDto[],
    entityManager: EntityManager,
  ) {
    const errorMessages = [];
    for (let index = 0; index < teacherDtos.length; index++) {
      const { email, name, staffId } = teacherDtos[index];
      let teacherUser = await entityManager.findOne(TeacherUser, {
        relations: {
          user: true,
          teacher: true,
        },
        withDeleted: true,
        where: { teacher: { staffId } },
      });
      if (!teacherUser) {
        teacherUser = await entityManager.findOne(TeacherUser, {
          relations: {
            user: true,
            teacher: true,
          },
          withDeleted: false,
          where: { user: { email: email } },
        });
        if (teacherUser?.teacher) {
          errorMessages.push({
            index,
            message: `Email ${email} belongs to Teacher ${staffId}.`,
          });
        }

        continue;
      }

      switch (true) {
        case teacherUser.teacher.name !== name:
          errorMessages.push({
            index,
            message: `Teacher ${staffId} already exists as ${teacherUser.teacher.name}.`,
          });
          break;
        case teacherUser.user.email !== email:
          errorMessages.push({
            index,
            message: `Teacher ${staffId} has email ${teacherUser.user.email}.`,
          });
          break;
      }
    }

    return errorMessages;
  }
}
