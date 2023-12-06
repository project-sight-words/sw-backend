import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import {
  ImageApprovalStatus,
  Progress,
  WordAttempt,
} from "entities/wordAttempt.entity";
import { S3Service } from "resources/media/s3.service";
import { Repository } from "typeorm";

@Injectable()
export class WordAttemptsService {
  constructor(
    @InjectRepository(WordAttempt)
    private readonly wordAttemptsRepository: Repository<WordAttempt>,
    private readonly s3Service: S3Service,
  ) {}

  async create(lessonWordId: string, studentId: string): Promise<WordAttempt> {
    const wordAttempt = new WordAttempt();
    wordAttempt.lessonWordId = lessonWordId;
    wordAttempt.studentId = studentId;
    const entity = await this.wordAttemptsRepository.save(wordAttempt);
    return entity;
  }

  async get() {
    const entities = await this.wordAttemptsRepository.find({
      relations: {
        quizAttempt: true,
      },
    });
    return entities;
  }

  async getById(id: string) {
    const entity = await this.wordAttemptsRepository.findOne({
      relations: {
        quizAttempt: true,
      },
      where: {
        id,
      },
    });
    if (!entity) throw new NotFoundException();
    return entity;
  }

  async update(id: string, progress: Progress, status: ImageApprovalStatus) {
    const wordAttempt = await this.wordAttemptsRepository.findOneBy({ id });
    if (!wordAttempt) throw new NotFoundException();

    wordAttempt.progress = progress;
    wordAttempt.imageApprovalStatus = status;
    wordAttempt.attemptedAt = new Date();

    const entity = await this.wordAttemptsRepository.save(wordAttempt);
    return entity;
  }

  async updatePersonalisedImage(
    id: string,
    personalisedImage: Express.Multer.File,
  ) {
    const wordAttempt = await this.wordAttemptsRepository.findOneBy({ id });
    if (!wordAttempt) throw new NotFoundException();

    const personalisedImageLink = await this.s3Service.uploadFile(
      personalisedImage,
    );
    if (!personalisedImageLink)
      throw new BadRequestException("Invalid/Missing image given");

    wordAttempt.personalisedImageLink = personalisedImageLink;
    // when update new personalized image, reset status to pending
    wordAttempt.imageApprovalStatus = ImageApprovalStatus.PENDING;
    wordAttempt.attemptedAt = new Date();

    const entity = await this.wordAttemptsRepository.save(wordAttempt);
    return entity;
  }

  remove(id: number) {
    return `This action removes a #${id} wordAttempt`;
  }
}
