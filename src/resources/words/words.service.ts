import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Word, WordDifficulty } from "entities/word.entities";
import { Repository } from "typeorm";
import { S3Service } from "resources/media/s3.service";

@Injectable()
export class WordsService {
  constructor(
    private readonly s3Service: S3Service,
    @InjectRepository(Word)
    private readonly wordRepository: Repository<Word>,
  ) {}

  // TODO include creator ID
  async create(
    word: string,
    definition: string,
    sentence: string,
    image: Express.Multer.File,
    audio: Express.Multer.File,
    comment: string | null = null,
    difficulty: WordDifficulty = "Basic",
  ): Promise<Word> {
    const hasHomonym = await this.wordRepository.findOneBy({
      word: word,
      sentence: sentence,
    });
    if (!!hasHomonym)
      throw new BadRequestException(
        `${word} with"${sentence}" already exists.`,
      );

    const imageLink = await this.s3Service.uploadFile(image);
    if (!imageLink)
      throw new BadRequestException("Invalid/Missing image given");
    const audioLink = await this.s3Service.uploadFile(audio);
    if (!audioLink)
      throw new BadRequestException("Invalid/Missing audio given");

    return await this.wordRepository.save({
      word: word,
      definition: definition,
      sentence: sentence,
      difficulty: difficulty,
      comment: comment,
      images: [
        {
          link: imageLink,
        },
      ],
      audios: [
        {
          link: audioLink,
        },
      ],
    });
  }

  findAll() {
    return this.wordRepository.find({
      withDeleted: false,
      relations: {
        audios: true,
        images: true,
      },
    });
  }

  findOneById(id: string) {
    return this.wordRepository.findOne({
      withDeleted: false,
      relations: {
        audios: true,
        images: true,
      },
      where: {
        id: id,
      },
    });
  }

  async update(
    id: string,
    sentence: string,
    comment: string | null,
    difficulty: WordDifficulty,
    image: Express.Multer.File,
    audio: Express.Multer.File,
  ) {
    const word = await this.findOneById(id);
    if (!word) throw new NotFoundException("Word not found");

    const hasHomonym = await this.wordRepository.findOneBy({
      word: word.word,
      sentence: sentence,
    });
    if (!!hasHomonym && hasHomonym.id !== word.id)
      throw new BadRequestException(
        `${word.word} with"${sentence}" already exists.`,
      );

    word.sentence = sentence;
    word.comment = comment;
    word.difficulty = difficulty;

    const imageLink = await this.s3Service.uploadFile(image);
    if (!imageLink)
      throw new BadRequestException("Invalid/Missing image given");
    const audioLink = await this.s3Service.uploadFile(audio);
    if (!audioLink)
      throw new BadRequestException("Invalid/Missing audio given");

    if (!word.images || !word.audios) throw new InternalServerErrorException();

    word.images[0].link = imageLink;
    word.audios[0].link = audioLink;

    return await this.wordRepository.save(word);
  }

  deleteById(id: string) {
    return this.wordRepository.softDelete({
      id: id,
    });
  }
}
